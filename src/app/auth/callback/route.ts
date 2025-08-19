// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  // 최종으로 돌려보낼 응답(redirect)을 먼저 준비
  const redirectRes = NextResponse.redirect(new URL(next, url.origin));

  if (!code) {
    return NextResponse.redirect(new URL('/auth/auth-code-error', url.origin));
  }

  // 이 요청의 쿠키를 읽고, 설정은 redirectRes에 기록되도록 연결
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies
            .getAll()
            .map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            redirectRes.cookies.set({ name, value, ...options });
          }
        },
      },
    },
  );

  // ★ 서버에서 세션 교환 → HttpOnly 쿠키로 저장
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL('/auth/auth-code-error', url.origin));
  }

  return redirectRes;
}
