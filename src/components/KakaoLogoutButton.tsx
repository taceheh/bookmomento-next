'use client';

import { signOutAction } from '@/app/auth/action';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export function KakaoLogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      const result = await signOutAction();

      if (result.success) {
        router.push('/signin');
        router.refresh();
      } else {
        console.error(result.error);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="bg-black text-white text-sm flex justify-center w-[90%] m-auto mt-2 p-3"
    >
      {isPending ? '로그아웃 중...' : '로그아웃'}
    </button>
  );
}
