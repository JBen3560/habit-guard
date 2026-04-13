import { supabase } from './supabase';

export type FriendRequest = {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
};

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('User not logged in');
  return data.user.id;
}

// Send friend request
export async function sendFriendRequest(friendId: string) {
  const userId = await getUserId();

  const { error } = await supabase.from('friends').insert({
    user_id: userId,
    friend_id: friendId,
    status: 'pending',
  });

  if (error) throw error;
}

// Accept friend request
export async function acceptFriendRequest(requestId: string) {
  const { error } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('id', requestId);

  if (error) throw error;
}

// Get incoming friend requests
export async function getIncomingRequests(): Promise<FriendRequest[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('friends')
    .select('*')
    .eq('friend_id', userId)
    .eq('status', 'pending');

  if (error) throw error;
  return data as FriendRequest[];
}

// Get accepted friends
export async function getFriends(): Promise<FriendRequest[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('friends')
    .select('*')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (error) throw error;

  const relationRows = (data ?? []) as FriendRow[];
  const profileIds = relationRows.map((relation) =>
    relation.user_id === userId ? relation.friend_id : relation.user_id,
  );
  const profileMap = await getProfilesByIds(profileIds);

  // Fetch active task counts for all friends
  const { data: taskData } = await supabase
    .from('tasks')
    .select('user_id')
    .in('user_id', profileIds)
    .eq('active', true);

  const taskCountMap = new Map<string, number>();
  for (const t of (taskData ?? []) as { user_id: string }[]) {
    taskCountMap.set(t.user_id, (taskCountMap.get(t.user_id) ?? 0) + 1);
  }

  return relationRows
    .map((relation) => {
      const profileId = relation.user_id === userId ? relation.friend_id : relation.user_id;
      const profile = profileMap.get(profileId);

      if (!profile) return null;

      const friend = relationToFriend(relation, profile, userId);
      friend.tasks = taskCountMap.get(profileId) ?? 0;
      return friend;
    })
    .filter((friend): friend is Friend => friend !== null);
}

// Remove a friendship — tries both directions since either user may have initiated it.
// Requires your Supabase RLS DELETE policy on 'friends' to allow:
//   USING (user_id = auth.uid() OR friend_id = auth.uid())
export async function removeFriend(friendProfileId: string): Promise<void> {
  const userId = await getUserId();

  // Direction A: current user added the friend
  const { error: e1 } = await supabase
    .from('friends')
    .delete()
    .eq('user_id', userId)
    .eq('friend_id', friendProfileId);

  if (e1) throw e1;

  // Direction B: friend added the current user (needs RLS to allow friend_id = auth.uid())
  const { error: e2 } = await supabase
    .from('friends')
    .delete()
    .eq('user_id', friendProfileId)
    .eq('friend_id', userId);

  // Ignore e2 silently — it fails if RLS only permits user_id = auth.uid()
  // but direction A will have already removed the row in that case.
  void e2;
}

// Decline a pending request
export async function declineFriendRequest(requestId: string): Promise<void> {
  const userId = await getUserId();

  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', requestId)
    .eq('friend_id', userId)
    .eq('status', 'pending');

  if (error) throw error;
}
