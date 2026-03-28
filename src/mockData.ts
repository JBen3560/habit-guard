import { type Category, CATEGORY_COLORS, type Task } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const genId = () => Math.random().toString(36).slice(2);

const EVERY_DAY: boolean[] = [true, true, true, true, true, true, true];
const WEEKDAYS: boolean[] = [false, true, true, true, true, true, false];
const WEEKENDS: boolean[] = [true, false, false, false, false, false, true];

function makeTask(
  overrides: Partial<Task> & Pick<Task, 'title' | 'category' | 'time'> & { streakCount?: number },
): Task {
  return {
    id: genId(),
    days: EVERY_DAY,
    active: true,
    streakCount: 0,
    completedToday: false,
    skippedToday: false,
    ...overrides,
  };
}

// ─── Initial Tasks ────────────────────────────────────────────────────────────

export const INITIAL_TASKS: Task[] = [
  // Medication
  makeTask({ title: 'Morning Medication', category: 'Medication', time: '08:00', streakCount: 14 }),
  makeTask({ title: 'Evening Medication', category: 'Medication', time: '21:00', streakCount: 12 }),
  makeTask({ title: 'Vitamins', category: 'Medication', time: '08:00', streakCount: 7 }),
  // Exercise
  makeTask({
    title: 'Morning Walk',
    category: 'Exercise',
    time: '07:30',
    streakCount: 4,
    days: WEEKDAYS,
  }),
  makeTask({
    title: 'Evening Walk',
    category: 'Exercise',
    time: '19:00',
    streakCount: 2,
    days: WEEKDAYS,
  }),
  makeTask({ title: 'Stretch Break', category: 'Exercise', time: '11:00', streakCount: 3 }),
  makeTask({ title: 'Sunlight Exposure', category: 'Exercise', time: '10:00', streakCount: 5 }),
  makeTask({
    title: 'Weekend Workout',
    category: 'Exercise',
    time: '09:00',
    streakCount: 1,
    days: WEEKENDS,
  }),
  // Hydration
  makeTask({ title: 'Morning Water', category: 'Hydration', time: '07:00', streakCount: 21 }),
  makeTask({ title: 'Afternoon Water', category: 'Hydration', time: '14:00', streakCount: 13 }),
  makeTask({ title: 'Evening Water', category: 'Hydration', time: '20:00', streakCount: 9 }),
  // Nutrition
  makeTask({ title: 'Eat Breakfast', category: 'Nutrition', time: '08:30', streakCount: 6 }),
  makeTask({
    title: 'Healthy Lunch',
    category: 'Nutrition',
    time: '12:30',
    streakCount: 4,
    days: WEEKDAYS,
  }),
  makeTask({
    title: 'No Late-Night Snacking',
    category: 'Nutrition',
    time: '21:00',
    streakCount: 2,
  }),
  // Mindfulness
  makeTask({ title: 'Deep Breathing', category: 'Mindfulness', time: '09:00', streakCount: 5 }),
  makeTask({ title: 'Journal Entry', category: 'Mindfulness', time: '21:00', streakCount: 1 }),
  makeTask({ title: 'Gratitude Check-In', category: 'Mindfulness', time: '08:00', streakCount: 3 }),
  makeTask({ title: 'Touch Grass', category: 'Mindfulness', time: '19:00', streakCount: 2 }),
  // Hygiene
  makeTask({ title: 'Brush Teeth (AM)', category: 'Hygiene', time: '07:15', streakCount: 0 }),
  makeTask({ title: 'Brush Teeth (PM)', category: 'Hygiene', time: '21:30', streakCount: 28 }),
  makeTask({ title: 'Shower', category: 'Hygiene', time: '07:00', streakCount: 18 }),
  makeTask({ title: 'Floss', category: 'Hygiene', time: '21:30', streakCount: 8 }),
  makeTask({ title: 'Skincare Routine', category: 'Hygiene', time: '22:00', streakCount: 5 }),
  // Sleep
  makeTask({ title: 'Wind Down — No Screens', category: 'Sleep', time: '22:30', streakCount: 2 }),
  makeTask({ title: 'Consistent Bedtime', category: 'Sleep', time: '23:00', streakCount: 1 }),
  makeTask({ title: 'No Caffeine After 2PM', category: 'Sleep', time: '14:00', streakCount: 4 }),
];

