// lib/auth/server.ts (서버 전용)
import { supabaseServer } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';

export async function getUserServer() {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  return user ?? null;
}

export async function requireUserServer(nextPath: string) {
  const user = await getUserServer();
  if (!user) redirect(`/signin?next=${encodeURIComponent(nextPath)}`);
  return user;
}
