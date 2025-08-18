// // utils/supabase/middleware.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { createServerClient } from '@supabase/ssr';

// export async function updateSession(request: NextRequest) {
//   const response = NextResponse.next({ request: { headers: request.headers } });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies
//             .getAll()
//             .map((c) => ({ name: c.name, value: c.value }));
//         },
//         setAll(cookiesToSet) {
//           for (const { name, value, options } of cookiesToSet) {
//             response.cookies.set({ name, value, ...options });
//           }
//         },
//       },
//     },
//   );

//   // 만료되었으면 여기서 새 토큰으로 갱신되며, 위 setAll을 통해 쿠키로 전달됨
//   await supabase.auth.getUser();

//   return response;
// }
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // route protect 로직

  return supabaseResponse;
}
