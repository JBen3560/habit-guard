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
  return data as FriendRequest[];
}
