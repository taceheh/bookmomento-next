'use client';

import { Book } from '@/types/book';
import axios from 'axios';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { use, useEffect, useState } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [book, setBook] = useState<Book | null>(null);
  const [text, setText] = useState('');
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`/api/book/bookdetail?isbn=${id}`);
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error);
        }
        const data = await res.json();
        setBook(data[0]);
      } catch (err: any) {
        console.error('에러:', err.message);
      }
    };

    const fetchComment = async () => {
      if (!id) return;
      const res = await fetch(
        `/api/comments?book_isbn=${encodeURIComponent(id)}&parent_id=null`,
      );
      const data = await res.json();
      setComments(data.items);
    };

    fetchBook();
    fetchComment();
  }, [id]);
  useEffect(() => {
    const fetchComment = async () => {
      if (!id) return;
      const res = await fetch(
        `/api/comments?book_isbn=${encodeURIComponent(id)}&parent_id=null`,
      );
      const data = await res.json();
      setComments(data.items);
    };
    fetchComment();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await axios.post('/api/comments', {
      book_isbn: id, // 상세 페이지 ISBN
      parent_id: null, // 최상위 댓글이면 null
      body: text || '테스트 코멘트',
    });

    console.log('insert ok:', res.data);
    setText('');

    const r = await fetch(
      `/api/comments?book_isbn=${encodeURIComponent(id)}&parent_id=null`,
    );
    const d = await r.json();
    setComments(d.items);
  }

  if (!book) return <div>로딩 중...</div>;
  return (
    <div>
      <div className="flex h-20 items-center text-sm">
        <div className="ml-2 mr-8 ">책정보</div>
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
            className="h-88 shadow-xl rounded-md"
          />
        </div>
      </div>

      <div className=" pt-10">
        <div className="px-6">
          <div className="text-lg font-bold">{book?.title}</div>
          <div className="text-sm pt-4">{book?.author}</div>
          <div className="text-sm pt-2">{book?.publisher}</div>
        </div>
        {/* TODO: 좋아요, 싫어요 버튼 컴포넌트로 분리 */}
        <div className="px-6 text-sm pt-4 flex pb-10 bottom-0.5 border-b-[0.4mm] border-[#DBDBDB]">
          <div className="inline-flex items-center px-5 py-1 bg-gray-100 rounded-full text-sm mr-2">
            <button className="flex items-center space-x-2">
              <ThumbsUp className="w-4" />
            </button>
            <span className="mx-2 h-4 w-px bg-gray-300" />
            <span className="text-black">5</span>
          </div>
          <div className="inline-flex items-center px-5 py-1 bg-gray-100 rounded-full text-sm">
            <button className="flex items-center space-x-2">
              <ThumbsDown color="#313131" className="w-4 " />
            </button>
            <span className="mx-2 h-4 w-px bg-gray-300" />
            <span className="text-black">5</span>
          </div>
        </div>
        <div className="px-6 py-10 text-sm">{book?.description}</div>
      </div>

      <div className="bottom-0.5 border-t-[0.4mm] border-[#DBDBDB] py-10 px-6">
        <div className="pb-10">리뷰 (64)</div>
        <div>
          <form onSubmit={onSubmit}>
            <input
              className="bottom-0.5 border-[0.4mm] border-[#DBDBDB] w-full h-20"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="block w-full text-sm p-2 text-center border-1 mt-1">
              리뷰 작성
            </button>
          </form>
        </div>
        {comments.map((comment) => {
          return (
            <div key={comment.id}>
              {comment.body} {comment.created_at}
            </div>
          );
        })}
      </div>
    </div>
  );
}