// ─── Category metadata (MaterialIcons names) ─────────────────────────────────

export const CATEGORY_META: Record<Category, { icon: string; color: string }> = {
  Medication: { icon: 'medication', color: CATEGORY_COLORS.Medication },
  Exercise: { icon: 'fitness-center', color: CATEGORY_COLORS.Exercise },
  Hydration: { icon: 'water-drop', color: CATEGORY_COLORS.Hydration },
  Nutrition: { icon: 'restaurant', color: CATEGORY_COLORS.Nutrition },
  Mindfulness: { icon: 'self-improvement', color: CATEGORY_COLORS.Mindfulness },
  Hygiene: { icon: 'clean-hands', color: CATEGORY_COLORS.Hygiene },
  Sleep: { icon: 'bedtime', color: CATEGORY_COLORS.Sleep },
  Other: { icon: 'star', color: CATEGORY_COLORS.Other },
};

// ─── Simulated history (28 days) ─────────────────────────────────────────────
// Each entry: date string → fraction of tasks completed that day (0–1)
// Used by the profile progress charts. Seeded deterministically so it looks
// realistic but is always the same on re-render.

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export type DayHistory = {
  date: string; // 'YYYY-MM-DD'
  label: string; // 'Mon', 'Tue', …
  dayNum: number; // day-of-month number
  completed: number; // count completed
  total: number; // count scheduled
  rate: number; // 0–1
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Completion rate by category for the heatmap/category bars.
// We simulate per-category rates seeded off the category index.
export type CategoryStat = {
  category: Category;
  label: string;
  icon: string;
  color: string;
  rate: number; // 0–100
  completed: number;
  total: number;
};

export function buildHistory(tasks: Task[]): DayHistory[] {
  const days: DayHistory[] = [];
  const now = new Date();

  for (let i = 27; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayIdx = d.getDay();
    const label = DAY_NAMES[dayIdx];

    // Count tasks scheduled for this day of week
    const scheduled = tasks.filter((t) => t.active && t.days[dayIdx]);
    const total = scheduled.length;

    // Seed: use (28 - i) so day 0 is oldest, day 27 is yesterday.
    // Rate trends upward slightly over the 28 days to look like progress.
    const baseSeed = 28 - i;
    const trendBoost = ((28 - i) / 28) * 0.15; // up to +15% improvement
    const rawRate = 0.55 + trendBoost + (seededRand(baseSeed) * 0.3 - 0.1);
    const rate = Math.min(Math.max(rawRate, 0), 1);
    const completed = Math.round(total * rate);

    days.push({
      date: dateStr,
      label,
      dayNum: d.getDate(),
      completed,
      total,
      rate: total > 0 ? completed / total : 0,
    });
  }
  return days;
}

export function getWeeklyData(history: DayHistory[]): DayHistory[] {
  return history.slice(-7);
}

export function getCategoryStats(tasks: Task[], history: DayHistory[]): CategoryStat[] {
  // Overall completion rate from history
  const overallRate =
    history.length > 0 ? history.reduce((sum, d) => sum + d.rate, 0) / history.length : 0.65;

  // Group tasks by category
  const catMap: Partial<Record<Category, Task[]>> = {};
  for (const t of tasks) {
    if (!t.active) continue;
    if (!catMap[t.category]) catMap[t.category] = [];
    catMap[t.category]!.push(t);
  }

  return (Object.entries(catMap) as [Category, Task[]][])
    .map(([cat, catTasks], idx) => {
      // Each category gets a slightly different rate seeded off its index
      const variance = (seededRand(idx * 7) - 0.5) * 0.25;
      const rawRate = Math.min(Math.max(overallRate + variance, 0.1), 1);
      const total = catTasks.length * history.length;
      const completed = Math.round(total * rawRate);
      const meta = CATEGORY_META[cat];
      return {
        category: cat,
        label: cat,
        icon: meta.icon,
        color: meta.color,
        rate: Math.round(rawRate * 100),
        completed,
        total,
      };
    })
    .sort((a, b) => b.rate - a.rate);
}
