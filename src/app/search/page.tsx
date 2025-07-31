'use client';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Book } from '@/types/book';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const [books, setBooks] = useState<Book[] | null>(null);
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  useEffect(() => {
    fetch(`/api/search?q=${q}`)
      .then((res) => res.json())
      .then(setBooks);
  }, []);
  console.log(books);
  return (
    <div className="">
      <div className=" flex border border-gray-300 bg-white px-2 py-2 w-[80%] m-auto mt-10 mb-2">
        <input
          type="text"
          placeholder="검색어 입력"
          className="bg-transparent outline-none w-full text-sm text-black"
        />
        <Search className="w-4 ml-2 cursor-pointer" />
      </div>
      <div className="flex justify-center text-xs text-gray-500">
        책 이름이 기억나지 않아도 괜찮아요! 관련된 키워드를 입력해보세요.
      </div>

      <div>
        <div>
          <span>' 해리포터 '</span> 에 대한 4,105개의 검색 결과
        </div>

        {books?.map((book) => {
          return (
            <div className="flex">
              <img src={book.cover} />
              <div>
                <div>{book.title}</div>
                <div>{book.author}</div>
                <div>
                  {book.publisher} | {book.pubDate}
                </div>
                <div className="line-clamp-2">{book.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
