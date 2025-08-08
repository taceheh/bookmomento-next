// import { supabase } from '@/lib/supabase';
// import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const code = searchParams.get('code');
//   const next = searchParams.get('next') ?? '/';

//   if (!code) {
//     return NextResponse.redirect(`/auth/auth-code-error`);
//   }

//   const { data, error } = await supabase.auth.exchangeCodeForSession(code);

//   if (error || !data.session?.user) {
//     console.error('Supabase 인증 오류:', error);
//     return NextResponse.redirect(`/auth/auth-code-error`);
//   }

//   const user = data.session.user;

//   try {
//     await prisma.users.upsert({
//       where: { id: user.id },
//       update: {
//         email: user.email,
//         nickname: user.user_metadata?.name ?? '',
//         provider: user.app_metadata?.provider,
//       },
//       create: {
//         id: user.id,
//         email: user.email,
//         nickname: user.user_metadata?.name ?? '',
//         provider: user.app_metadata?.provider,
//       },
//     });
//     console.log('Prisma upsert 완료');
//   } catch (e) {
//     console.error('Prisma upsert 실패:', e);
//   }

//   return NextResponse.redirect(next);
// }
