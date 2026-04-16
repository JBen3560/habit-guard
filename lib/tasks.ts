import { supabase } from './supabase';

import { CATEGORY_META, INITIAL_TASKS } from '../src/mockData';
import type { Task } from '../src/types';
import { CATEGORY_COLORS, type Category } from '../src/types';

// Raw DB row shapes

type DbTask = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  time: string;
  days: boolean[];
  active: boolean;
  streak_count: number;
  skipped_count?: number;
  created_at: string;
};

type DbCompletion = {
  id: string;
  task_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  skipped: boolean;
  completed_once?: boolean;
  skipped_once?: boolean;
};

export type ProgressDay = {
  date: string;
  label: string;
  dayNum: number;
  completed: number;
  total: number;
  rate: number;
};

export type ProgressCategoryStat = {
  category: Category;
  label: string;
  icon: string;
  color: string;
  rate: number;
  completed: number;
  total: number;
};

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('User not logged in');
  return data.user.id;
}

function dateStr(d = new Date()): string {
  return d.toISOString().split('T')[0];
}

function shiftDate(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(base.getDate() + days);
  return next;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toTask(row: DbTask, comp?: DbCompletion): Task {
  return {
    id: row.id,
    title: row.title,
    category: row.category as Category,
    time: row.time,
    days: row.days,
    active: row.active,
    streakCount: row.streak_count,
    completedToday: comp?.completed ?? false,
    skippedToday: comp?.skipped ?? false,
    completedOnceToday: comp?.completed_once ?? false,
    skippedOnceToday: comp?.skipped_once ?? false,
  };
}

// ──────────────────────────────────────────────
// Task CRUD
// ──────────────────────────────────────────────

/** Fetch all tasks for the current user, with today's completion status merged in. */
export async function getTasks(): Promise<Task[]> {
  const userId = await getUserId();
  const today = dateStr();

  const [{ data: rows, error: e1 }, { data: comps, error: e2 }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
    supabase
      .from('task_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today),
  ]);

  if (e1) throw e1;
  if (e2) throw e2;

  const compMap = new Map((comps as DbCompletion[]).map((c) => [c.task_id, c]));
  return (rows as DbTask[]).map((row) => toTask(row, compMap.get(row.id)));
}

export type TaskFormData = Pick<Task, 'title' | 'category' | 'time' | 'days' | 'active'>;

const STARTER_TASK_TITLES = [
  'Morning Medication',
  'Morning Water',
  'Touch Grass',
  'Brush Teeth (AM)',
  'Deep Breathing',
] as const;

/**
 * Seed five starter tasks for a new user.
 * The tasks are pulled from INITIAL_TASKS so the seeded data stays aligned
 * with the app's built-in catalog.
 */
export async function seedStarterTasks(userId: string): Promise<void> {
  const starterTasks = STARTER_TASK_TITLES.map((title) => {
    const task = INITIAL_TASKS.find((item) => item.title === title);
    if (!task) {
      throw new Error(`Starter task not found: ${title}`);
    }

    return {
      user_id: userId,
      title: task.title,
      category: task.category,
      time: task.time,
      days: task.days,
      active: task.active,
      streak_count: 0,
      skipped_count: 0,
    };
  });

  const { error } = await supabase.rpc('seed_starter_tasks', {
    p_user_id: userId,
    p_tasks: starterTasks,
  });
  if (error) throw error;
}

/** Create a new task. */
export async function createTask(form: TaskFormData): Promise<void> {
  const userId = await getUserId();
  const { error } = await supabase.from('tasks').insert({
    user_id: userId,
    title: form.title,
    category: form.category,
    time: form.time,
    days: form.days,
    active: form.active,
  });
  if (error) throw error;
}

/** Update an existing task's fields. */
export async function updateTask(id: string, form: TaskFormData): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({
      title: form.title,
      category: form.category,
      time: form.time,
      days: form.days,
      active: form.active,
    })
    .eq('id', id);
  if (error) throw error;
}

/** Delete a task (cascade removes its completions). */
export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

/** Persist the streak count for a task. */
export async function updateStreakCount(id: string, streakCount: number): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ streak_count: streakCount })
    .eq('id', id);
  if (error) throw error;
}

/** Increment skipped_count whenever a task is newly marked skipped. */
export async function incrementTaskSkippedCount(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('tasks')
    .select('skipped_count')
    .eq('id', id)
    .single();

  if (error) throw error;

  const current = (data as { skipped_count: number | null }).skipped_count ?? 0;
  const { error: updateError } = await supabase
    .from('tasks')
    .update({ skipped_count: current + 1 })
    .eq('id', id);

  if (updateError) throw updateError;
}

/** Reset skipped_count to zero when a task is completed. */
export async function resetTaskSkippedCount(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ skipped_count: 0 })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Count consecutive days (including today) where every scheduled active task was skipped.
 * A day with no scheduled active tasks breaks the streak.
 */
