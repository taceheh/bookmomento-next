// app/book/[id]/CommentBox.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CommentBox({
  userId,
  next,
  bookIsbn,
}: {
  userId: string | null;
  next: string; // 로그인 후 돌아올 경로
  bookIsbn: string; // 댓글 작성 시 보낼 식별자 (isbn)
}) {
  const router = useRouter();
  const [body, setBody] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      // 미로그인 → 로그인 페이지로 이동 (로그인 후 next로 복귀)
      router.push(`/signin?next=${encodeURIComponent(next)}`);
      return;
    }

    // 댓글 작성 API 호출 (책 기준 라우트로 변경)
    const res = await fetch(
      `/api/book/${encodeURIComponent(bookIsbn)}/comments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body,
          parent_id: null, // 최상위 댓글
        }),
      },
    );

    if (!res.ok) {
      console.error('댓글 작성 실패');
      return;
    }

    setBody('');
    // 목록을 새로고침하여 댓글 반영
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <textarea
        className="w-full h-20 border border-[#DBDBDB] p-2 text-sm"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="리뷰를 입력하세요"
      />
      <button
        type="submit"
        className="block w-full text-sm p-2 text-center border mt-1"
      >
        리뷰 작성
      </button>
    </form>
  );
}
