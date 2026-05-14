import React, { useState, useEffect, createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  /** True while we are still loading the profile after auth resolves. */
  resolvingAccess: boolean;
  /** Signed in but no profile row was found (should not happen in normal flow). */
  noAccess: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  resolvingAccess: false,
  noAccess: false,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  resetPassword: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvingAccess, setResolvingAccess] = useState(false);
  const [noAccess, setNoAccess] = useState(false);

  useEffect(() => {
    let profileChannel: ReturnType<typeof supabase.channel> | null = null;
    let loginStampedForUserId: string | null = null;

    const loadProfile = async (u: User) => {
      setResolvingAccess(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .maybeSingle();

      if (error) {
        console.error('Profile load error:', error);
        setProfile(null);
        setNoAccess(true);
      } else if (!data) {
        setProfile(null);
        setNoAccess(true);
      } else {
        setProfile(data as UserProfile);
        setNoAccess(false);
      }
      setResolvingAccess(false);
    };

    const stampLogin = async (u: User) => {
      if (loginStampedForUserId === u.id) return;
      loginStampedForUserId = u.id;
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', u.id);
    };

    const subscribeToProfile = (u: User) => {
      if (profileChannel) supabase.removeChannel(profileChannel);
      profileChannel = supabase
        .channel(`profile:${u.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${u.id}`,
          },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              setProfile(null);
              setNoAccess(true);
            } else if (payload.new) {
              setProfile(payload.new as UserProfile);
              setNoAccess(false);
            }
          }
        )
        .subscribe();
    };

    const handleSession = async (s: Session | null) => {
      setSession(s);
      setUser(s?.user ?? null);

      if (!s?.user) {
        setProfile(null);
        setNoAccess(false);
        setLoading(false);
        loginStampedForUserId = null;
        if (profileChannel) {
          supabase.removeChannel(profileChannel);
          profileChannel = null;
        }
        return;
      }

      setLoading(false);
      await loadProfile(s.user);
      stampLogin(s.user).catch(() => { /* non-critical */ });
      subscribeToProfile(s.user);
    };

    supabase.auth.getSession().then(({ data }) => handleSession(data.session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      handleSession(s);
    });

    return () => {
      subscription.unsubscribe();
      if (profileChannel) supabase.removeChannel(profileChannel);
    };
  }, []);

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/portal` },
    });
    if (error) throw error;
  };

  const loginWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading, resolvingAccess, noAccess,
      loginWithGoogle, loginWithEmail, resetPassword, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
