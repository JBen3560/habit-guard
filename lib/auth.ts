import { supabase } from './supabase';

type SignUpOptions = {
  username?: string;
};

export async function signUp(email: string, password: string, options: SignUpOptions = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: options,
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}
