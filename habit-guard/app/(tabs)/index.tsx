import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "Medication" | "Exercise" | "Hydration" | "Nutrition" | "Mindfulness" | "Other";

type Task = {
  id: string;
  title: string;
  category: Category;
  time: string;
  days: boolean[]; // Sun-Sat
  active: boolean;
  streakCount: number;
  completedToday: boolean;
  skippedToday: boolean;
};

type Trophy = {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: "gold" | "silver" | "bronze" | "bad" | "streak";
  earned: boolean;
  earnedDate?: string;
};

type Friend = {
  id: string;
  name: string;
  tag: string;
  streakDays: number;
  missedDays: number;
  avatar: string;
  tasks: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ["Medication", "Exercise", "Hydration", "Nutrition", "Mindfulness", "Other"];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const CATEGORY_COLORS: Record<Category, string> = {
  Medication: "#3B82F6",
  Exercise: "#10B981",
  Hydration: "#06B6D4",
  Nutrition: "#F59E0B",
  Mindfulness: "#8B5CF6",
  Other: "#6B7280",
};

const CATEGORY_ICONS: Record<Category, string> = {
  Medication: "💊",
  Exercise: "🏃",
  Hydration: "💧",
  Nutrition: "🥗",
  Mindfulness: "🧘",
  Other: "⭐",
};

// ─── Initial Data ─────────────────────────────────────────────────────────────

const INITIAL_TASKS: Task[] = [
  {
    id: "1", title: "Morning Medication", category: "Medication", time: "08:00",
    days: [true, true, true, true, true, true, true], active: true, streakCount: 6,
    completedToday: true, skippedToday: false,
  },
  {
    id: "2", title: "Evening Medication", category: "Medication", time: "21:00",
    days: [true, true, true, true, true, true, true], active: true, streakCount: 8,
    completedToday: true, skippedToday: false,
  },
  {
    id: "3", title: "Morning Walk", category: "Exercise", time: "07:30",
    days: [true, true, true, true, true, true, false], active: true, streakCount: 1,
    completedToday: false, skippedToday: false,
  },
  {
    id: "4", title: "Drink Water (Morning)", category: "Hydration", time: "07:00",
    days: [true, true, true, true, true, true, true], active: true, streakCount: 13,
    completedToday: false, skippedToday: false,
  },
  {
    id: "5", title: "Drink Water (Afternoon)", category: "Hydration", time: "14:00",
    days: [true, true, true, true, true, true, true], active: true, streakCount: 8,
    completedToday: false, skippedToday: false,
  },
];

const INITIAL_TROPHIES: Trophy[] = [
  { id: "t1", title: "First Step", description: "Complete your first task", icon: "🥉", type: "bronze", earned: true, earnedDate: "Mar 1" },
  { id: "t2", title: "Week Warrior", description: "7-day streak on any task", icon: "🥈", type: "silver", earned: true, earnedDate: "Mar 8" },
  { id: "t3", title: "Hydration Hero", description: "10-day water streak", icon: "💧", type: "streak", earned: true, earnedDate: "Mar 15" },
  { id: "t4", title: "Month Master", description: "30-day streak on any task", icon: "🏆", type: "gold", earned: false },
  { id: "t5", title: "Early Bird", description: "Complete a task before 7am", icon: "🌅", type: "silver", earned: false },
  { id: "t6", title: "Slacker", description: "Skipped 3 days in a row", icon: "😴", type: "bad", earned: true, earnedDate: "Feb 20" },
  { id: "t7", title: "Iron Will", description: "100-day streak", icon: "💪", type: "gold", earned: false },
  { id: "t8", title: "Streak Saver", description: "Used skip to save a streak", icon: "🛡️", type: "bronze", earned: true, earnedDate: "Mar 3" },
  { id: "t9", title: "Social Butterfly", description: "Add 3 friends", icon: "🦋", type: "silver", earned: false },
];

const INITIAL_FRIENDS: Friend[] = [
  { id: "f1", name: "Alex Rivera", tag: "@alex_r", streakDays: 14, missedDays: 0, avatar: "🧑", tasks: 5 },
  { id: "f2", name: "Jamie Chen", tag: "@jchen", streakDays: 3, missedDays: 3, avatar: "👩", tasks: 4 },
  { id: "f3", name: "Morgan Lee", tag: "@morganlee", streakDays: 0, missedDays: 7, avatar: "🧔", tasks: 2 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const genId = () => Math.random().toString(36).slice(2);

const today = new Date();
const todayIdx = today.getDay(); // 0=Sun

// ─── Sub-components ───────────────────────────────────────────────────────────

const CategoryPill = ({ cat }: { cat: Category }) => (
  <View style={[styles.pill, { backgroundColor: CATEGORY_COLORS[cat] + "22" }]}>
    <Text style={[styles.pillText, { color: CATEGORY_COLORS[cat] }]}>
      {CATEGORY_ICONS[cat]} {cat}
    </Text>
  </View>
);

const DayToggle = ({
  days,
  onChange,
}: {
  days: boolean[];
  onChange: (i: number) => void;
}) => (
  <View style={styles.dayRow}>
    {DAY_LABELS.map((d, i) => (
      <TouchableOpacity
        key={i}
        onPress={() => onChange(i)}
        style={[styles.dayBtn, days[i] && styles.dayBtnActive]}
      >
        <Text style={[styles.dayBtnText, days[i] && styles.dayBtnTextActive]}>{d}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ─── Task Modal ───────────────────────────────────────────────────────────────

const EMPTY_TASK: Omit<Task, "id" | "streakCount" | "completedToday" | "skippedToday"> = {
  title: "",
  category: "Other",
  time: "08:00",
  days: [true, true, true, true, true, true, true],
  active: true,
};

function TaskModal({
  visible,
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  visible: boolean;
  initial?: Task | null;
  onSave: (t: Omit<Task, "id" | "streakCount" | "completedToday" | "skippedToday">) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<Task, "id" | "streakCount" | "completedToday" | "skippedToday">>(
    initial ? {
      title: initial.title,
      category: initial.category,
      time: initial.time,
      days: [...initial.days],
      active: initial.active,
    } : { ...EMPTY_TASK, days: [true, true, true, true, true, true, true] }
  );

  React.useEffect(() => {
    if (visible) {
      setForm(initial ? {
        title: initial.title, category: initial.category,
        time: initial.time, days: [...initial.days], active: initial.active,
      } : { ...EMPTY_TASK, days: [true, true, true, true, true, true, true] });
    }
  }, [visible, initial]);

  const toggleDay = (i: number) => {
    const d = [...form.days];
    d[i] = !d[i];
    setForm({ ...form, days: d });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{initial ? "Edit Task" : "New Task"}</Text>
          <TouchableOpacity onPress={() => { if (form.title.trim()) onSave(form); }}>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
          <Text style={styles.fieldLabel}>Task Name</Text>
          <TextInput
            style={styles.textInput}
            value={form.title}
            onChangeText={t => setForm({ ...form, title: t })}
            placeholder="e.g. Morning Run"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.fieldLabel}>Time</Text>
          <TextInput
            style={styles.textInput}
            value={form.time}
            onChangeText={t => setForm({ ...form, time: t })}
            placeholder="HH:MM"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.fieldLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setForm({ ...form, category: cat })}
                style={[
                  styles.catOption,
                  form.category === cat && { backgroundColor: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat] },
                ]}
              >
                <Text style={[styles.catOptionText, form.category === cat && { color: "#fff" }]}>
                  {CATEGORY_ICONS[cat]} {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>Active Days</Text>
          <DayToggle days={form.days} onChange={toggleDay} />

          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>Active</Text>
            <Switch
              value={form.active}
              onValueChange={v => setForm({ ...form, active: v })}
              trackColor={{ false: "#E5E7EB", true: "#10B981" }}
              thumbColor="#fff"
            />
          </View>

          {initial && onDelete && (
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
              <Text style={styles.deleteBtnText}>🗑 Delete Task</Text>
            </TouchableOpacity>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Friend Modal ─────────────────────────────────────────────────────────────

function FriendModal({
  visible,
  friend,
  onClose,
}: {
  visible: boolean;
  friend: Friend | null;
  onClose: () => void;
}) {
  if (!friend) return null;
  const needsNudge = friend.missedDays >= 2;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{friend.name}</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.modalBody}>
          <View style={styles.friendProfileCard}>
            <Text style={styles.friendProfileAvatar}>{friend.avatar}</Text>
            <Text style={styles.friendProfileName}>{friend.name}</Text>
            <Text style={styles.friendProfileTag}>{friend.tag}</Text>

            <View style={styles.friendStats}>
              <View style={styles.friendStat}>
                <Text style={styles.friendStatNum}>{friend.streakDays}</Text>
                <Text style={styles.friendStatLabel}>Streak Days</Text>
              </View>
              <View style={styles.friendStat}>
                <Text style={[styles.friendStatNum, { color: "#EF4444" }]}>{friend.missedDays}</Text>
                <Text style={styles.friendStatLabel}>Missed Days</Text>
              </View>
              <View style={styles.friendStat}>
                <Text style={styles.friendStatNum}>{friend.tasks}</Text>
                <Text style={styles.friendStatLabel}>Active Tasks</Text>
              </View>
            </View>
          </View>

          {needsNudge && (
            <View style={styles.nudgeBox}>
              <Text style={styles.nudgeTitle}>⚠️ {friend.name.split(" ")[0]} has missed {friend.missedDays} days!</Text>
              <Text style={styles.nudgeSubtitle}>Send some encouragement</Text>
              <TouchableOpacity
                style={styles.nudgeBtn}
                onPress={() => Alert.alert("Nudge sent!", `${friend.name.split(" ")[0]} has been nudged! 💪`)}
              >
                <Text style={styles.nudgeBtnText}>👋 Check In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nudgeBtn, { backgroundColor: "#10B981" }]}
                onPress={() => Alert.alert("Message sent!", `You sent a motivational message to ${friend.name.split(" ")[0]}! 🌟`)}
              >
                <Text style={styles.nudgeBtnText}>🌟 Send Motivation</Text>
              </TouchableOpacity>
            </View>
          )}

          {!needsNudge && (
            <View style={[styles.nudgeBox, { backgroundColor: "#ECFDF5", borderColor: "#10B981" }]}>
              <Text style={{ color: "#10B981", fontWeight: "700", fontSize: 15 }}>
                🔥 {friend.name.split(" ")[0]} is on a roll!
              </Text>
              <Text style={{ color: "#6B7280", marginTop: 4 }}>{friend.streakDays}-day streak going strong</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Add Friend Modal ─────────────────────────────────────────────────────────

function AddFriendModal({
  visible,
  onAdd,
  onClose,
}: {
  visible: boolean;
  onAdd: (tag: string) => void;
  onClose: () => void;
}) {
  const [tag, setTag] = useState("");

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Friend</Text>
          <TouchableOpacity onPress={() => { if (tag.trim()) { onAdd(tag.trim()); setTag(""); } }}>
            <Text style={styles.modalSave}>Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalBody}>
          <Text style={styles.fieldLabel}>Friend's Tag</Text>
          <TextInput
            style={styles.textInput}
            value={tag}
            onChangeText={setTag}
            placeholder="@username"
            placeholderTextColor="#9CA3AF"
            autoFocus
          />
          <Text style={styles.addFriendHint}>Enter your friend's unique tag to send a friend request.</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── TASKS TAB ────────────────────────────────────────────────────────────────

function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<"All" | "Pending" | "Done">("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const todayTasks = tasks.filter(t => t.active && t.days[todayIdx]);
  const pending = todayTasks.filter(t => !t.completedToday && !t.skippedToday);
  const done = todayTasks.filter(t => t.completedToday || t.skippedToday);

  const filtered = filter === "All" ? todayTasks : filter === "Pending" ? pending : done;

  const completeTask = (id: string) =>
    setTasks(ts => ts.map(t => t.id === id ? { ...t, completedToday: true, streakCount: t.streakCount + 1 } : t));

  const skipTask = (id: string) =>
    setTasks(ts => ts.map(t => t.id === id ? { ...t, skippedToday: true } : t));

  const saveTask = (form: Omit<Task, "id" | "streakCount" | "completedToday" | "skippedToday">) => {
    if (editTask) {
      setTasks(ts => ts.map(t => t.id === editTask.id ? { ...t, ...form } : t));
    } else {
      setTasks(ts => [...ts, { ...form, id: genId(), streakCount: 0, completedToday: false, skippedToday: false }]);
    }
    setModalVisible(false);
    setEditTask(null);
  };

  const deleteTask = () => {
    if (editTask) setTasks(ts => ts.filter(t => t.id !== editTask.id));
    setModalVisible(false);
    setEditTask(null);
  };

  const openNew = () => { setEditTask(null); setModalVisible(true); };
  const openEdit = (t: Task) => { setEditTask(t); setModalVisible(true); };

  return (
    <View style={styles.tabContainer}>
      {/* Header */}
      <View style={styles.tasksHeader}>
        <View>
          <Text style={styles.tasksDate}>
            {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </Text>
          <Text style={styles.tasksTitle}>Today's Tasks</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{todayTasks.length}</Text>
          <Text style={styles.statLabel}>TOTAL</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: "#F59E0B" }]}>{pending.length}</Text>
          <Text style={styles.statLabel}>PENDING</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: "#10B981" }]}>{done.length}</Text>
          <Text style={styles.statLabel}>DONE</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(["All", "Pending", "Done"] as const).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f} {f === "All" ? `(${todayTasks.length})` : f === "Pending" ? `(${pending.length})` : `(${done.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map(task => {
          const catColor = CATEGORY_COLORS[task.category];
          const isDone = task.completedToday;
          const isSkipped = task.skippedToday;
          return (
            <TouchableOpacity key={task.id} style={styles.taskCard} onPress={() => openEdit(task)} activeOpacity={0.8}>
              <View style={[styles.taskAccent, { backgroundColor: catColor }]} />
              <View style={styles.taskIcon}>
                <Text style={{ fontSize: 22 }}>{CATEGORY_ICONS[task.category]}</Text>
              </View>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>{task.title}</Text>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskTime}>🕐 {task.time}</Text>
                  {task.streakCount > 0 && (
                    <View style={styles.streakBadge}>
                      <Text style={styles.streakText}>🔥 {task.streakCount}</Text>
                    </View>
                  )}
                </View>
                <CategoryPill cat={task.category} />
              </View>
              <View style={styles.taskActions}>
                {isDone ? (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✅ Done</Text>
                  </View>
                ) : isSkipped ? (
                  <View style={[styles.completedBadge, { backgroundColor: "#FEF9C3" }]}>
                    <Text style={[styles.completedText, { color: "#A16207" }]}>⏭ Skipped</Text>
                  </View>
                ) : (
                  <View style={styles.actionBtns}>
                    <TouchableOpacity style={styles.skipBtn} onPress={() => skipTask(task.id)}>
                      <Text style={styles.skipBtnText}>Skip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.doneBtn} onPress={() => completeTask(task.id)}>
                      <Text style={styles.doneBtnText}>✓ Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>

      <TaskModal
        visible={modalVisible}
        initial={editTask}
        onSave={saveTask}
        onDelete={editTask ? deleteTask : undefined}
        onClose={() => { setModalVisible(false); setEditTask(null); }}
      />
    </View>
  );
}

// ─── TROPHIES TAB ─────────────────────────────────────────────────────────────

function TrophiesTab() {
  const [trophies] = useState<Trophy[]>(INITIAL_TROPHIES);
  const [filter, setFilter] = useState<"All" | "Earned" | "Locked">("All");

  const earned = trophies.filter(t => t.earned);
  const locked = trophies.filter(t => !t.earned);
  const filtered = filter === "All" ? trophies : filter === "Earned" ? earned : locked;

  const typeColor: Record<Trophy["type"], string> = {
    gold: "#F59E0B",
    silver: "#9CA3AF",
    bronze: "#CD7F32",
    bad: "#EF4444",
    streak: "#3B82F6",
  };

  const typeLabel: Record<Trophy["type"], string> = {
    gold: "Gold",
    silver: "Silver",
    bronze: "Bronze",
    bad: "Penalty",
    streak: "Streak",
  };

  return (
    <View style={styles.tabContainer}>
      <View style={styles.tasksHeader}>
        <View>
          <Text style={styles.tasksDate}>Your Achievements</Text>
          <Text style={styles.tasksTitle}>Trophies & Badges</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{trophies.length}</Text>
          <Text style={styles.statLabel}>TOTAL</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: "#10B981" }]}>{earned.length}</Text>
          <Text style={styles.statLabel}>EARNED</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: "#EF4444" }]}>{trophies.filter(t => t.type === "bad" && t.earned).length}</Text>
          <Text style={styles.statLabel}>PENALTIES</Text>
        </View>
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {(["All", "Earned", "Locked"] as const).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        <View style={styles.trophyGrid}>
          {filtered.map(trophy => (
            <View
              key={trophy.id}
              style={[
                styles.trophyCard,
                !trophy.earned && styles.trophyCardLocked,
                trophy.type === "bad" && trophy.earned && styles.trophyCardBad,
              ]}
            >
              <Text style={[styles.trophyIcon, !trophy.earned && { opacity: 0.3 }]}>{trophy.icon}</Text>
              <View style={[styles.trophyTypeBadge, { backgroundColor: typeColor[trophy.type] + "22" }]}>
                <Text style={[styles.trophyTypeText, { color: typeColor[trophy.type] }]}>{typeLabel[trophy.type]}</Text>
              </View>
              <Text style={[styles.trophyTitle, !trophy.earned && styles.trophyTitleLocked]}>{trophy.title}</Text>
              <Text style={styles.trophyDesc}>{trophy.description}</Text>
              {trophy.earned && trophy.earnedDate && (
                <Text style={styles.trophyDate}>Earned {trophy.earnedDate}</Text>
              )}
              {!trophy.earned && (
                <Text style={styles.trophyLocked}>🔒 Locked</Text>
              )}
            </View>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendModalVisible, setFriendModalVisible] = useState(false);
  const [addFriendVisible, setAddFriendVisible] = useState(false);

  const myTag = "@you_habit";
  const myStreak = 13;
  const myTasks = 5;

  const openFriend = (f: Friend) => { setSelectedFriend(f); setFriendModalVisible(true); };

  const addFriend = (tag: string) => {
    const newFriend: Friend = {
      id: genId(),
      name: tag.replace("@", ""),
      tag: tag.startsWith("@") ? tag : `@${tag}`,
      streakDays: 0,
      missedDays: 0,
      avatar: "🙂",
      tasks: 0,
    };
    setFriends(fs => [...fs, newFriend]);
    setAddFriendVisible(false);
    Alert.alert("Friend Request Sent!", `Request sent to ${tag}`);
  };

  return (
    <View style={styles.tabContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* My Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={{ fontSize: 44 }}>😊</Text>
          </View>
          <Text style={styles.profileName}>You</Text>
          <View style={styles.profileTagRow}>
            <Text style={styles.profileTag}>{myTag}</Text>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() => Alert.alert("Share", `Your tag is ${myTag} — share it with friends!`)}
            >
              <Text style={styles.shareBtnText}>📤 Share</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatNum}>{myStreak}</Text>
              <Text style={styles.profileStatLabel}>Best Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatNum}>{myTasks}</Text>
              <Text style={styles.profileStatLabel}>Tasks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatNum}>{friends.length}</Text>
              <Text style={styles.profileStatLabel}>Friends</Text>
            </View>
          </View>
        </View>

        {/* Friends Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friends</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddFriendVisible(true)}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {friends.map(friend => {
          const needsNudge = friend.missedDays >= 2;
          return (
            <TouchableOpacity key={friend.id} style={styles.friendCard} onPress={() => openFriend(friend)} activeOpacity={0.8}>
              <View style={styles.friendAvatar}>
                <Text style={{ fontSize: 28 }}>{friend.avatar}</Text>
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendTag}>{friend.tag}</Text>
                <View style={styles.friendMeta}>
                  <Text style={styles.friendMetaText}>🔥 {friend.streakDays}-day streak</Text>
                  {needsNudge && (
                    <View style={styles.missedBadge}>
                      <Text style={styles.missedText}>⚠️ {friend.missedDays} missed</Text>
                    </View>
                  )}
                </View>
              </View>
              {needsNudge && (
                <TouchableOpacity
                  style={styles.nudgeSmallBtn}
                  onPress={() => Alert.alert("Nudge sent!", `${friend.name.split(" ")[0]} has been nudged! 💪`)}
                >
                  <Text style={styles.nudgeSmallText}>👋</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          );
        })}

        {/* Settings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Settings</Text>
        </View>

        {[
          { icon: "🔔", label: "Notifications" },
          { icon: "🎨", label: "Appearance" },
          { icon: "🔒", label: "Privacy" },
          { icon: "❓", label: "Help & Support" },
          { icon: "🚪", label: "Sign Out" },
        ].map(item => (
          <TouchableOpacity
            key={item.label}
            style={styles.settingsRow}
            onPress={() => Alert.alert(item.label, `${item.label} settings coming soon!`)}
          >
            <Text style={styles.settingsIcon}>{item.icon}</Text>
            <Text style={styles.settingsLabel}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      <FriendModal visible={friendModalVisible} friend={selectedFriend} onClose={() => setFriendModalVisible(false)} />
      <AddFriendModal visible={addFriendVisible} onAdd={addFriend} onClose={() => setAddFriendVisible(false)} />
    </View>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState<"Tasks" | "Trophies" | "Profile">("Tasks");

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <View style={styles.content}>
        {activeTab === "Tasks" && <TasksTab />}
        {activeTab === "Trophies" && <TrophiesTab />}
        {activeTab === "Profile" && <ProfileTab />}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {(["Tasks", "Trophies", "Profile"] as const).map(tab => {
          const icons: Record<string, string> = { Tasks: "📋", Trophies: "🏆", Profile: "👤" };
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{icons[tab]}</Text>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab}</Text>
              {active && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const C = {
  bg: "#F9FAFB",
  card: "#FFFFFF",
  blue: "#3B82F6",
  green: "#10B981",
  yellow: "#F59E0B",
  red: "#EF4444",
  text: "#111827",
  sub: "#6B7280",
  border: "#E5E7EB",
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1 },

  // Tab bar
  tabBar: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: { flex: 1, alignItems: "center", position: "relative" },
  tabIcon: { fontSize: 22, marginBottom: 2, opacity: 0.4 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 11, color: C.sub, fontWeight: "500" },
  tabLabelActive: { color: C.blue, fontWeight: "700" },
  tabIndicator: {
    position: "absolute", top: -8, width: 32, height: 3,
    backgroundColor: C.blue, borderRadius: 2,
  },

  // Tab container
  tabContainer: { flex: 1, backgroundColor: C.bg },

  // Tasks header
  tasksHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  tasksDate: { fontSize: 12, color: C.sub, fontWeight: "500", marginBottom: 2 },
  tasksTitle: { fontSize: 24, fontWeight: "800", color: C.text },
  addBtn: {
    backgroundColor: C.blue, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, shadowColor: C.blue, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Stats bar
  statsBar: {
    flexDirection: "row", backgroundColor: C.card, marginHorizontal: 20,
    borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 24, fontWeight: "800", color: C.text },
  statLabel: { fontSize: 10, color: C.sub, fontWeight: "600", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: C.border },

  // Filter
  filterRow: {
    flexDirection: "row", paddingHorizontal: 20, marginBottom: 12, gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
  },
  filterTabActive: { backgroundColor: C.blue, borderColor: C.blue },
  filterTabText: { fontSize: 13, color: C.sub, fontWeight: "600" },
  filterTabTextActive: { color: "#fff" },

  // Task card
  list: { flex: 1, paddingHorizontal: 20 },
  taskCard: {
    backgroundColor: C.card, borderRadius: 16, marginBottom: 12,
    flexDirection: "row", alignItems: "center", overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, padding: 14,
  },
  taskAccent: { width: 4, height: 48, borderRadius: 2, marginRight: 12 },
  taskIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: "#F3F4F6",
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: "700", color: C.text, marginBottom: 4 },
  taskTitleDone: { color: C.sub, textDecorationLine: "line-through" },
  taskMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  taskTime: { fontSize: 12, color: C.sub },
  streakBadge: { backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  streakText: { fontSize: 11, color: "#92400E", fontWeight: "700" },
  taskActions: { alignItems: "flex-end" },
  actionBtns: { gap: 6 },
  skipBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
  },
  skipBtnText: { fontSize: 12, color: C.sub, fontWeight: "600" },
  doneBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    backgroundColor: C.blue,
  },
  doneBtnText: { fontSize: 12, color: "#fff", fontWeight: "700" },
  completedBadge: {
    backgroundColor: "#DCFCE7", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  completedText: { fontSize: 12, color: "#166534", fontWeight: "700" },

  // Pill
  pill: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  pillText: { fontSize: 10, fontWeight: "700" },

  // Modal
  modalSafe: { flex: 1, backgroundColor: C.bg },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.card,
  },
  modalCancel: { fontSize: 16, color: C.sub },
  modalTitle: { fontSize: 17, fontWeight: "700", color: C.text },
  modalSave: { fontSize: 16, color: C.blue, fontWeight: "700" },
  modalBody: { flex: 1, padding: 20 },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: C.sub, marginBottom: 8, marginTop: 4 },
  textInput: {
    backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border,
    padding: 14, fontSize: 15, color: C.text, marginBottom: 16,
  },
  dayRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  dayBtn: {
    width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: C.border, backgroundColor: C.card,
  },
  dayBtnActive: { backgroundColor: C.blue, borderColor: C.blue },
  dayBtnText: { fontSize: 13, fontWeight: "600", color: C.sub },
  dayBtnTextActive: { color: "#fff" },
  switchRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 16,
  },
  catOption: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, marginRight: 8, backgroundColor: C.card,
  },
  catOptionText: { fontSize: 13, fontWeight: "600", color: C.text },
  deleteBtn: {
    backgroundColor: "#FEE2E2", borderRadius: 12, padding: 14,
    alignItems: "center", marginTop: 16,
  },
  deleteBtnText: { color: C.red, fontWeight: "700", fontSize: 15 },

  // Trophies
  trophyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  trophyCard: {
    width: "47%", backgroundColor: C.card, borderRadius: 16, padding: 16,
    alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  trophyCardLocked: { backgroundColor: "#F3F4F6", opacity: 0.7 },
  trophyCardBad: { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA" },
  trophyIcon: { fontSize: 40, marginBottom: 8 },
  trophyTypeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 8 },
  trophyTypeText: { fontSize: 10, fontWeight: "700" },
  trophyTitle: { fontSize: 13, fontWeight: "800", color: C.text, textAlign: "center", marginBottom: 4 },
  trophyTitleLocked: { color: C.sub },
  trophyDesc: { fontSize: 11, color: C.sub, textAlign: "center", marginBottom: 4 },
  trophyDate: { fontSize: 10, color: C.green, fontWeight: "600" },
  trophyLocked: { fontSize: 10, color: C.sub, marginTop: 4 },

  // Profile
  profileCard: {
    backgroundColor: C.card, margin: 20, borderRadius: 20, padding: 24,
    alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  profileAvatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: "#EEF2FF",
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  profileName: { fontSize: 22, fontWeight: "800", color: C.text, marginBottom: 6 },
  profileTagRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  profileTag: {
    fontSize: 14, color: C.blue, backgroundColor: "#EFF6FF",
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontWeight: "700",
  },
  shareBtn: {
    backgroundColor: C.green, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  shareBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  profileStats: {
    flexDirection: "row", width: "100%", justifyContent: "space-around",
    borderTopWidth: 1, borderTopColor: C.border, paddingTop: 16,
  },
  profileStat: { alignItems: "center" },
  profileStatNum: { fontSize: 22, fontWeight: "800", color: C.text },
  profileStatLabel: { fontSize: 11, color: C.sub, fontWeight: "600", marginTop: 2 },

  // Friends
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: C.text },
  friendCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.card,
    marginHorizontal: 20, marginBottom: 10, borderRadius: 16, padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  friendAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: "#F3F4F6",
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 15, fontWeight: "700", color: C.text },
  friendTag: { fontSize: 12, color: C.sub, marginBottom: 4 },
  friendMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  friendMetaText: { fontSize: 12, color: C.sub },
  missedBadge: { backgroundColor: "#FEF2F2", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  missedText: { fontSize: 11, color: C.red, fontWeight: "700" },
  nudgeSmallBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#FEF3C7",
    alignItems: "center", justifyContent: "center", marginRight: 8,
  },
  nudgeSmallText: { fontSize: 18 },
  chevron: { fontSize: 22, color: C.sub },

  // Friend profile modal
  friendProfileCard: {
    backgroundColor: C.card, borderRadius: 20, padding: 24,
    alignItems: "center", marginBottom: 16, shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  friendProfileAvatar: { fontSize: 64, marginBottom: 12 },
  friendProfileName: { fontSize: 22, fontWeight: "800", color: C.text, marginBottom: 4 },
  friendProfileTag: { fontSize: 14, color: C.blue, marginBottom: 16 },
  friendStats: { flexDirection: "row", gap: 24 },
  friendStat: { alignItems: "center" },
  friendStatNum: { fontSize: 22, fontWeight: "800", color: C.text },
  friendStatLabel: { fontSize: 11, color: C.sub, fontWeight: "600" },

  // Nudge box
  nudgeBox: {
    backgroundColor: "#FFF7ED", borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "#FED7AA",
  },
  nudgeTitle: { fontSize: 15, fontWeight: "700", color: "#9A3412", marginBottom: 4 },
  nudgeSubtitle: { fontSize: 13, color: C.sub, marginBottom: 12 },
  nudgeBtn: {
    backgroundColor: C.yellow, borderRadius: 12, padding: 12,
    alignItems: "center", marginBottom: 8,
  },
  nudgeBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Settings
  settingsRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.card,
    marginHorizontal: 20, marginBottom: 2, padding: 16,
    borderRadius: 12,
  },
  settingsIcon: { fontSize: 20, marginRight: 14 },
  settingsLabel: { flex: 1, fontSize: 15, color: C.text, fontWeight: "600" },

  // Add friend
  addFriendHint: { fontSize: 13, color: C.sub, marginTop: 4 },
});
