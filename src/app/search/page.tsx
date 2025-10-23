import { Book } from '@/types/book';
import Link from 'next/link';
import SearchInput from '@/components/SearchInput';

async function searchBooks(q: string): Promise<Book[]> {
  if (!q) return [];
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${BASE_URL}/api/search?q=${q}`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function Page({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  const q = searchParams.q ?? '';

  const books = await searchBooks(q);

  return (
    <div className="">
      <SearchInput initialQuery={q} />

      <div className="flex justify-center text-xs text-gray-500">
        책 이름이 기억나지 않아도 괜찮아요! 관련된 키워드를 입력해보세요.
      </div>

      <div className="py-10">
        <div className="py-10">
          <span>' {q} '</span> 에 대한 {books?.length ?? 0}개의 검색 결과
        </div>

        {books?.map((book) => (
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
        ))}
      </div>
    </div>
  );
}
