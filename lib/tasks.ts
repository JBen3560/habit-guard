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
