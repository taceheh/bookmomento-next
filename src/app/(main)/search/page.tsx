'use client';

import SearchInput from '@/components/SearchInput';
import { Book } from '@/types/book';
import {
  InfiniteData,
  QueryFunctionContext,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { Loader2, SearchX } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface SearchApiResponse {
  items: Book[];
  totalResults: number;
  itemsPerPage: number;
  startIndex: number;
}

// API 호출 함수 (react-query용)
const fetchBooks = async (
  context: QueryFunctionContext<readonly (string | null)[], number>,
): Promise<SearchApiResponse> => {
  const { queryKey, pageParam = 1 } = context;
  const [_, query] = queryKey;
  if (!query) {
    return { items: [], totalResults: 0, itemsPerPage: 0, startIndex: 1 };
  }

  const res = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&page=${pageParam}&count=10`,
  );

  if (!res.ok) {
    throw new Error('검색 결과를 불러오는 데 실패했습니다.');
  }
  return res.json();
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery<
    SearchApiResponse,
    Error,
    InfiniteData<SearchApiResponse>,
    readonly (string | null)[],
    number
  >({
    queryKey: ['searchBooks', query],
    queryFn: fetchBooks,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const itemsPerPage = lastPage.itemsPerPage || 10;
      const totalResults = lastPage.totalResults || 0;

      if (totalResults === 0) return undefined;

      const totalPages = Math.max(1, Math.ceil(totalResults / itemsPerPage));
      const currentPage = Math.ceil(lastPage.startIndex / itemsPerPage);

      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
    enabled: !!query,
    staleTime: 1000 * 60 * 5,
  });

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isFetchingNextPage || !hasNextPage || !observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    const currentObserver = observerRef.current;
    if (currentObserver) {
      observer.observe(currentObserver);
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
    };
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  if (!query && !isLoading) {
    return (
      <main className="max-w-screen-md mx-auto px-4">
        <SearchInput initialQuery={query ?? ''} />
        <div className="flex justify-center text-xs text-gray-500">
          책 이름이 기억나지 않아도 괜찮아요! 관련된 키워드를 입력해보세요.
        </div>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
          <SearchX className="w-16 h-16 mb-4" />
          <h2 className="text-xl font-semibold">검색어가 없습니다.</h2>
          <p>상단의 검색창을 이용해 도서를 검색해보세요.</p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="max-w-screen-md mx-auto px-4">
        <SearchInput initialQuery={query ?? ''} />
        <div className="flex justify-center text-xs text-gray-500">
          책 이름이 기억나지 않아도 괜찮아요! 관련된 키워드를 입력해보세요.
        </div>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-screen-md mx-auto px-4">
        <SearchInput initialQuery={query ?? ''} />
        <div className="flex justify-center text-xs text-gray-500">
          책 이름이 기억나지 않아도 괜찮아요! 관련된 키워드를 입력해보세요.
        </div>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-red-500">
          <SearchX className="w-16 h-16 mb-4" />
          <h2 className="text-xl font-semibold">오류 발생</h2>
          <p>{error.message}</p>
        </div>
      </main>
    );
  }

  const allBooks = data?.pages.flatMap((page) => page.items) || [];

  return (
    <main className="max-w-screen-md mx-auto px-4">
      <SearchInput initialQuery={query ?? ''} />
      <div className="flex justify-center text-xs text-gray-500">
        책 이름이 기억나지 않아도 괜찮아요! 관련된 키워드를 입력해보세요.
      </div>

      <div className="py-10">
        <div className="py-10">
          <span>&apos; {query} &apos;</span> 에 대한{' '}
          {data?.pages?.[0]?.totalResults || 0}
          개의 검색 결과
        </div>

        {allBooks.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500">
            <SearchX className="w-16 h-16 mb-4" />
            <h2 className="text-xl font-semibold">검색 결과가 없습니다.</h2>
            <p>다른 검색어로 시도해보세요.</p>
          </div>
        )}

        <ul className="">
          {allBooks.map((book, index) => (
            <Link
              key={book.isbn || index}
              href={`/book/${book.isbn}`}
              className="flex h-40 text-sm bottom-0.5 border-b-[0.4mm] border-[#DBDBDB] mb-6"
            >
              <Image
                src={book.cover}
                alt={book.title}
                width={100}
                height={140}
                className="h-35 w-30 mr-6 "
                unoptimized
              />
              <div>
                <div className="font-semibold mb-4">{book.title}</div>
                <div className="mb-2">{book.author}</div>
                <div className="mb-4">
                  {book.publisher} | {book.pubDate}
                </div>
                <div className="line-clamp-2">{book.description}</div>
              </div>
            </Link>
          ))}
        </ul>

        <div
          ref={observerRef}
          className="h-10 flex items-center justify-center"
        >
          {isFetchingNextPage && (
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          )}
          {!hasNextPage && allBooks.length > 0 && (
            <span className="text-sm text-gray-400">
              마지막 검색 결과입니다.
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