export async function getConsecutiveAllSkippedDays(maxDays = 7): Promise<number> {
  const userId = await getUserId();
  const today = new Date();
  const start = dateStr(shiftDate(today, -(maxDays - 1)));
  const end = dateStr(today);

  const [{ data: taskRows, error: taskError }, { data: completionRows, error: completionError }] =
    await Promise.all([
      supabase
        .from('tasks')
        .select('id, days, active')
        .eq('user_id', userId)
        .eq('active', true),
      supabase
        .from('task_completions')
        .select('task_id, date, skipped_once, completed_once')
        .eq('user_id', userId)
        .gte('date', start)
        .lte('date', end),
    ]);

  if (taskError) throw taskError;
  if (completionError) throw completionError;

  const activeTasks = (taskRows ?? []) as Pick<DbTask, 'id' | 'days' | 'active'>[];
  if (activeTasks.length === 0) return 0;

  const completionMap = new Map<string, DbCompletion>();
  for (const row of (completionRows ?? []) as DbCompletion[]) {
    completionMap.set(`${row.date}|${row.task_id}`, row);
  }

  let streak = 0;
  for (let offset = 0; offset < maxDays; offset += 1) {
    const day = shiftDate(today, -offset);
    const date = dateStr(day);
    const weekday = day.getDay();

    const scheduledTaskIds = activeTasks
      .filter((task) => Boolean(task.days?.[weekday]))
      .map((task) => task.id);

    if (scheduledTaskIds.length === 0) break;

    const allSkipped = scheduledTaskIds.every((taskId) => {
      const completion = completionMap.get(`${date}|${taskId}`);
      return Boolean(completion?.skipped_once) && !Boolean(completion?.completed_once);
    });

    if (!allSkipped) break;
    streak += 1;
  }

  return streak;
}

/**
 * Build real progress metrics from persisted completion history.
 * Returns day-level completion rates and category-level completion rates.
 */
export async function getProgressData(days = 28): Promise<{
  history: ProgressDay[];
  categoryStats: ProgressCategoryStat[];
}> {
  const userId = await getUserId();
  const today = new Date();
  const startDate = shiftDate(today, -(days - 1));
  const start = dateStr(startDate);
  const end = dateStr(today);

  const [{ data: taskRows, error: taskError }, { data: completionRows, error: completionError }] =
    await Promise.all([
      supabase
        .from('tasks')
        .select('id, category, days, active')
        .eq('user_id', userId)
        .eq('active', true),
      supabase
        .from('task_completions')
        .select('task_id, date, completed')
        .eq('user_id', userId)
        .gte('date', start)
        .lte('date', end),
    ]);

  if (taskError) throw taskError;
  if (completionError) throw completionError;

  const activeTasks = (taskRows ?? []) as Array<{
    id: string;
    category: Category;
    days: boolean[];
    active: boolean;
  }>;

  const completionMap = new Map<string, boolean>();
  for (const row of (completionRows ?? []) as Array<{ task_id: string; date: string; completed: boolean }>) {
    completionMap.set(`${row.date}|${row.task_id}`, Boolean(row.completed));
  }

  const history: ProgressDay[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = shiftDate(today, -i);
    const ds = dateStr(d);
    const dayIdx = d.getDay();

    const scheduledIds = activeTasks
      .filter((t) => Boolean(t.days?.[dayIdx]))
      .map((t) => t.id);

    const total = scheduledIds.length;
    const completed = scheduledIds.filter((taskId) => completionMap.get(`${ds}|${taskId}`)).length;

    history.push({
      date: ds,
      label: DAY_NAMES[dayIdx],
      dayNum: d.getDate(),
      completed,
      total,
      rate: total > 0 ? completed / total : 0,
    });
  }

  const categoryStats: ProgressCategoryStat[] = [];

  for (const category of Object.keys(CATEGORY_COLORS) as Category[]) {
    const categoryTaskIds = activeTasks
      .filter((t) => t.category === category)
      .map((t) => t.id);

    if (categoryTaskIds.length === 0) continue;

    let completed = 0;
    let total = 0;

    for (const day of history) {
      const dayIdx = new Date(`${day.date}T12:00:00`).getDay();
      const scheduledInCategory = activeTasks
        .filter((t) => t.category === category && Boolean(t.days?.[dayIdx]))
        .map((t) => t.id);

      total += scheduledInCategory.length;
      completed += scheduledInCategory.filter((taskId) => completionMap.get(`${day.date}|${taskId}`)).length;
    }

    const meta = CATEGORY_META[category];
    categoryStats.push({
      category,
      label: category,
      icon: meta.icon,
      color: meta.color,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      completed,
      total,
    });
  }

  categoryStats.sort((a, b) => b.rate - a.rate);

  return { history, categoryStats };
}

// ──────────────────────────────────────────────
// Completions
// ──────────────────────────────────────────────

/**
 * Upsert a completion record for today.
 * Relies on the unique(task_id, date) constraint for conflict resolution.
 */
export async function upsertCompletion(
  taskId: string,
  completed: boolean,
  skipped: boolean,
): Promise<{ completedOnce: boolean; skippedOnce: boolean }> {
  const userId = await getUserId();
  const today = dateStr();

  const { data: existing, error: existingError } = await supabase
    .from('task_completions')
    .select('completed_once, skipped_once')
    .eq('task_id', taskId)
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (existingError) throw existingError;

  const completedOnce = Boolean((existing as DbCompletion | null)?.completed_once) || completed;
  const skippedOnce = Boolean((existing as DbCompletion | null)?.skipped_once) || skipped;

  const { error } = await supabase.from('task_completions').upsert(
    {
      task_id: taskId,
      user_id: userId,
      date: today,
      completed,
      skipped,
      completed_once: completedOnce,
      skipped_once: skippedOnce,
    },
    { onConflict: 'task_id,date' },
  );
  if (error) throw error;

  return { completedOnce, skippedOnce };
}
