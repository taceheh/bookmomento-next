'use client';

import { supabase } from '@/lib/supabase';

export default function KakaoLoginButton() {
  async function signInWithKakao() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('카카오 로그인 오류:', error);
    }
  }

  return (
    <button type="button" onClick={signInWithKakao}>
      카카오로 로그인
    </button>
  );
}
