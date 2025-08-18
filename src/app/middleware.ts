// // middleware.ts  (프로젝트 루트)
// import { updateSession } from '@/utils/supabase/middleware';
// import type { NextRequest } from 'next/server';

// export async function middleware(req: NextRequest) {
//   return updateSession(req);
// }

// export const config = {
//   matcher: [
//     // 정적 리소스는 제외
//     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
//   ],
// };
import { type NextRequest } from 'next/server';
import { updateSession } from './utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [],
};
