// app/signin/page.tsx
'use client';
import { useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export default function Page() {
  const next = useMemo(() => {
    if (typeof window === 'undefined') return '/mypage';
    return new URLSearchParams(window.location.search).get('next') ?? '/mypage';
  }, []);

  async function signInWithKakao() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}${next}`, // 로그인 완료 후 이동할 경로
      },
    });
    if (error) {
      // TODO: 에러 토스트 등
      console.error(error.message);
    }
  }

  return (
    <div>
      <button onClick={signInWithKakao}>로그인</button>
    </div>
  );
}
