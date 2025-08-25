import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ★ 콜백 경로 예외
  if (pathname.startsWith('/auth/callback')) return NextResponse.next();

  // 그 외 보호 라우트는 서버에서 requireUserServer로 보호하는 쪽을 권장
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
};
