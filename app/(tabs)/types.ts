// ─── Types ────────────────────────────────────────────────────────────────────

export type Category =
  | "Medication"
  | "Exercise"
  | "Hydration"
  | "Nutrition"
  | "Mindfulness"
  | "Other";

export type Task = {
  id: string;
  title: string;
  category: Category;
  time: string;
  days: boolean[]; // Sun–Sat
  active: boolean;
  streakCount: number;
  completedToday: boolean;
  skippedToday: boolean;
};

export type Trophy = {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: "gold" | "silver" | "bronze" | "bad" | "streak";
  earned: boolean;
  earnedDate?: string;
};

export type Friend = {
  id: string;
  name: string;
  tag: string;
  streakDays: number;
  missedDays: number;
  avatar: string;
  tasks: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  "Medication",
  "Exercise",
  "Hydration",
  "Nutrition",
  "Mindfulness",
  "Other",
];

export const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export const CATEGORY_COLORS: Record<Category, string> = {
  Medication: "#3B82F6",
  Exercise: "#10B981",
  Hydration: "#06B6D4",
  Nutrition: "#F59E0B",
  Mindfulness: "#8B5CF6",
  Other: "#6B7280",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Medication: "💊",
  Exercise: "🏃",
  Hydration: "💧",
  Nutrition: "🥗",
  Mindfulness: "🧘",
  Other: "⭐",
};

// ─── Initial Data ─────────────────────────────────────────────────────────────

export const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Morning Medication",
    category: "Medication",
    time: "08:00",
    days: [true, true, true, true, true, true, true],
    active: true,
    streakCount: 6,
    completedToday: false,
    skippedToday: false,
  },
  {
    id: "2",
    title: "Evening Medication",
    category: "Medication",
    time: "21:00",
    days: [true, true, true, true, true, true, true],
    active: true,
    streakCount: 8,
    completedToday: false,
    skippedToday: false,
  },
  {
    id: "3",
    title: "Morning Walk",
    category: "Exercise",
    time: "07:30",
    days: [true, true, true, true, true, true, false],
    active: true,
    streakCount: 1,
    completedToday: false,
    skippedToday: false,
  },
  {
    id: "4",
    title: "Drink Water (Morning)",
    category: "Hydration",
    time: "07:00",
    days: [true, true, true, true, true, true, true],
    active: true,
    streakCount: 13,
    completedToday: false,
    skippedToday: false,
  },
  {
    id: "5",
    title: "Drink Water (Afternoon)",
    category: "Hydration",
    time: "14:00",
    days: [true, true, true, true, true, true, true],
    active: true,
    streakCount: 8,
    completedToday: false,
    skippedToday: false,
  },
];

export const INITIAL_TROPHIES: Trophy[] = [
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

export const INITIAL_FRIENDS: Friend[] = [
  { id: "f1", name: "Alex Rivera", tag: "@alex_r", streakDays: 14, missedDays: 0, avatar: "🧑", tasks: 5 },
  { id: "f2", name: "Jamie Chen", tag: "@jchen", streakDays: 3, missedDays: 3, avatar: "👩", tasks: 4 },
  { id: "f3", name: "Morgan Lee", tag: "@morganlee", streakDays: 0, missedDays: 7, avatar: "🧔", tasks: 2 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const genId = () => Math.random().toString(36).slice(2);

export const today = new Date();
export const todayIdx = today.getDay(); // 0 = Sunday

// ─── Shared Style Colors ──────────────────────────────────────────────────────
// Call getColors(isDark) in each screen/component to get the right palette.
// The accent colors (blue, green, yellow, red) stay the same in both modes —
// only the surface and text colors shift.

export const getColors = (isDark: boolean) => ({
  // Surfaces
  bg:     isDark ? "#111827" : "#F9FAFB",  // page background
  card:   isDark ? "#1F2937" : "#FFFFFF",  // card / tab bar background
  // Text
  text:   isDark ? "#F9FAFB" : "#111827",  // primary text
  sub:    isDark ? "#9CA3AF" : "#6B7280",  // secondary / muted text
  // Borders & dividers
  border: isDark ? "#374151" : "#E5E7EB",
  // Accents — unchanged across modes
  blue:   "#3B82F6",
  green:  "#10B981",
  yellow: "#F59E0B",
  red:    "#EF4444",
});

// Convenience type so screens can type their local C variable
export type Colors = ReturnType<typeof getColors>;
