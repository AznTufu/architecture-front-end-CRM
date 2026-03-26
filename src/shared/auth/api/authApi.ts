import type { Session } from '@supabase/supabase-js';
import { supabaseClient } from '../../api';

interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
}

interface SignInPayload {
  email: string;
  password: string;
}

export async function fetchSession(): Promise<Session | null> {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export async function signInWithPassword(payload: SignInPayload): Promise<void> {
  const { error } = await supabaseClient.auth.signInWithPassword(payload);

  if (error) {
    throw new Error(error.message);
  }
}

export async function signUpWithPassword(payload: SignUpPayload): Promise<void> {
  const { error } = await supabaseClient.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        full_name: payload.fullName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}
