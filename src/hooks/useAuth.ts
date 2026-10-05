import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const redirectTo = `${window.location.origin}/account`;
  return {
    user,
    ready,
    enabled: !!supabase,
    sendCode: (email: string) => supabase!.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo, shouldCreateUser: true } }),
    verifyCode: (email: string, token: string) => supabase!.auth.verifyOtp({ email, token, type: 'email' }),
    google: () => supabase!.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } }),
    signOut: () => supabase!.auth.signOut()
  };
}
