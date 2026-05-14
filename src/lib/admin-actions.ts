import { supabase, createIsolatedClient } from './supabase';
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
 * Creates a Supabase Auth user via an isolated client so the admin's session
 * stays put. The handle_new_user() Postgres trigger creates the matching
 * profile row automatically; we then patch role + course_ids + name as admin.
 */
export async function createUser({
  email,
  password,
  displayName,
  courseIds,
  role = 'student',
  createdByUid,
}: CreateUserArgs) {
  const isolated = createIsolatedClient();

  const { data, error } = await isolated.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { full_name: displayName },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('signup-no-user');

  const newUid = data.user.id;

  // Sign out the isolated session immediately so no stray token hangs around.
  await isolated.auth.signOut();

  // The trigger created a default profile row. Update the admin-controlled
  // fields using the main (admin) client so RLS lets it through.
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      role,
      course_ids: courseIds,
      created_by: createdByUid,
    })
    .eq('id', newUid);

  if (updateError) {
    // Best-effort rollback: ask Supabase to delete the orphan auth user.
    // This requires admin privileges we don't have client-side, so the orphan
    // remains in auth.users. The admin can clean it up via dashboard.
    throw updateError;
  }

  return newUid;
}

export async function updateUserCourses(uid: string, courseIds: string[]) {
  const { error } = await supabase
    .from('profiles')
    .update({ course_ids: courseIds })
    .eq('id', uid);
  if (error) throw error;
}

export async function updateUserRole(uid: string, role: Role) {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', uid);
  if (error) throw error;
}

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${window.location.origin}/reset-password` }
  );
  if (error) throw error;
}

export function generatePassword(length = 12): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  const bytes = new Uint32Array(length);
  window.crypto.getRandomValues(bytes);
  const out: string[] = [];
  for (let i = 0; i < length; i++) out.push(charset[bytes[i] % charset.length]);
  return out.join('');
}
