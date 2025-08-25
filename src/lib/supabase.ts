// lib/supabase.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      flowType: 'pkce', // ★ PKCE 강제
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // ★ 교환은 서버 콜백에서만 처리
    },
  },
);
