import BookDetailClient from '@/components/BookDetailClient';
import { Book } from '@/types/book';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function getBookDetail(id: string): Promise<Book | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/book/bookdetail?isbn=${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

async function getInitialComments(id: string) {
  try {
    const res = await fetch(
      `${BASE_URL}/api/book/${id}/comments?parent_id=null`,
    );
    if (!res.ok) return { items: [], totalCount: 0 };
    const data = await res.json();
    return { items: data.items, totalCount: data.totalCount };
  } catch (error) {
    return { items: [], totalCount: 0 };
  }
}

async function getInitialReactions(id: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/book/${id}/reaction`, {
      cache: 'no-store',
    });
    if (!res.ok) return { likes: 0, dislikes: 0, myReaction: null };
    return res.json();
  } catch (error) {
    return { likes: 0, dislikes: 0, myReaction: null };
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const [book, commentsData, reactionData] = await Promise.all([
    getBookDetail(id),
    getInitialComments(id),
    getInitialReactions(id),
  ]);

  if (!book) {
    return <div>책 정보를 불러오는 데 실패했습니다.</div>;
  }

  return (
    <BookDetailClient
      initialBook={book}
      initialComments={commentsData.items}
      initialCommentCount={commentsData.totalCount}
      initialReactionData={reactionData}
      bookId={id}
    />
  );
}
