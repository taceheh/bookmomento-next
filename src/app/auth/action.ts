// app/auth/actions.ts (새 파일 또는 기존 파일)

'use server';

import { supabaseServer } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';

export async function signOutAction() {
  const sb = await supabaseServer();
  const { error } = await sb.auth.signOut();

  if (error) {
    console.error('Sign out error:', error.message);
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
