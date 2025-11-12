'use client';

import { supabase } from '@/lib/supabase';
import Image from 'next/image';
export default function KakaoLoginButton() {
  async function signInWithKakao() {
    const redirectTo = `${window.location.origin}/auth/callback`;
    const next = encodeURIComponent('/mypage');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: redirectTo,
        // redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    });

    if (error) {
      console.error('카카오 로그인 오류:', error);
    }
  }

  return (
    <Image
      src="/image/kakao-login-btn.png"
      onClick={signInWithKakao}
      alt="카카오 로그인 이미지"
      width={400}
      height={10}
      unoptimized
      className="cursor-pointer"
    />
  );
}
