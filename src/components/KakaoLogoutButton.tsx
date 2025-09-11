// components/KakaoLogoutButton.tsx
import { supabaseServer } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';

export function KakaoLogoutButton() {
  async function signOut() {
    'use server'; // Server Action으로 만들기

    const sb = await supabaseServer();
    const { error } = await sb.auth.signOut();
    if (!error) {
      redirect('/signin');
    }
  }

  return (
    <form action={signOut}>
      <button
        type="submit"
        className="bg-black text-white text-sm flex justify-center w-[90%] m-auto mt-2 p-3"
      >
        로그아웃
      </button>
    </form>
  );
}
