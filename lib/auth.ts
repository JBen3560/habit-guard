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
    options: {
      data: options,
    },
  });
  if (error || !data.user) return { data, error };

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ username: options.username ?? email.split('@')[0] })
    .eq('id', data.user.id);

  return { data, error: profileError ?? null };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
  return { error };
}
