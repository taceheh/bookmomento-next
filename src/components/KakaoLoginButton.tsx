'use client';

import { supabase } from '@/lib/supabase';
import Image from 'next/image';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export default function KakaoLoginButton() {
  async function signInWithKakao() {
    const next = encodeURIComponent('/mypage');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${BASE_URL}/auth/callback?next=${next}`,
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
