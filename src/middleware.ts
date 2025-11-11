import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

async function createSupabaseClient(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );
  return { supabase, response };
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const { supabase, response } = await createSupabaseClient(req);

  if (pathname.startsWith('/auth/callback')) return response;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && pathname.startsWith('/mypage')) {
    const loginUrl = new URL('/signin', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/mypage/:path*', // /mypage 및 하위 모든 경로 감시
    '/auth/callback',
  ],
};
