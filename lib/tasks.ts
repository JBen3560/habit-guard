import { supabase } from './supabase';

import { type Category, type Task } from '@/src/types';

const COMPLETIONS_TABLE = 'task_completions';

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('User not logged in');
  return data.user.id;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

type DbTaskRow = {
  id: string;
  title: string;
  category: string;
  time: string;
  days: boolean[];
  active: boolean;
  streak_count: number;
};

type DbCompletionRow = {
  task_id: string;
  completed: boolean;
  skipped: boolean;
};

// Load all tasks for the current user and overlay today's completions
export async function loadTasks(): Promise<Task[]> {
  const userId = await getUserId();
  const today = todayISO();

  const [{ data: taskRows, error: taskError }, { data: completionRows }] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, category, time, days, active, streak_count')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
    supabase
      .from(COMPLETIONS_TABLE)
      .select('task_id, completed, skipped')
      .eq('user_id', userId)
      .eq('date', today),
  ]);

  if (taskError) throw taskError;

  const completionMap = new Map<string, { completed: boolean; skipped: boolean }>();
  for (const c of (completionRows ?? []) as DbCompletionRow[]) {
    completionMap.set(c.task_id, { completed: c.completed, skipped: c.skipped });
  }

  return ((taskRows ?? []) as DbTaskRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category as Category,
    time: row.time,
    days: row.days,
    active: row.active,
    streakCount: row.streak_count ?? 0,
    completedToday: completionMap.get(row.id)?.completed ?? false,
    skippedToday: completionMap.get(row.id)?.skipped ?? false,
  }));
}

type TaskFormData = Omit<Task, 'id' | 'streakCount' | 'completedToday' | 'skippedToday'>;

// Insert a new task and return it as a full Task object
export async function insertTask(form: TaskFormData): Promise<Task> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: form.title,
      category: form.category,
      time: form.time,
      days: form.days,
      active: form.active,
      streak_count: 0,
    })
    .select('id, title, category, time, days, active, streak_count')
    .single();

  if (error) throw error;
  const row = data as DbTaskRow;
  return {
    id: row.id,
    title: row.title,
    category: row.category as Category,
    time: row.time,
    days: row.days,
    active: row.active,
    streakCount: 0,
    completedToday: false,
    skippedToday: false,
  };
}

// Update an existing task's non-streak fields
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

// Persist an updated streak count back to the DB
export async function updateStreakCount(taskId: string, streakCount: number): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ streak_count: streakCount })
    .eq('id', taskId);

  if (error) throw error;
}

// Delete a task (completions cascade automatically)
export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

// Upsert a completion for today (toggling done or skipped)
export async function upsertCompletion(taskId: string, status: 'done' | 'skipped'): Promise<void> {
  const userId = await getUserId();

  const { error } = await supabase
    .from(COMPLETIONS_TABLE)
    .upsert(
      {
        task_id: taskId,
        user_id: userId,
        date: todayISO(),
        completed: status === 'done',
        skipped: status === 'skipped',
      },
      { onConflict: 'task_id,date' },
    );

  if (error) throw error;
}

// Remove today's completion for a task (un-checking or un-skipping)
export async function removeCompletion(taskId: string): Promise<void> {
  const userId = await getUserId();

  const { error } = await supabase
    .from(COMPLETIONS_TABLE)
    .delete()
    .eq('task_id', taskId)
    .eq('user_id', userId)
    .eq('date', todayISO());

  if (error) throw error;
}
