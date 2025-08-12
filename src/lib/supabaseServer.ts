// lib/supabaseServer.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function supabaseServer() {
  const cookieStore = await cookies(); // Next.js 15: async

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // ✅ 최신 형태: getAll / setAll 만 제공
      cookies: {
        getAll() {
          // Next Cookie[] -> Supabase가 기대하는 [{ name, value, ... }] 배열
          return cookieStore.getAll().map((c) => ({
            name: c.name,
            value: c.value,
            // path, domain, expires, httpOnly, sameSite, secure 등은
            // get 시점에는 일반적으로 필요 없음
          }));
        },
        setAll(cookiesToSet) {
          // Supabase가 한 번에 여러 쿠키를 설정하려고 호출
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set({ name, value, ...options });
          }
        },
      },
      // cookieOptions, cookieEncoding 등은 선택. 보통 기본값으로 충분
    },
  );
}
