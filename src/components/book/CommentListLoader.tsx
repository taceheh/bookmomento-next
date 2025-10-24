// 'use client'가 없는 서버 컴포넌트입니다.

import CommentListClient from './CommentListClient';

// ⭐️ API 페칭 로직 (src/lib/fetchers/book.ts 같은 곳으로 분리 권장)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
async function getInitialComments(id: string) {
  try {
    const res = await fetch(
      `${BASE_URL}/api/book/${id}/comments?parent_id=null`,
      { cache: 'no-store' }, // ⭐️ 댓글은 항상 최신이어야 하므로 no-store
    );
    if (!res.ok) return { items: [], totalCount: 0 };
    const data = await res.json();
    return { items: data.items, totalCount: data.totalCount };
  } catch (error) {
    return { items: [], totalCount: 0 };
  }
}

// 이 컴포넌트가 '느린' 데이터를 책임지고 'await'합니다.
export default async function CommentListLoader({
  bookId,
}: {
  bookId: string;
}) {
  const commentsData = await getInitialComments(bookId);

  // 데이터를 클라이언트 컴포넌트에 주입하여 렌더링합니다.
  return (
    <CommentListClient
      bookId={bookId}
      initialComments={commentsData.items}
      initialCommentCount={commentsData.totalCount}
    />
  );
}
