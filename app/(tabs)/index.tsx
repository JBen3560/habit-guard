import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AuthScreen from '@/components/AuthScreen';
import {
  type NudgeRow,
  listPendingNudges,
  markNudgeSeen,
  markNudgesDelivered,
  subscribeToIncomingNudges,
} from '@/lib/nudges';
import {
  getConsecutiveAllSkippedDays,
  getTasks,
  incrementTaskSkippedCount,
  resetTaskSkippedCount,
  updateStreakCount,
  upsertCompletion,
} from '@/lib/tasks';
import {
  type PenaltyTrophyTitle,
  loadTrophies,
  resetPenaltyStateForCurrentUser,
  unlockPenaltyTrophy,
  unlockTrophy,
} from '@/lib/trophies';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import {
  type Friend,
  INITIAL_FRIENDS,
  INITIAL_TROPHIES,
  type Task,
  type Trophy,
  getColors,
  todayIdx,
} from '@/src/types';

import AchievementsTab from './achievements';
import HabitsTab from './habits';
import ProfileTab from './profile';

// Main tab container: holds shared app state and routes props to each tab.

type Tab = 'Habits' | 'Achievements' | 'Profile';

const TAB_ICONS: Record<Tab, React.ComponentProps<typeof MaterialIcons>['name']> = {
  Habits: 'today',
  Achievements: 'emoji-events',
  Profile: 'person',
};

const PENALTY_RESET_STORAGE_KEY = 'habit-guard:last-penalty-reset-date';

function formatEarnedDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Marks a trophy as earned once, preserving already-earned entries.
function unlockTrophyByTitle(trophies: Trophy[], title: string) {
  const trophy = trophies.find((item) => item.title === title);
  if (!trophy || trophy.earned) {
    return trophies;
  }

  const now = new Date();
  return trophies.map((item) =>
    item.title === title
      ? { ...item, earned: true, earnedDate: formatEarnedDate(now), earnedAt: now.getTime() }
      : item,
  );
}

// Evaluates conditions for unlocking trophies based on today's tasks and friends
function evaluateTrophies(tasks: Task[], friends: Friend[], trophies: Trophy[]) {
  const hasThreeFriends = friends.length >= 3;

  // First Step: any habit ever completed or has a streak started
  const hasCompletedAny = tasks.some((task) => task.completedToday || task.streakCount >= 1);

  // Sennight Soldier: any task with a 7+ day streak
  const hasSeven = tasks.some((task) => task.streakCount >= 7);

  // Hydration Hero: any Hydration task with a 10+ day streak
  const hydrationHero = tasks.some(
    (task) => task.category === 'Hydration' && task.streakCount >= 10,
  );

  // Month Master: any task with a 30+ day streak
  const monthMaster = tasks.some((task) => task.streakCount >= 30);

  // Iron Will: any task with a 100+ day streak
  const ironWill = tasks.some((task) => task.streakCount >= 100);

  // Early Bird: a habit was completed and it's currently before 7:00 AM
  const earlyBird = new Date().getHours() < 7 && tasks.some((task) => task.completedToday);

  let nextTrophies = trophies;

  if (hasCompletedAny) nextTrophies = unlockTrophyByTitle(nextTrophies, 'First Step');
  if (hasSeven)        nextTrophies = unlockTrophyByTitle(nextTrophies, 'Sennight Soldier');
  if (hydrationHero)   nextTrophies = unlockTrophyByTitle(nextTrophies, 'Hydration Hero');
  if (monthMaster)     nextTrophies = unlockTrophyByTitle(nextTrophies, 'Month Master');
  if (ironWill)        nextTrophies = unlockTrophyByTitle(nextTrophies, 'Iron Will');
  if (earlyBird)       nextTrophies = unlockTrophyByTitle(nextTrophies, 'Early Bird');
  if (hasThreeFriends) nextTrophies = unlockTrophyByTitle(nextTrophies, 'Social Butterfly');

  return nextTrophies;
}

