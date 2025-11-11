import CommentListClient from './CommentListClient';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
async function getInitialComments(id: string) {
  try {
    const res = await fetch(
      `${BASE_URL}/api/book/${id}/comments?parent_id=null`,
      { cache: 'no-store' },
    );
    if (!res.ok) return { items: [], totalCount: 0 };
    const data = await res.json();
    return { items: data.items, totalCount: data.totalCount };
  } catch (error) {
    return { items: [], totalCount: 0 };
  }
}

export default async function CommentListLoader({
  bookId,
}: {
  bookId: string;
}) {
  const commentsData = await getInitialComments(bookId);

  return (
    <CommentListClient
      bookId={bookId}
      initialComments={commentsData.items}
      initialCommentCount={commentsData.totalCount}
    />
  );
}
