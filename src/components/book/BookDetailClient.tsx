'use client';

import { Book } from '@/types/book';
import axios from 'axios';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query'; // useQueryClient 추가

interface ReactionData {
  likes: number;
  dislikes: number;
  myReaction: 'like' | 'dislike' | null;
}

const fetchReactionData = async (bookId: string): Promise<ReactionData> => {
  const res = await fetch(`/api/book/${encodeURIComponent(bookId)}/reaction`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch reaction data');
  }
  return res.json();
};

interface BookDetailClientProps {
  bookId: string;
  initialBook: Book;
}

export default function BookDetailClient({
  bookId,
  initialBook,
}: BookDetailClientProps) {
  const id = bookId;
  const [book, setBook] = useState<Book | null>(initialBook);
  const [reacting, setReacting] = useState(false);
  const queryClient = useQueryClient(); // QueryClient 인스턴스 가져오기

  const {
    data: reactionData,
    isLoading: isReactionLoading,
    error: reactionError,
  } = useQuery<ReactionData, Error>({
    queryKey: ['reactions', bookId],
    queryFn: () => fetchReactionData(bookId),
    enabled: !!bookId,
  });

  async function toggle(reaction: 'like' | 'dislike') {
    if (!id || reacting || !reactionData) return;
    setReacting(true);

    try {
      const res = await fetch(`/api/book/${encodeURIComponent(id)}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction }),
      });

      if (!res.ok) {
        throw new Error('Failed to update reaction');
      }
      // 성공 시 캐시 무효화 -> 자동 refetch
      queryClient.invalidateQueries({ queryKey: ['reactions', bookId] });
    } catch (error) {
      console.error('Error toggling reaction:', error);
      queryClient.invalidateQueries({ queryKey: ['reactions', bookId] });
    } finally {
      setReacting(false);
    }
  }

  return (
    <div>
      <div className="flex h-20 items-center text-sm">
        <div className="ml-2 mr-8">책정보</div>
        <div>AI 토론</div>
      </div>

      <div className="relative w-full h-96 overflow-hidden">
        <img
          src={book?.cover}
          alt="cover"
          className="absolute inset-0 w-full h-full object-cover blur-md scale-110"
        />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10" />
        <div className="relative z-20 flex justify-center items-center h-full">
          <img
            src={book?.cover}
            alt="cover"
            className="h-96 shadow-xl rounded-md"
          />
        </div>
      </div>

      <div className="pt-10 px-6">
        <div className="text-lg font-bold">{book?.title}</div>
        <div className="text-sm pt-4">{book?.author}</div>
        <div className="text-sm pt-2">{book?.publisher}</div>
      </div>

      <div className="px-6 text-sm pt-4 flex pb-10 border-b border-[#DBDBDB]">
        {isReactionLoading && (
          <div className="text-gray-500 text-xs">좋아요 정보 로딩 중...</div>
        )}
        {reactionError && (
          <div className="text-red-500 text-xs">
            오류: {reactionError.message}
          </div>
        )}

        {reactionData && !isReactionLoading && !reactionError && (
          <>
            <button
              onClick={() => toggle('like')}
              disabled={reacting}
              className="inline-flex items-center px-5 py-1 bg-gray-100 rounded-full text-sm mr-2 disabled:opacity-50"
            >
              <ThumbsUp
                className={
                  reactionData.myReaction === 'like'
                    ? 'w-4 text-blue-600 [&_*]:fill-current'
                    : 'w-4 text-gray-600 opacity-60'
                }
              />
              &nbsp; |<span className="ml-2">{reactionData.likes}</span>
            </button>

            <button
              onClick={() => toggle('dislike')}
              disabled={reacting}
              className="inline-flex items-center px-5 py-1 bg-gray-100 rounded-full text-sm disabled:opacity-50"
            >
              <ThumbsDown
                className={
                  reactionData.myReaction === 'dislike'
                    ? 'w-4 text-red-600 [&_*]:fill-current'
                    : 'w-4 text-gray-600 opacity-60'
                }
              />
              &nbsp; |<span className="ml-2">{reactionData.dislikes}</span>
            </button>
          </>
        )}
      </div>

      <div className="px-6 py-10 text-sm">{book?.description}</div>
    </div>
  );
}
