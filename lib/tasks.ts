import { supabase } from './supabase';

import type { Category, Task } from '../src/types';

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
        .select('task_id, date, skipped, completed')
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
      return Boolean(completion?.skipped) && !Boolean(completion?.completed);
    });

    if (!allSkipped) break;
    streak += 1;
  }

  return streak;
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
): Promise<void> {
  const userId = await getUserId();
  const { error } = await supabase.from('task_completions').upsert(
    {
      task_id: taskId,
      user_id: userId,
      date: dateStr(),
      completed,
      skipped,
    },
    { onConflict: 'task_id,date' },
  );
  if (error) throw error;
}
