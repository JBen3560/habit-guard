import { supabase } from './supabase';

export type NudgeRow = {
  id: string;
  sender_user_id: string;
  recipient_user_id: string;
  message: string | null;
  sender_display_name: string | null;
  created_at: string;
  delivered_at: string | null;
  seen_at: string | null;
};

type DbErrorShape = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function parseError(error: unknown): DbErrorShape {
  if (!error || typeof error !== 'object') {
    return {};
  }

  const maybe = error as DbErrorShape;
  return {
    code: maybe.code,
    message: maybe.message,
    details: maybe.details,
    hint: maybe.hint,
  };
}

export function getNudgeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === 'User not logged in') {
    return 'You are signed out. Please sign in again and try nudging.';
  }

  const { code, message } = parseError(error);
  const raw = (message ?? '').toLowerCase();

  if (raw.includes('please wait before nudging this friend again')) {
    return 'You already nudged this friend recently. Please wait 30 minutes before sending another nudge.';
  }

  if (code === '42501' || raw.includes('row-level security')) {
    return 'You can only nudge accepted friends. Make sure both accounts are connected as friends.';
  }

  if (code === '23503') {
    return 'This friend account could not be found. Refresh your friends list and try again.';
  }

  if (raw.includes('jwt') || raw.includes('token') || raw.includes('session')) {
    return 'Your session expired. Please sign in again and retry.';
  }

  if (code) {
    return `Could not send nudge right now (error ${code}). Please try again.`;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'Could not send nudge right now. Please try again.';
}

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('User not logged in');
  return data.user.id;
}

export async function sendNudge(recipientUserId: string, message?: string): Promise<NudgeRow> {
  await getUserId();

  const { data, error } = await supabase.rpc('create_nudge', {
    recipient: recipientUserId,
    body: message?.trim() || null,
  });

  if (error) throw error;
  return data as NudgeRow;
}

export async function listPendingNudges(limit = 20): Promise<NudgeRow[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('nudges')
    .select(
      'id, sender_user_id, recipient_user_id, message, sender_display_name, created_at, delivered_at, seen_at',
    )
    .eq('recipient_user_id', userId)
    .is('seen_at', null)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as NudgeRow[];
}

export async function markNudgesDelivered(nudgeIds: string[]): Promise<void> {
  if (nudgeIds.length === 0) return;
  const userId = await getUserId();

  const { error } = await supabase
    .from('nudges')
    .update({ delivered_at: new Date().toISOString() })
    .eq('recipient_user_id', userId)
    .in('id', nudgeIds)
    .is('delivered_at', null);

  if (error) throw error;
}

export async function markNudgeSeen(nudgeId: string): Promise<void> {
  const userId = await getUserId();

  const { error } = await supabase
    .from('nudges')
    .update({ seen_at: new Date().toISOString() })
    .eq('recipient_user_id', userId)
    .eq('id', nudgeId)
    .is('seen_at', null);

  if (error) throw error;
}

export function subscribeToIncomingNudges(
  recipientUserId: string,
  onNudge: (nudge: NudgeRow) => void,
): () => void {
  const channel = supabase
    .channel(`nudges:${recipientUserId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'nudges',
        filter: `recipient_user_id=eq.${recipientUserId}`,
      },
      (payload) => {
        onNudge(payload.new as NudgeRow);
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
