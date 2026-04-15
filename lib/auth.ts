import { supabase } from './supabase';

type SignUpOptions = {
  displayName?: string;
  username?: string;
  description?: string;
};

export async function signUp(email: string, password: string, options: SignUpOptions = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: options },
  });
  if (error || !data.user) return { data, error };

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      username: options.username ?? email.split('@')[0],
      display_name: options.displayName ?? null,
      description: options.description ?? null,
    })
    .eq('id', data.user.id);

  return { data, error: profileError ?? null };
}

// Sign in by looking up the email via a SECURITY DEFINER RPC (bypasses RLS so
// the anon role can resolve a username before the user is authenticated).
export async function signInWithUsername(username: string, password: string) {
  const normalized = username.trim().replace(/^@+/, '');

  const { data: email, error: lookupError } = await supabase
    .rpc('get_email_by_username', { p_username: normalized });

  if (lookupError) return { data: null, error: lookupError };
  if (!email) {
    return {
      data: null,
      error: new Error(`No account found for @${normalized}. Check your username or sign up.`),
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email as string,
    password,
  });
  return { data, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}
