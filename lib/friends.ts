import { supabase } from './supabase';

import { PROFILE_PHOTOS, type Friend } from '@/src/types';

export type FriendStatus = 'pending' | 'accepted';

export type FriendRow = {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendStatus;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  description: string | null;
};

export type FriendRequest = FriendRow;

async function getUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('User not logged in');
  return data.user.id;
}

function normalizeUsername(value: string): string {
  return value.trim().replace(/^@+/, '');
}

function resolvePhoto(username: string | null | undefined) {
  if (!username) return undefined;
  return PROFILE_PHOTOS[username as keyof typeof PROFILE_PHOTOS];
}

async function getProfileByUsername(username: string): Promise<ProfileRow | null> {
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, description')
    .ilike('username', normalizedUsername)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as ProfileRow | null;
}

async function getProfilesByIds(profileIds: string[]): Promise<Map<string, ProfileRow>> {
  if (profileIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, description')
    .in('id', profileIds);

  if (error) throw error;

  const profileMap = new Map<string, ProfileRow>();
  for (const profile of (data ?? []) as ProfileRow[]) {
    profileMap.set(profile.id, profile);
  }

  return profileMap;
}

function relationToFriend(relation: FriendRow, profile: ProfileRow, userId: string): Friend {
  const friendUsername = profile.username ?? profile.display_name ?? 'friend';
  const friendName = profile.display_name ?? profile.username ?? 'Unknown friend';
  const profileId = relation.user_id === userId ? relation.friend_id : relation.user_id;

  return {
    id: relation.id,
    relationId: relation.id,
    profileId,
    name: friendName,
    tag: `@${normalizeUsername(friendUsername)}`,
    streakDays: 0,
    missedDays: 0,
    photo: resolvePhoto(profile.username),
    tasks: 0,
    bio: profile.description ?? undefined,
  };
}

async function getFriendRelation(userId: string, friendId: string): Promise<FriendRow | null> {
  const [forward, reverse] = await Promise.all([
    supabase
      .from('friends')
      .select('id, user_id, friend_id, status, created_at')
      .eq('user_id', userId)
      .eq('friend_id', friendId)
      .maybeSingle(),
    supabase
      .from('friends')
      .select('id, user_id, friend_id, status, created_at')
      .eq('user_id', friendId)
      .eq('friend_id', userId)
      .maybeSingle(),
  ]);

  if (forward.error) throw forward.error;
  if (reverse.error) throw reverse.error;

  return (forward.data ?? reverse.data ?? null) as FriendRow | null;
}

export async function getProfileByTag(tag: string): Promise<ProfileRow | null> {
  return getProfileByUsername(tag);
}

export async function addFriendByTag(tag: string): Promise<FriendRow> {
  const userId = await getUserId();
  const profile = await getProfileByUsername(tag);

  if (!profile) {
    throw new Error(`No profile found for ${normalizeUsername(tag)}`);
  }

  if (profile.id === userId) {
    throw new Error('You cannot add yourself as a friend');
  }

  const existingRelation = await getFriendRelation(userId, profile.id);
  if (existingRelation?.status === 'accepted') {
    throw new Error('You are already friends');
  }
  if (existingRelation?.status === 'pending') {
    throw new Error('A friend request already exists');
  }

  const { data, error } = await supabase
    .from('friends')
    .insert({
      user_id: userId,
      friend_id: profile.id,
      status: 'accepted',
    })
    .select('id, user_id, friend_id, status, created_at')
    .single();

  if (error) throw error;
  return data as FriendRow;
}

// Send friend request
export async function sendFriendRequest(friendId: string): Promise<FriendRow> {
  const userId = await getUserId();

  if (friendId === userId) {
    throw new Error('You cannot send a friend request to yourself');
  }

  const existingRelation = await getFriendRelation(userId, friendId);
  if (existingRelation?.status === 'accepted') {
    throw new Error('You are already friends');
  }
  if (existingRelation?.status === 'pending') {
    throw new Error('A friend request already exists');
  }

  const { data, error } = await supabase
    .from('friends')
    .insert({
      user_id: userId,
      friend_id: friendId,
      status: 'pending',
    })
    .select('id, user_id, friend_id, status, created_at')
    .single();

  if (error) throw error;
  return data as FriendRow;
}

// Accept friend request
export async function acceptFriendRequest(requestId: string): Promise<FriendRow> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('id', requestId)
    .eq('friend_id', userId)
    .eq('status', 'pending')
    .select('id, user_id, friend_id, status, created_at')
    .single();

  if (error) throw error;
  return data as FriendRow;
}

// Get incoming friend requests
export async function getIncomingRequests(): Promise<FriendRequest[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('friends')
    .select('id, user_id, friend_id, status, created_at')
    .eq('friend_id', userId)
    .eq('status', 'pending');

  if (error) throw error;
  return data as FriendRequest[];
}

// Get outgoing friend requests
export async function getOutgoingRequests(): Promise<FriendRequest[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('friends')
    .select('id, user_id, friend_id, status, created_at')
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (error) throw error;
  return data as FriendRequest[];
}

// Get accepted friends as display cards
export async function getFriends(): Promise<Friend[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from('friends')
    .select('id, user_id, friend_id, status, created_at')
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

// Remove a friendship or pending request
export async function removeFriend(friendIdOrRelationId: string): Promise<void> {
  const userId = await getUserId();

  const { error } = await supabase
    .from('friends')
    .delete()
    .in('status', ['pending', 'accepted'])
    .or(
      `id.eq.${friendIdOrRelationId},and(user_id.eq.${userId},friend_id.eq.${friendIdOrRelationId}),and(user_id.eq.${friendIdOrRelationId},friend_id.eq.${userId})`,
    );

  if (error) throw error;
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
