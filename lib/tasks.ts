import { supabase } from './supabase';

export type Task = {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
};

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('User not logged in');
  return data.user.id;
}

// Fetch all tasks
export async function getTasks(): Promise<Task[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Task[];
}

// Create new task
export async function createTask(title: string) {
  const userId = await getUserId();

  const { error } = await supabase.from('tasks').insert({
    title,
    user_id: userId,
    completed: false,
  });

  if (error) throw error;
}

// Toggle completion
export async function toggleTask(id: string, completed: boolean) {
  const { error } = await supabase.from('tasks').update({ completed }).eq('id', id);

  if (error) throw error;
}

// Delete task
export async function deleteTask(id: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);

  if (error) throw error;
}