// Fire-and-forget: persist any trophy that transitioned from locked → earned
function persistNewlyUnlocked(prev: Trophy[], next: Trophy[]) {
  for (const t of next) {
    if (t.earned && !prev.find((p) => p.id === t.id)?.earned) {
      unlockTrophy(t.title, t.description, t.icon).catch((err) =>
        console.error('unlockTrophy error:', err),
      );
    }
  }
}

// Main App component that manages state for tasks, trophies, and friends
export default function App() {
  const { loading, session } = useAuth();
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const insets = useSafeAreaInsets();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [trophies, setTrophies] = useState<Trophy[]>(INITIAL_TROPHIES);
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [activeTab, setActiveTab] = useState<Tab>('Habits');

  const processedNudgeIdsRef = React.useRef<Set<string>>(new Set());
  const nudgeQueueRef = React.useRef<NudgeRow[]>([]);
  const showingNudgeRef = React.useRef(false);

  const showNextNudge = useCallback(() => {
    if (showingNudgeRef.current) return;
    const nextNudge = nudgeQueueRef.current.shift();
    if (!nextNudge) return;

    showingNudgeRef.current = true;

    const senderName = nextNudge.sender_display_name?.trim() || 'A friend';
    const message =
      nextNudge.message?.trim() || `${senderName} nudged you to check in today.`;

    Alert.alert('Nudge', message, [
      {
        text: 'OK',
        onPress: () => {
          void markNudgeSeen(nextNudge.id).catch((error) => {
            console.error('markNudgeSeen error:', error);
          });

          showingNudgeRef.current = false;
          showNextNudge();
        },
      },
    ]);
  }, []);

  const enqueueNudges = useCallback(
    async (incomingNudges: NudgeRow[]) => {
      if (incomingNudges.length === 0) return;

      const fresh = incomingNudges.filter((nudge) => !processedNudgeIdsRef.current.has(nudge.id));
      if (fresh.length === 0) return;

      for (const nudge of fresh) {
        processedNudgeIdsRef.current.add(nudge.id);
      }

      nudgeQueueRef.current.push(...fresh);

      try {
        await markNudgesDelivered(fresh.map((nudge) => nudge.id));
      } catch (error) {
        console.error('markNudgesDelivered error:', error);
      }

      showNextNudge();
    },
    [showNextNudge],
  );

  const loadTasks = useCallback(async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }, []);

  const awardPenaltyTrophy = useCallback((title: PenaltyTrophyTitle) => {
    setTrophies((prevTrophies) => unlockTrophyByTitle(prevTrophies, title));
    unlockPenaltyTrophy(title).catch((err) => console.error('unlockPenaltyTrophy error:', err));
  }, []);

  useEffect(() => {
    if (!session) {
      setTasks([]);
      setTrophies(
        INITIAL_TROPHIES.map((t) => ({
          ...t,
          earned: false,
          earnedDate: undefined,
          earnedAt: undefined,
        })),
      );
      return;
    }

    let active = true;

    const bootstrap = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const resetKey = `${PENALTY_RESET_STORAGE_KEY}:${session.user.id}`;
        const lastReset = await AsyncStorage.getItem(resetKey);

        if (lastReset !== today) {
          await resetPenaltyStateForCurrentUser();
          await AsyncStorage.setItem(resetKey, today);
        }

        const [taskData, trophyData] = await Promise.all([getTasks(), loadTrophies()]);
        if (!active) return;

        setTasks(taskData);
        setTrophies(trophyData);
      } catch (err) {
        console.error('Failed to bootstrap session data:', err);
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    if (!session) {
      processedNudgeIdsRef.current.clear();
      nudgeQueueRef.current = [];
      showingNudgeRef.current = false;
      return;
    }

    let active = true;

    const fetchPending = async () => {
      try {
        const pending = await listPendingNudges();
        if (!active) return;
        await enqueueNudges(pending);
      } catch (error) {
        console.error('listPendingNudges error:', error);
      }
    };

    void fetchPending();

    const unsubscribeRealtime = subscribeToIncomingNudges(session.user.id, (nudge) => {
      if (!active) return;
      void enqueueNudges([nudge]);
    });

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void fetchPending();
      }
    });

    return () => {
      active = false;
      unsubscribeRealtime();
      appStateSubscription.remove();
    };
  }, [enqueueNudges, session]);

  if (loading) {
    return (
      <View style={[s.loadingScreen, { backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.blue} />
        <Text style={[s.loadingText, { color: C.sub }]}>Checking your account...</Text>
      </View>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  const updateTasks = (updater: (prev: Task[]) => Task[]) => {
    setTasks((prevTasks) => {
      const nextTasks = updater(prevTasks);
      setTrophies((prevTrophies) => {
        const nextTrophies = evaluateTrophies(nextTasks, friends, prevTrophies);
        persistNewlyUnlocked(prevTrophies, nextTrophies);
        return nextTrophies;
      });
      return nextTasks;
    });
  };

  // Update friends list and re-evaluate trophies based on new friend count
  const updateFriends: React.Dispatch<React.SetStateAction<Friend[]>> = (updater) => {
    setFriends((prevFriends) => {
      const nextFriends =
        typeof updater === 'function'
          ? (updater as (prev: Friend[]) => Friend[])(prevFriends)
          : updater;

      setTrophies((prevTrophies) => {
        const nextTrophies = evaluateTrophies(tasks, nextFriends, prevTrophies);
        persistNewlyUnlocked(prevTrophies, nextTrophies);
        return nextTrophies;
      });
      return nextFriends;
    });
  };

  // Toggle completion status of a habit, updating streak counts and ensuring skip/completion are mutually exclusive
  const toggleTaskComplete = (id: string) => {
    updateTasks((currentTasks) => {
      const task = currentTasks.find((t) => t.id === id);
      if (!task) return currentTasks;

      const nextCompleted = !task.completedToday;
      const nextSkipped = nextCompleted ? false : task.skippedToday;
      const nextCompletedOnceToday = task.completedOnceToday || nextCompleted;
      const nextSkippedOnceToday = task.skippedOnceToday || nextSkipped;

      const gainedCompletionToday = nextCompleted && !task.completedOnceToday;

      let nextStreak = task.streakCount;
      if (task.skippedOnceToday) {
        nextStreak = 0;
      } else if (gainedCompletionToday) {
        nextStreak = task.streakCount + 1;
      }

      upsertCompletion(id, nextCompleted, nextSkipped).catch((err) =>
        console.error('upsertCompletion error:', err),
      );

      if (nextStreak !== task.streakCount) {
        updateStreakCount(id, nextStreak).catch((err) =>
          console.error('updateStreakCount error:', err),
        );
      }

      if (gainedCompletionToday) {
        resetTaskSkippedCount(id).catch((err) =>
          console.error('resetTaskSkippedCount error:', err),
        );
      }

      return currentTasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completedToday: nextCompleted,
              skippedToday: nextSkipped,
              completedOnceToday: nextCompletedOnceToday,
              skippedOnceToday: nextSkippedOnceToday,
              streakCount: nextStreak,
            }
          : t,
      );
    });
  };

  // Toggle skip status of a habit, ensuring it cannot be marked as both completed and skipped
  const toggleTaskSkip = (id: string) => {
    let becameSkipped = false;
    let turnedSkippedOn = false;
    let brokeLongStreak = false;
    let nextTasksSnapshot: Task[] = [];

    updateTasks((currentTasks) => {
      const task = currentTasks.find((t) => t.id === id);
      if (!task) return currentTasks;

      const nextSkipped = !task.skippedToday;
      const nextCompleted = nextSkipped ? false : task.completedToday;
      const nextCompletedOnceToday = task.completedOnceToday || nextCompleted;
      const nextSkippedOnceToday = task.skippedOnceToday || nextSkipped;

      const firstSkipToday = nextSkipped && !task.skippedOnceToday;
      const nextStreak = firstSkipToday ? 0 : task.streakCount;

      becameSkipped = firstSkipToday;
      turnedSkippedOn = !task.skippedToday && nextSkipped;
      brokeLongStreak = firstSkipToday && task.streakCount >= 7;

      upsertCompletion(id, nextCompleted, nextSkipped).catch((err) =>
        console.error('upsertCompletion error:', err),
      );

      if (nextStreak !== task.streakCount) {
        updateStreakCount(id, nextStreak).catch((err) =>
          console.error('updateStreakCount error:', err),
        );
      }

      if (firstSkipToday && !task.completedOnceToday) {
        incrementTaskSkippedCount(id).catch((err) =>
          console.error('incrementTaskSkippedCount error:', err),
        );
      }

      nextTasksSnapshot = currentTasks.map((t) =>
        t.id === id
          ? {
              ...t,
              skippedToday: nextSkipped,
              completedToday: nextCompleted,
              completedOnceToday: nextCompletedOnceToday,
              skippedOnceToday: nextSkippedOnceToday,
              streakCount: nextStreak,
            }
          : t,
      );

      return nextTasksSnapshot;
    });

    if (!turnedSkippedOn) {
      return;
    }

    if (brokeLongStreak) {
      awardPenaltyTrophy('Streak Breaker');
    }

    const todayTasks = nextTasksSnapshot.filter((task) => task.active && task.days[todayIdx]);
    const skippedAllToday =
      todayTasks.length > 0 &&
      todayTasks.every((task) => task.skippedToday && !task.completedToday);

    if (!skippedAllToday) {
      return;
    }

    awardPenaltyTrophy('Slacker');

    getConsecutiveAllSkippedDays(7)
      .then((consecutiveDays) => {
        if (consecutiveDays >= 7) {
          awardPenaltyTrophy('Gone Missing');
        }
      })
      .catch((err) => console.error('getConsecutiveAllSkippedDays error:', err));
  };

  // Render the active tab and bottom navigation bar
  return (
    <View style={[s.root, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      <View style={[s.tab, activeTab === 'Habits' ? s.visible : s.hidden]}>
        <HabitsTab
          tasks={tasks}
          refreshTasks={loadTasks}
          onToggleComplete={toggleTaskComplete}
          onToggleSkip={toggleTaskSkip}
        />
      </View>

      <View style={[s.tab, activeTab === 'Achievements' ? s.visible : s.hidden]}>
        <AchievementsTab trophies={trophies} />
      </View>

      <View style={[s.tab, activeTab === 'Profile' ? s.visible : s.hidden]}>
        <ProfileTab tasks={tasks} friends={friends} setFriends={updateFriends} />
      </View>

      {/* Bottom Tab Bar */}
      <View
        style={[
          s.tabBar,
          {
            backgroundColor: C.card,
            borderTopColor: C.border,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          },
        ]}
      >
        {(['Habits', 'Achievements', 'Profile'] as Tab[]).map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={s.tabItem}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              {active && <View style={[s.tabIndicator, { backgroundColor: C.blue }]} />}
              <MaterialIcons name={TAB_ICONS[tab]} size={24} color={active ? C.blue : C.sub} />
              <Text
                style={[
                  s.tabLabel,
                  { color: C.sub },
                  active && { color: C.blue, fontWeight: '700' },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Styles for main App component and bottom tab navigation
const s = StyleSheet.create({
  root: { flex: 1 },

  // Each tab fills all available space
  tab: { flex: 1 },
  visible: { display: 'flex' },
  hidden: { display: 'none' },

  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText: { fontSize: 14, fontWeight: '600' },

  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    paddingTop: 4,
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 3,
    borderRadius: 2,
  },
  tabLabel: { fontSize: 11, fontWeight: '500' },
});
