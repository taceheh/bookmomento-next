import BookDetailClient from '@/components/book/BookDetailClient';
import CommentListLoader from '@/components/book/CommentListLoader';
import CommentSkeleton from '@/components/book/CommentSkeleton';
import { Book } from '@/types/book';
import { Suspense } from 'react';

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

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [book, reactionData] = await Promise.all([
    getBookDetail(id),
    getInitialReactions(id),
  ]);

  if (!book) {
    return <div>책 정보를 불러오는 데 실패했습니다.</div>;
  }

  return (
    <>
      <BookDetailClient
        bookId={id}
        initialBook={book}
        initialReactionData={reactionData}
      />

      <div className="border-t border-[#DBDBDB] py-10 px-6">
        <Suspense fallback={<CommentSkeleton />}>
          <CommentListLoader bookId={id} />
        </Suspense>
      </div>
    </>
  );
}
