import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AuthScreen from '@/components/AuthScreen';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import { INITIAL_TASKS } from '@/src/mockData';
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

function formatEarnedDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Marks a trophy as earned once, preserving already-earned entries.
function unlockTrophyByTitle(trophies: Trophy[], title: string) {
  const trophy = trophies.find((item) => item.title === title);
  if (!trophy || trophy.earned) {
    return trophies;
  }

  return trophies.map((item) =>
    item.title === title
      ? { ...item, earned: true, earnedDate: formatEarnedDate(new Date()) }
      : item,
  );
}

// Evaluates conditions for unlocking trophies based on today's tasks and friends
function evaluateTrophies(tasks: Task[], friends: Friend[], trophies: Trophy[]) {
  const todayTasks = tasks.filter((task) => task.active && task.days[todayIdx]);
  const skippedAllToday = todayTasks.length > 0 && todayTasks.every((task) => task.skippedToday);
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

  // Streak Breaker and Gone Missing require per-day history (tie to persistence)

  let nextTrophies = trophies;

  if (hasCompletedAny) nextTrophies = unlockTrophyByTitle(nextTrophies, 'First Step');
  if (hasSeven)        nextTrophies = unlockTrophyByTitle(nextTrophies, 'Sennight Soldier');
  if (hydrationHero)   nextTrophies = unlockTrophyByTitle(nextTrophies, 'Hydration Hero');
  if (monthMaster)     nextTrophies = unlockTrophyByTitle(nextTrophies, 'Month Master');
  if (ironWill)        nextTrophies = unlockTrophyByTitle(nextTrophies, 'Iron Will');
  if (earlyBird)       nextTrophies = unlockTrophyByTitle(nextTrophies, 'Early Bird');
  if (skippedAllToday) nextTrophies = unlockTrophyByTitle(nextTrophies, 'Slacker');
  if (hasThreeFriends) nextTrophies = unlockTrophyByTitle(nextTrophies, 'Social Butterfly');

  return nextTrophies;
}

// Main App component that manages state for tasks, trophies, and friends
export default function App() {
  const { loading, session } = useAuth();
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const insets = useSafeAreaInsets();

  // Save current state
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [trophies, setTrophies] = useState<Trophy[]>(INITIAL_TROPHIES);
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [activeTab, setActiveTab] = useState<Tab>('Habits');

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
      setTrophies((prevTrophies) => evaluateTrophies(nextTasks, friends, prevTrophies));
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

      setTrophies((prevTrophies) => evaluateTrophies(tasks, nextFriends, prevTrophies));
      return nextFriends;
    });
  };

  // Toggle completion status of a habit, updating streak counts and ensuring skip/completion are mutually exclusive
  const toggleTaskComplete = (id: string) => {
    updateTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completedToday: !task.completedToday,
              skippedToday: task.completedToday ? task.skippedToday : false,
              streakCount: !task.completedToday
                ? task.streakCount + 1
                : Math.max(0, task.streakCount - 1),
            }
          : task,
      ),
    );
  };

  // Toggle skip status of a habit, ensuring it cannot be marked as both completed and skipped
  const toggleTaskSkip = (id: string) => {
    updateTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              skippedToday: !task.skippedToday,
              completedToday: task.skippedToday ? task.completedToday : false,
            }
          : task,
      ),
    );
  };

  // Render the active tab and bottom navigation bar
  return (
    <View style={[s.root, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      <View style={[s.tab, activeTab === 'Habits' ? s.visible : s.hidden]}>
        <HabitsTab
          tasks={tasks}
          setTasks={setTasks}
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
