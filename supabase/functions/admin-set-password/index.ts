// Edge Function: admin-set-password
// Lets a superadmin set any user's password directly without sending emails.
// Verifies the caller's role server-side before using service_role.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let payload: { userId?: string; newPassword?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { userId, newPassword } = payload;
  if (!userId || !newPassword) {
    return json({ error: 'userId and newPassword are required' }, 400);
  }
  if (newPassword.length < 6) {
    return json({ error: 'Password must be at least 6 characters' }, 400);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401);

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // 1) Identify the caller using their JWT.
  const caller = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await caller.auth.getUser();
  if (userErr || !userData?.user) {
    return json({ error: 'Invalid auth' }, 401);
  }

  // 2) Verify caller is a superadmin per the profiles table.
  const { data: profile, error: profileErr } = await caller
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileErr || !profile || profile.role !== 'superadmin') {
    return json({ error: 'Forbidden: caller is not superadmin' }, 403);
  }

  // 3) Apply the password change using service_role.
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: updateErr } = await admin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (updateErr) return json({ error: updateErr.message }, 400);

  return json({ ok: true });
});
