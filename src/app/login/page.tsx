'use client';
import { supabase } from '@/lib/supabase';

export default function Page() {
  async function signInWithKakao() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
    });
  }
  return (
    <div>
      <button onClick={signInWithKakao}>로그인</button>
    </div>
  );
}
