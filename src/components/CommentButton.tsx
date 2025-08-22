'use client';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

export function CommentButton({ next }: { next: string }) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  if (loading) return null; // 또는 스켈레톤

  const onClick = () => {
    if (!user) return router.push(`/signin?next=${encodeURIComponent(next)}`);
    // 작성 폼 열기 로직…
  };

  return <button onClick={onClick}>리뷰 작성</button>;
}
