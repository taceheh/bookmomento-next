// app/mypage/page.tsx
// 절대 'use client' 금지 (서버 컴포넌트여야 함)
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabaseServer';

// 쿠키 읽는 페이지가 정적으로 캐시되지 않도록 (권장)
export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await supabaseServer(); // ← await 중요
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  console.log(session);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // 로그인 안된 경우 로그인 페이지로
    redirect('/signin?next=%2Fmypage');
  }
  console.log(user);

  return <div>마이페이지 내용이 여기에 들어갑니다.</div>;
}
