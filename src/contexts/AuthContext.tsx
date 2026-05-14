import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  setDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

export const SUPERADMIN_EMAIL = '1.del.198333@gmail.com';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  /** True while we are confirming if the signed-in user has access. */
  resolvingAccess: boolean;
  /** True when signed in but no users/{uid} doc exists (and not the bootstrap superadmin). */
  noAccess: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvingAccess, setResolvingAccess] = useState(false);
  const [noAccess, setNoAccess] = useState(false);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let loginStampedForUid: string | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (unsubProfile) { unsubProfile(); unsubProfile = null; }

      setUser(u);
      if (!u) {
        setProfile(null);
        setNoAccess(false);
        setLoading(false);
        loginStampedForUid = null;
        return;
      }

      setLoading(false);
      setResolvingAccess(true);

      const userRef = doc(db, 'users', u.uid);

      // Bootstrap: hardcoded superadmin gets a users doc with role='superadmin'.
      // Also upgrades pre-existing docs that were created before the role field.
      if (u.email === SUPERADMIN_EMAIL) {
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : null;
        if (!data || !data.role) {
          await setDoc(userRef, {
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            photoURL: u.photoURL,
            role: 'superadmin',
            courseIds: data?.courseIds || [],
            createdAt: data?.createdAt || serverTimestamp(),
            createdBy: null,
            lastLoginAt: serverTimestamp(),
          }, { merge: true });
        }
      }

      // Stamp lastLoginAt + sync profile picture once per session — NOT on every
      // snapshot, otherwise we trigger a write→snapshot→write loop.
      if (loginStampedForUid !== u.uid) {
        loginStampedForUid = u.uid;
        setDoc(userRef, {
          displayName: u.displayName,
          photoURL: u.photoURL,
          lastLoginAt: serverTimestamp(),
        }, { merge: true }).catch(() => { /* non-critical */ });
      }

      // Subscribe to the user profile (read-only).
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          setNoAccess(true);
          setResolvingAccess(false);
        }
      }, 3000);

      unsubProfile = onSnapshot(userRef, (snap) => {
        resolved = true;
        clearTimeout(timer);
        if (!snap.exists()) {
          setProfile(null);
          setNoAccess(true);
        } else {
          setProfile(snap.data() as UserProfile);
          setNoAccess(false);
        }
        setResolvingAccess(false);
      }, () => {
        resolved = true;
        clearTimeout(timer);
        setProfile(null);
        setNoAccess(true);
        setResolvingAccess(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const isLoggingIn = useRef(false);

  const loginWithGoogle = async () => {
    if (isLoggingIn.current) return;
    isLoggingIn.current = true;
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code !== 'auth/cancelled-popup-request' &&
          error.code !== 'auth/popup-closed-by-user' &&
          error.code !== 'auth/internal-error') {
        console.error("Google login error:", error);
        throw error;
      }
    } finally {
      isLoggingIn.current = false;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, resolvingAccess, noAccess,
      loginWithGoogle, loginWithEmail, resetPassword, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
