import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import {
  buildHistory,
  genId,
  getCategoryStats,
  getWeeklyData,
} from '@/src/mockData';
import { type Friend, type Task, getColors } from '@/src/types/index';

// Personal summary, social graph, and progress visualizations.

//  Heatmap color based on completion rate
function heatColor(rate: number, isDark: boolean): string {
  if (rate === 0) return isDark ? '#1F2937' : '#E5E7EB';
  if (rate < 0.4) return '#BFDBFE';
  if (rate < 0.7) return '#60A5FA';
  if (rate < 0.9) return '#3B82F6';
  return '#1D4ED8';
}

//  Progress section with a 7-day bar chart, 28-day heatmap, and category breakdowns with progress bars
function ProgressSection({ tasks }: { tasks: Task[] }) {
  const { isDark } = useTheme();
  const C = getColors(isDark);

  const history = useMemo(() => buildHistory(tasks), [tasks]);
  const weeklyData = useMemo(() => getWeeklyData(history), [history]);
  const categoryStats = useMemo(() => getCategoryStats(tasks, history), [tasks, history]);

  const maxBarRate = Math.max(...weeklyData.map((d) => d.rate), 0.01);

  return (
    <>
      {/* ── Last 7 Days bar chart ── */}
      <View style={s.sectionHeader}>
        <Text style={[s.sectionTitle, { color: C.text }]}>Last 7 Days</Text>
      </View>

      <View style={[s.chartCard, { backgroundColor: C.card }]}>
        <View style={s.chartBars}>
          {weeklyData.map((d, i) => {
            const pct = d.rate / maxBarRate;
            const color = d.rate >= 0.8 ? C.green : d.rate >= 0.5 ? C.blue : C.yellow;
            return (
              <View key={i} style={s.barCol}>
                <Text style={[s.barPct, { color: C.sub }]}>
                  {d.total > 0 ? `${Math.round(d.rate * 100)}%` : '–'}
                </Text>
                <View style={[s.barTrack, { backgroundColor: C.border }]}>
                  <View
                    style={[
                      s.barFill,
                      { height: `${Math.max(pct * 100, 4)}%`, backgroundColor: color },
                    ]}
                  />
                </View>
                <Text style={[s.barDay, { color: C.sub }]}>{d.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── 28-Day Heatmap ── */}
      <View style={s.sectionHeader}>
        <Text style={[s.sectionTitle, { color: C.text }]}>28-Day Heatmap</Text>
      </View>

      <View style={[s.heatmapCard, { backgroundColor: C.card }]}>
        <View style={s.heatmapGrid}>
          {history.map((day, i) => (
            <View key={i} style={s.heatCell}>
              <View style={[s.heatSquare, { backgroundColor: heatColor(day.rate, isDark) }]} />
              <Text style={[s.heatNum, { color: C.sub }]}>{day.dayNum}</Text>
            </View>
          ))}
        </View>
        {/* Legend */}
        <View style={s.heatLegend}>
          <Text style={[s.legendLabel, { color: C.sub }]}>Less</Text>
          {[0, 0.3, 0.6, 0.85, 1].map((v, i) => (
            <View key={i} style={[s.legendSquare, { backgroundColor: heatColor(v, isDark) }]} />
          ))}
          <Text style={[s.legendLabel, { color: C.sub }]}>More</Text>
        </View>
      </View>

      {/* ── By Category ── */}
      <View style={s.sectionHeader}>
        <Text style={[s.sectionTitle, { color: C.text }]}>By Category</Text>
      </View>

      {categoryStats.map((cat) => (
        <View key={cat.category} style={[s.catRow, { backgroundColor: C.card }]}>
          <View style={[s.catIconWrap, { backgroundColor: `${cat.color}18` }]}>
            <MaterialIcons name={cat.icon as React.ComponentProps<typeof MaterialIcons>['name']} size={20} color={cat.color} />
          </View>
          <View style={s.catInfo}>
            <View style={s.catRowTop}>
              <Text style={[s.catName, { color: C.text }]}>{cat.label}</Text>
              <Text style={[s.catRate, { color: cat.color }]}>{cat.rate}%</Text>
            </View>
            <View style={[s.catBarTrack, { backgroundColor: C.border }]}>
              <View style={[s.catBarFill, { width: `${cat.rate}%`, backgroundColor: cat.color }]} />
            </View>
            <Text style={[s.catMeta, { color: C.sub }]}>
              {cat.completed} of {cat.total} check-ins completed
            </Text>
          </View>
        </View>
      ))}
    </>
  );
}

//  Friend Modal with ailed profile info, streak stats, and a nudge button
function FriendModal({
  visible,
  friend,
  onClose,
}: Readonly<{
  visible: boolean;
  friend: Friend | null;
  onClose: () => void;
}>) {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  if (!friend) return null;
  const needsNudge = friend.missedDays >= 2;
  const firstName = friend.name.split(' ')[0];

  // Alert to simulate sending a nudge
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[s.modalSafe, { backgroundColor: C.bg }]}>
        <View style={[s.modalHeader, { borderBottomColor: C.border, backgroundColor: C.card }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[s.modalBack, { color: C.sub }]}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={[s.modalTitle, { color: C.text }]}>{friend.name}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={[s.modalBody, { backgroundColor: C.bg }]}>
          <View style={[s.friendProfileCard, { backgroundColor: C.card }]}>
            <View style={[s.friendProfileAvatarWrap, { backgroundColor: C.border }]}>
              {friend.photo ? (
                <Image source={friend.photo} style={s.friendAvatarImg} resizeMode="cover" />
              ) : (
                <MaterialIcons name="person" size={52} color={C.sub} />
              )}
            </View>
            <Text style={[s.friendProfileName, { color: C.text }]}>{friend.name}</Text>
            <Text style={[s.friendProfileTag, { color: C.blue }]}>{friend.tag}</Text>
            {friend.tag === '@cplaue' && (
              <Text style={[s.friendBio, { color: C.sub }]}>Enthusiast of greasy keyboards 🤌</Text>
            )}
            {friend.tag === '@agalean' && (
              <Text style={[s.friendBio, { color: C.sub }]}>
                Master snowboard artisan (actually built one from scratch. yes, really) 🏂
              </Text>
            )}
            <View style={s.friendStats}>
              <View style={s.friendStat}>
                <Text style={[s.friendStatNum, { color: C.text }]}>{friend.streakDays}</Text>
                <Text style={[s.friendStatLabel, { color: C.sub }]}>Streak Days</Text>
              </View>
              <View style={[s.statDivider, { backgroundColor: C.border }]} />
              <View style={s.friendStat}>
                <Text style={[s.friendStatNum, { color: C.red }]}>{friend.missedDays}</Text>
                <Text style={[s.friendStatLabel, { color: C.sub }]}>Missed Days</Text>
              </View>
              <View style={[s.statDivider, { backgroundColor: C.border }]} />
              <View style={s.friendStat}>
                <Text style={[s.friendStatNum, { color: C.text }]}>{friend.tasks}</Text>
                <Text style={[s.friendStatLabel, { color: C.sub }]}>Active Tasks</Text>
              </View>
            </View>
          </View>

          {needsNudge ? (
            <View style={s.nudgeBox}>
              <View style={s.nudgeBoxTitle}>
                <MaterialIcons name="warning" size={18} color="#9A3412" />
                <Text style={s.nudgeTitle}>
                  {firstName} has missed {friend.missedDays} days!
                </Text>
              </View>
              <Text style={[s.nudgeSubtitle, { color: C.sub }]}>Send some encouragement</Text>
              <TouchableOpacity
                style={[s.nudgeBtn, { backgroundColor: C.yellow }]}
                onPress={() => Alert.alert('Nudge sent!', `${firstName} has been nudged!`)}
              >
                <MaterialIcons name="notifications-active" size={18} color="#fff" />
                <Text style={s.nudgeBtnText}>Check In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[s.nudgeBox, s.nudgeBoxGood]}>
              <View style={s.nudgeBoxTitle}>
                <MaterialIcons name="local-fire-department" size={18} color={C.green} />
                <Text style={[s.nudgeGoodText, { color: C.green }]}>{firstName} is on a roll!</Text>
              </View>
              <Text style={{ color: C.sub, marginTop: 4 }}>
                {friend.streakDays}-day streak going strong
              </Text>
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

//  Add Friend Modal with input for friend's tag and instructions on how to find it
function AddFriendModal({
  visible,
  onAdd,
  onClose,
}: Readonly<{
  visible: boolean;
  onAdd: (tag: string) => void;
  onClose: () => void;
}>) {
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [tag, setTag] = useState('');

  const handleAdd = () => {
    if (tag.trim()) {
      onAdd(tag.trim());
      setTag('');
    }
  };

  // Render a modal with a text input for the friend's tag, instructions, and Add/Cancel buttons
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[s.modalSafe, { backgroundColor: C.bg }]}>
        <View style={[s.modalHeader, { borderBottomColor: C.border, backgroundColor: C.card }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[s.modalBack, { color: C.sub }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[s.modalTitle, { color: C.text }]}>Add Friend</Text>
          <TouchableOpacity onPress={handleAdd}>
            <Text style={[s.modalSave, { color: C.blue }]}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={[s.modalBody, { backgroundColor: C.bg }]}>
          <Text style={[s.fieldLabel, { color: C.sub }]}>Friend&apos;s Tag</Text>
          <TextInput
            style={[s.textInput, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
            value={tag}
            onChangeText={setTag}
            placeholder="@username"
            placeholderTextColor={C.sub}
            autoFocus
          />
          <Text style={[s.addFriendHint, { color: C.sub }]}>
            Enter your friend&apos;s unique tag to send a friend request.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

//  ProfileTab with user summary, progress visualizations, friend list, and modals
type Props = Readonly<{
  tasks: Task[];
  friends: Friend[];
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
}>;

// Main profile tab showing user info, progress charts, and friend list
export default function ProfileTab({ tasks, friends, setFriends }: Props) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isDark } = useTheme();
  const C = getColors(isDark);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendModalVisible, setFriendModalVisible] = useState(false);
  const [addFriendVisible, setAddFriendVisible] = useState(false);
  const swipeOpenId = useRef<string | null>(null);

  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.username) setUsername(data.username);
      });
  }, [user]);

  const MY_NAME = username ?? user?.email?.split('@')[0] ?? 'You';
  const MY_TAG = username ? `@${username}` : user?.email ? `@${user.email.split('@')[0]}` : '@your_habit';
  const MY_STREAK = 13;
  const MY_TASKS = tasks.filter((t) => t.active).length;

  const openFriend = (f: Friend) => {
    setSelectedFriend(f);
    setFriendModalVisible(true);
  };

  const addFriend = (tag: string) => {
    const normalized = tag.startsWith('@') ? tag : `@${tag}`;
    const newFriend: Friend = {
      id: genId(),
      name: normalized.replace('@', ''),
      tag: normalized,
      streakDays: 0,
      missedDays: 0,
      photo: undefined,
      tasks: 0,
    };
    setFriends((fs) => [...fs, newFriend]);
    setAddFriendVisible(false);
    Alert.alert('Friend Request Sent!', `Request sent to ${normalized}`);
  };

  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── My Profile card ── */}
        <View style={[s.profileCard, { backgroundColor: C.card }]}>
          <View style={s.profileAvatarWrap}>
            <MaterialIcons name="person" size={48} color="#6366F1" />
          </View>
          <Text style={[s.profileName, { color: C.text }]}>{MY_NAME}</Text>
          <View style={s.profileTagRow}>
            <Text style={[s.profileTag, { color: C.blue, backgroundColor: `${C.blue}18` }]}>
              {MY_TAG}
            </Text>
          </View>
          <View style={[s.profileStats, { borderTopColor: C.border }]}>
            <View style={s.profileStat}>
              <Text style={[s.profileStatNum, { color: C.text }]}>{MY_STREAK}</Text>
              <Text style={[s.profileStatLabel, { color: C.sub }]}>Day Streak</Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: C.border }]} />
            <View style={s.profileStat}>
              <Text style={[s.profileStatNum, { color: C.text }]}>{MY_TASKS}</Text>
              <Text style={[s.profileStatLabel, { color: C.sub }]}>Habits</Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: C.border }]} />
            <View style={s.profileStat}>
              <Text style={[s.profileStatNum, { color: C.text }]}>{friends.length}</Text>
              <Text style={[s.profileStatLabel, { color: C.sub }]}>Friends</Text>
            </View>
          </View>
        </View>

        {/* ── Progress charts ── */}
        <View style={s.progressSection}>
          <ProgressSection tasks={tasks} />
        </View>

        {/* ── Friends ── */}
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: C.text }]}>Friends</Text>
          <TouchableOpacity
            style={[s.addBtn, { backgroundColor: C.blue, shadowColor: C.blue }]}
            onPress={() => setAddFriendVisible(true)}
          >
            <MaterialIcons name="person-add" size={16} color="#fff" />
            <Text style={s.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {friends.map((friend) => {
          const needsNudge = friend.missedDays >= 2;

          const renderRightActions = () => (
            <TouchableOpacity
              style={s.swipeDelete}
              onPress={() =>
                Alert.alert('Remove Friend', `Remove ${friend.name}?`, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => setFriends((fs) => fs.filter((f) => f.id !== friend.id)),
                  },
                ])
              }
            >
              <MaterialIcons name="person-remove" size={22} color="#fff" />
              <Text style={s.swipeDeleteText}>Remove</Text>
            </TouchableOpacity>
          );

          return (
            <Swipeable
              key={friend.id}
              renderRightActions={renderRightActions}
              overshootRight={false}
              onSwipeableOpen={() => { swipeOpenId.current = friend.id; }}
              onSwipeableClose={() => { swipeOpenId.current = null; }}
            >
            <TouchableOpacity
              style={[s.friendCard, { backgroundColor: C.card }]}
              onPress={() => { if (swipeOpenId.current === null) openFriend(friend); }}
              activeOpacity={0.8}
            >
              <View style={[s.friendAvatar, { backgroundColor: C.border }]}>
                {friend.photo ? (
                  <Image source={friend.photo} style={s.friendAvatarImg} resizeMode="cover" pointerEvents="none" />
                ) : (
                  <MaterialIcons name="person" size={28} color={C.sub} />
                )}
              </View>
              <View style={s.friendInfo}>
                <Text style={[s.friendName, { color: C.text }]}>{friend.name}</Text>
                <Text style={[s.friendTagText, { color: C.sub }]}>{friend.tag}</Text>
                <View style={s.friendMeta}>
                  <MaterialIcons name="local-fire-department" size={13} color={C.yellow} />
                  <Text style={[s.friendMetaText, { color: C.sub }]}>
                    {friend.streakDays}-day streak
                  </Text>
                  {needsNudge && (
                    <View style={s.missedBadge}>
                      <MaterialIcons name="warning" size={11} color={C.red} />
                      <Text style={[s.missedText, { color: C.red }]}>
                        {friend.missedDays} missed
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              {needsNudge && (
                <TouchableOpacity
                  style={s.nudgeSmallBtn}
                  onPress={() =>
                    Alert.alert('Nudge sent!', `${friend.name.split(' ')[0]} has been nudged!`)
                  }
                >
                  <MaterialIcons name="notifications" size={18} color="#92400E" />
                </TouchableOpacity>
              )}
              <MaterialIcons name="chevron-right" size={22} color={C.sub} />
            </TouchableOpacity>
            </Swipeable>
          );
        })}

        {/* ── Settings ── */}
        <View style={[s.sectionHeader, { marginTop: 8 }]}>
          <Text style={[s.sectionTitle, { color: C.text }]}>Settings</Text>
        </View>

        <TouchableOpacity
          style={[s.settingsRow, { backgroundColor: C.card }]}
          onPress={() => router.push('/appearance')}
        >
          <MaterialIcons name="palette" size={20} color={C.sub} style={{ marginRight: 14 }} />
          <Text style={[s.settingsLabel, { color: C.text }]}>Appearance</Text>
          <MaterialIcons name="chevron-right" size={22} color={C.sub} />
        </TouchableOpacity>

        <TouchableOpacity style={[s.settingsRow, { backgroundColor: C.card }]} onPress={() => { void signOut(); }}>
          <MaterialIcons name="logout" size={20} color={C.red} style={{ marginRight: 14 }} />
          <Text style={[s.settingsLabel, { color: C.text }]}>Sign Out</Text>
          <MaterialIcons name="chevron-right" size={22} color={C.sub} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <FriendModal
        visible={friendModalVisible}
        friend={selectedFriend}
        onClose={() => setFriendModalVisible(false)}
      />
      <AddFriendModal
        visible={addFriendVisible}
        onAdd={addFriend}
        onClose={() => setAddFriendVisible(false)}
      />
    </View>
  );
}

