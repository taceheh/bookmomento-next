'use client';

import { Book } from '@/types/book';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';

import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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

const updateReaction = async ({
  bookId,
  reaction,
}: {
  bookId: string;
  reaction: 'like' | 'dislike';
}) => {
  const res = await fetch(`/api/book/${encodeURIComponent(bookId)}/reaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reaction }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update reaction');
  }
  return;
};

interface BookDetailClientProps {
  bookId: string;
  initialBook: Book;
  initialReactionData: ReactionData;
}

interface MutationContext {
  previousReactionData?: ReactionData;
}

export default function BookDetailClient({
  bookId,
  initialBook,
  initialReactionData,
}: BookDetailClientProps) {
  const [book, setBook] = useState<Book | null>(initialBook);
  const queryClient = useQueryClient();

  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();

  const {
    data: reactionData,
    isLoading: isReactionLoading,
    error: reactionError,
  } = useQuery<ReactionData, Error>({
    queryKey: ['reactions', bookId],
    queryFn: () => fetchReactionData(bookId),
    initialData: initialReactionData,
    enabled: !!bookId,
  });

  const { mutate: toggleReaction, isPending: isToggling } = useMutation<
    void,
    Error,
    'like' | 'dislike',
    MutationContext
  >({
    mutationFn: (reaction) => updateReaction({ bookId, reaction }),
    onMutate: async (newReaction) => {
      await queryClient.cancelQueries({ queryKey: ['reactions', bookId] });
      const previousReactionData = queryClient.getQueryData<ReactionData>([
        'reactions',
        bookId,
      ]);

      queryClient.setQueryData<ReactionData>(
        ['reactions', bookId],
        (oldData) => {
          if (!oldData) return undefined;

          let nextLikes = oldData.likes;
          let nextDislikes = oldData.dislikes;
          let nextMyReaction: ReactionData['myReaction'] = oldData.myReaction;

          if (oldData.myReaction === newReaction) {
            nextMyReaction = null;
            if (newReaction === 'like')
              nextLikes = Math.max(0, oldData.likes - 1);
            else nextDislikes = Math.max(0, oldData.dislikes - 1);
          } else if (oldData.myReaction === null) {
            nextMyReaction = newReaction;
            if (newReaction === 'like') nextLikes = oldData.likes + 1;
            else nextDislikes = oldData.dislikes + 1;
          } else {
            nextMyReaction = newReaction;
            if (newReaction === 'like') {
              nextLikes = oldData.likes + 1;
              nextDislikes = Math.max(0, oldData.dislikes - 1);
            } else {
              nextLikes = Math.max(0, oldData.likes - 1);
              nextDislikes = oldData.dislikes + 1;
            }
          }
          return {
            likes: nextLikes,
            dislikes: nextDislikes,
            myReaction: nextMyReaction,
          };
        },
      );

      return { previousReactionData };
    },
    onError: (err, newReaction, context) => {
      console.error('Error toggling reaction (mutation):', err);
      toast.error(err.message || '요청에 실패했습니다.');
      if (context?.previousReactionData) {
        queryClient.setQueryData(
          ['reactions', bookId],
          context.previousReactionData,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', bookId] });
    },
  });

  const handleReactionClick = (reactionType: 'like' | 'dislike') => {
    if (authLoading) return;

    if (!user) {
      toast.error('로그인이 필요한 기능입니다.', {
        action: {
          label: '로그인',
          onClick: () => router.push('/login'),
        },
      });
      return;
    }

    toggleReaction(reactionType);
  };

  return (
    <div>
      <div className="flex h-20 items-center text-sm">
        <div className="ml-2 mr-8">책정보</div>
        <div>AI 토론</div>
      </div>

      <div className="relative w-full h-96 overflow-hidden">
        <Image
          src={book?.cover ?? ''}
          alt="cover"
          fill
          className=" object-cover blur-md scale-110"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10" />
        <div className="relative z-20 flex justify-center items-center h-full">
          <Image
            src={book?.cover ?? ''}
            alt="cover"
            width={100}
            height={140}
            className="h-96 w-68 shadow-xl"
            unoptimized
          />
        </div>
      </div>

      <div className="pt-10 px-6">
        <div className="text-lg font-bold">{book?.title}</div>
        <div className="text-sm pt-4">{book?.author}</div>
        <div className="text-sm pt-2">{book?.publisher}</div>
      </div>

      <div className="px-6 text-sm pt-4 flex pb-10 border-b border-[#DBDBDB]">
        {(isReactionLoading || authLoading) && (
          <div className="text-gray-500 text-xs">정보 로딩 중...</div>
        )}
        {reactionError && !isReactionLoading && (
          <div className="text-red-500 text-xs">
            오류: {reactionError.message}
          </div>
        )}

        {reactionData &&
          !isReactionLoading &&
          !reactionError &&
          !authLoading && (
            <>
              <button
                onClick={() => handleReactionClick('like')}
                disabled={isToggling || authLoading}
                className="inline-flex items-center px-5 py-1 bg-gray-100 rounded-full text-sm mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                onClick={() => handleReactionClick('dislike')}
                disabled={isToggling || authLoading}
                className="inline-flex items-center px-5 py-1 bg-gray-100 rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
