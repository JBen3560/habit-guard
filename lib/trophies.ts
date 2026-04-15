import { supabase } from './supabase';

import type { Trophy } from '../src/types';
import { INITIAL_TROPHIES } from '../src/types';

export const PENALTY_TROPHY_TITLES = ['Slacker', 'Gone Missing', 'Streak Breaker'] as const;
export type PenaltyTrophyTitle = (typeof PENALTY_TROPHY_TITLES)[number];

// Raw DB row shape
type DbTrophy = {
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

/**
 * Load the full trophy catalog merged with the user's earned records from the DB.
 * INITIAL_TROPHIES provides the catalog (type, description, icon).
 * The DB is the source of truth for earned state.
 */
export async function loadTrophies(): Promise<Trophy[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('trophies')
    .select('title, unlocked_at')
    .eq('user_id', userId);

  if (error) throw error;

  const earnedMap = new Map(
    (data as Pick<DbTrophy, 'title' | 'unlocked_at'>[]).map((row) => [row.title, row.unlocked_at]),
  );

  return INITIAL_TROPHIES.map((t) => {
    const unlockedAt = earnedMap.get(t.title);
    if (unlockedAt) {
      const date = new Date(unlockedAt);
      return {
        ...t,
        earned: true,
        earnedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        earnedAt: date.getTime(),
      };
    }
    return { ...t, earned: false, earnedDate: undefined, earnedAt: undefined };
  });
}

/**
 * Persist a newly unlocked trophy to the DB.
 * Skips silently if the user already has this trophy (prevents duplicates).
 */
export async function unlockTrophy(
  title: string,
  description?: string | null,
  icon?: string | null,
): Promise<void> {
  if (await hasTrophy(title)) return;

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

export async function setNeedsNudgeForCurrentUser(needsNudge: boolean): Promise<void> {
  const userId = await getUserId();

  const { error } = await supabase
    .from('profiles')
    .update({ needs_nudge: needsNudge })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Daily fallback reset for the logged-in user.
 * Global reset should be handled by a server-side scheduled SQL job.
 */
export async function resetPenaltyStateForCurrentUser(): Promise<void> {
  const userId = await getUserId();

  const { error: deleteError } = await supabase
    .from('trophies')
    .delete()
    .eq('user_id', userId)
    .in('title', [...PENALTY_TROPHY_TITLES]);

  if (deleteError) throw deleteError;

  await setNeedsNudgeForCurrentUser(false);
}

export async function unlockPenaltyTrophy(title: PenaltyTrophyTitle): Promise<void> {
  const catalog = INITIAL_TROPHIES.find((t) => t.title === title);
  await unlockTrophy(title, catalog?.description, catalog?.icon);
  await setNeedsNudgeForCurrentUser(true);
}

// Check if the current user has already earned a trophy by title
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
