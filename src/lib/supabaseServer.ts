// src/lib/supabaseServer.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function supabaseServer() {
  const jar = await cookies(); // Next 15: async

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Next 15 cookies().getAll()는 {name, value, ...} 배열을 반환
          return jar.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet) {
          // Server Action/Route Handler에서는 허용, RSC에서는 예외 → 무시
          try {
            for (const { name, value, options } of cookiesToSet) {
              jar.set({ name, value, ...options });
            }
          } catch {
            // RSC 환경: 쿠키 수정 불가 → 조용히 no-op
          }
        },
      },
    },
  );
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