//  Styles for the Profile tab
const s = StyleSheet.create({
  container: { flex: 1 },

  // Profile card
  profileCard: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  profileAvatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendProfileAvatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  profileTagRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  profileTag: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '700',
  },
  profileStats: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  profileStat: { alignItems: 'center' },
  profileStatNum: { fontSize: 22, fontWeight: '800' },
  profileStatLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1 },

  // Progress section wrapper
  progressSection: { paddingHorizontal: 20, marginBottom: 8 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800' },

  // 7-day bar chart
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barCol: { flex: 1, alignItems: 'center' },
  barPct: { fontSize: 9, fontWeight: '600', marginBottom: 4 },
  barTrack: { width: 28, flex: 1, borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 4 },
  barDay: { fontSize: 11, fontWeight: '600', marginTop: 6 },

  // 28-day heatmap
  heatmapCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  heatCell: { width: '13%', alignItems: 'center', marginBottom: 4 },
  heatSquare: { width: 32, height: 32, borderRadius: 6 },
  heatNum: { fontSize: 9, marginTop: 2 },
  heatLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 10,
  },
  legendSquare: { width: 14, height: 14, borderRadius: 3 },
  legendLabel: { fontSize: 10 },

  // Category breakdown
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  catIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catInfo: { flex: 1 },
  catRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  catName: { fontSize: 14, fontWeight: '700' },
  catRate: { fontSize: 14, fontWeight: '800' },
  catBarTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 3 },
  catBarFill: { height: '100%', borderRadius: 3 },
  catMeta: { fontSize: 10 },

  // Friend cards
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  friendAvatarImg: { width: '100%', height: '100%' },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 15, fontWeight: '700' },
  friendTagText: { fontSize: 12, marginBottom: 4 },
  friendMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  friendMetaText: { fontSize: 12 },
  missedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  missedText: { fontSize: 11, fontWeight: '700' },
  swipeDelete: {
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginBottom: 10,
    marginRight: 20,
    gap: 4,
  },
  swipeDeleteText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  nudgeSmallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  // Friend profile modal
  friendProfileCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  friendProfileName: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  friendProfileTag: { fontSize: 14, marginBottom: 8 },
  friendBio: { fontSize: 12, fontStyle: 'italic', marginBottom: 12, textAlign: 'center' },
  friendStats: { flexDirection: 'row', gap: 24 },
  friendStat: { alignItems: 'center' },
  friendStatNum: { fontSize: 22, fontWeight: '800' },
  friendStatLabel: { fontSize: 11, fontWeight: '600' },
  nudgeBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  nudgeBoxGood: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  nudgeBoxTitle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  nudgeTitle: { fontSize: 15, fontWeight: '700', color: '#9A3412' },
  nudgeSubtitle: { fontSize: 13, marginBottom: 12 },
  nudgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 12,
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  nudgeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  nudgeGoodText: { fontWeight: '700', fontSize: 15 },

  // Settings
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 2,
    padding: 16,
    borderRadius: 12,
  },
  settingsLabel: { flex: 1, fontSize: 15, fontWeight: '600' },

  // Modals
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalBack: { fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalSave: { fontSize: 16, fontWeight: '700' },
  modalBody: { flex: 1, padding: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  textInput: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15, marginBottom: 16 },
  addFriendHint: { fontSize: 13, marginTop: 4 },
});
