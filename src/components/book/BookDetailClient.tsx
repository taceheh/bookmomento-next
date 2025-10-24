'use client';

import { Book } from '@/types/book';
import axios from 'axios';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

interface BookDetailClientProps {
  bookId: string;
  initialBook: Book;
  initialReactionData: {
    likes: number;
    dislikes: number;
    myReaction: 'like' | 'dislike' | null;
  };
}

export default function BookDetailClient({
  bookId,
  initialBook,
  initialReactionData,
}: BookDetailClientProps) {
  const id = bookId;
  const [book, setBook] = useState<Book | null>(initialBook);

  type Reaction = 'like' | 'dislike';

  const [likes, setLikes] = useState(initialReactionData.likes);
  const [dislikes, setDislikes] = useState(initialReactionData.dislikes);
  const [myReaction, setMyReaction] = useState(initialReactionData.myReaction);
  const [reacting, setReacting] = useState(false);

  async function toggle(reaction: Reaction) {
    if (!id || reacting) return;
    setReacting(true);

    const prev = myReaction;
    if (prev === reaction) {
      if (reaction === 'like') setLikes((v) => Math.max(0, v - 1));
      else setDislikes((v) => Math.max(0, v - 1));
      setMyReaction(null);
    } else if (prev == null) {
      if (reaction === 'like') setLikes((v) => v + 1);
      else setDislikes((v) => v + 1);
      setMyReaction(reaction);
    } else {
      if (prev === 'like') {
        setLikes((v) => Math.max(0, v - 1));
        setDislikes((v) => v + 1);
      } else {
        setDislikes((v) => Math.max(0, v - 1));
        setLikes((v) => v + 1);
      }
      setMyReaction(reaction);
    }

    const res = await fetch(`/api/book/${encodeURIComponent(id)}/reaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reaction }),
    });

    if (!res.ok) {
      const agg = await fetch(`/api/book/${encodeURIComponent(id)}/reaction`, {
        cache: 'no-store',
      });
      if (agg.ok) {
        const j = await agg.json();
        setLikes(j.likes ?? 0);
        setDislikes(j.dislikes ?? 0);
        setMyReaction(j.myReaction ?? null);
      }
    }
    setReacting(false);
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
        <button
          onClick={() => toggle('like')}
          disabled={reacting}
          className="inline-flex items-center px-5 py-1 bg-gray-100 rounded-full text-sm mr-2"
        >
          <ThumbsUp
            className={
              myReaction === 'like'
                ? 'w-4 text-black-600 [&_*]:fill-current'
                : 'w-4 text-gray-600 opacity-60'
            }
          />
          &nbsp; |<span className="ml-2">{likes}</span>
        </button>

        <button
          onClick={() => toggle('dislike')}
          disabled={reacting}
          className="inline-flex items-center px-5 py-1 bg-gray-100 rounded-full text-sm"
        >
          <ThumbsDown
            className={
              myReaction === 'dislike'
                ? 'w-4 text-black-600 [&_*]:fill-current'
                : 'w-4 text-gray-600 opacity-60'
            }
          />
          &nbsp; |<span className="ml-2">{dislikes}</span>
        </button>
      </div>

      <div className="px-6 py-10 text-sm">{book?.description}</div>
    </div>
  );
}
