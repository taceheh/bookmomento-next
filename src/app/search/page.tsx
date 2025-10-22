'use client';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Book } from '@/types/book';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';

export default function Page() {
  const [books, setBooks] = useState<Book[] | null>(null);
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(q); // ✅ 로컬 상태로 제어

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  useEffect(() => {
    fetch(`/api/search?q=${q}`)
      .then((res) => res.json())
      .then(setBooks);
  }, [q]);
  console.log(books);
  return (
    <div className="">
      <div className=" flex border border-gray-300 bg-white px-2 py-2 w-[80%] m-auto mt-10 mb-2">
        <Input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="검색어 입력"
          fullWidth
          className="bg-transparent text-sm"
        />

        <Link href={`/search?q=${query}`}>
          <Search className="w-4 ml-2 cursor-pointer" />
        </Link>
      </div>
      <div className="flex justify-center text-xs text-gray-500">
        책 이름이 기억나지 않아도 괜찮아요! 관련된 키워드를 입력해보세요.
      </div>

      <div className="py-10">
        <div className="py-10">
          <span>' {q} '</span> 에 대한 4,105개의 검색 결과
        </div>

        {books?.map((book) => {
          return (
            <Link key={book.isbn} href={`/book/${book.isbn}`}>
              <div className="flex h-40 text-sm bottom-0.5 border-b-[0.4mm] border-[#DBDBDB] mb-6">
                <img className="h-35 w-30 mr-6" src={book.cover} />
                <div>
                  <div className="font-semibold mb-4">{book.title}</div>
                  <div className=" mb-2">{book.author}</div>
                  <div className=" mb-4">
                    {book.publisher} | {book.pubDate}
                  </div>
                  <div className="line-clamp-2">{book.description}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
