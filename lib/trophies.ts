import { supabase } from './supabase';

export type Trophy = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  unlocked_at: string | null;
  created_at: string;
};

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('User not logged in');
  return data.user.id;
}

// Get all trophies for user
export async function getTrophies(): Promise<Trophy[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('trophies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Trophy[];
}

// Unlock trophy
export async function unlockTrophy(title: string, description?: string, icon?: string) {
  const userId = await getUserId();

  const { error } = await supabase.from('trophies').insert({
    user_id: userId,
    title,
    description: description ?? null,
    icon: icon ?? '🏆',
    unlocked_at: new Date().toISOString(),
  });

  if (error) throw error;
}

// Check if trophy already unlocked
export async function hasTrophy(title: string): Promise<boolean> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('trophies')
    .select('id')
    .eq('user_id', userId)
    .eq('title', title)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}
