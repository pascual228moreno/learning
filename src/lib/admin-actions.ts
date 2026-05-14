import { initializeApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  setDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { db } from './firebase';
import { Role } from '../types';

interface CreateUserArgs {
  email: string;
  password: string;
  displayName: string;
  courseIds: string[];
  role?: Role;
  createdByUid: string;
}

/**
 * Creates a Firebase Auth user using a secondary Firebase app instance
 * so the current admin session is preserved.
 */
export async function createUser({
  email,
  password,
  displayName,
  courseIds,
  role = 'student',
  createdByUid,
}: CreateUserArgs) {
  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      email.trim().toLowerCase(),
      password
    );
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    try {
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: email.trim().toLowerCase(),
        displayName,
        photoURL: null,
        role,
        courseIds,
        createdAt: serverTimestamp(),
        createdBy: createdByUid,
        lastLoginAt: null,
      });
    } catch (firestoreErr) {
      // Roll back the orphan Auth account so the admin can retry cleanly.
      try { await cred.user.delete(); } catch { /* best effort */ }
      throw firestoreErr;
    }
    await signOut(secondaryAuth);
    return cred.user.uid;
  } finally {
    await deleteApp(secondaryApp);
  }
}

export async function updateUserCourses(uid: string, courseIds: string[]) {
  await updateDoc(doc(db, 'users', uid), { courseIds });
}

export async function updateUserRole(uid: string, role: Role) {
  await updateDoc(doc(db, 'users', uid), { role });
}

export function generatePassword(length = 12): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  const cryptoObj = window.crypto;
  const out: string[] = [];
  const bytes = new Uint32Array(length);
  cryptoObj.getRandomValues(bytes);
  for (let i = 0; i < length; i++) {
    out.push(charset[bytes[i] % charset.length]);
  }
  return out.join('');
}
