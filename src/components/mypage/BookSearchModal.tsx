'use client';

import { useReviewModalStore } from '@/stores/modalStore';
import { useInfiniteQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Fragment, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useInView } from 'react-intersection-observer';

type Book = {
  isbn13: string;
  title: string;
  cover: string;
  author: string;
};
type ApiBook = {
  isbn13: string;
  title: string;
  cover: string;
  author: string;
};
type BookSearchResponse = {
  items: ApiBook[];
  totalResults: number;
  itemsPerPage: number;
  startIndex: number;
};

type BookSearchModalProps = {
  onBookSelect: (book: Book) => void;
};

const fetchBooks = async ({
  query,
  page,
}: {
  query: string;
  page: number;
}): Promise<BookSearchResponse> => {
  const res = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&page=${page}&count=10`,
  );
  if (!res.ok) {
    throw new Error('Failed to fetch books');
  }
  return res.json();
};

export function BookSearchModal({ onBookSelect }: BookSearchModalProps) {
  const { isBookSearchModalOpen, closeBookSearchModal } = useReviewModalStore();
  const [searchQuery, setSearchQuery] = useState('');

  const [debouncedQuery] = useDebounce(searchQuery, 500);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['bookSearch', debouncedQuery], // debouncedQuery가 바뀌면 자동 리셋
      queryFn: ({ pageParam = 1 }) =>
        fetchBooks({ query: debouncedQuery, page: pageParam as number }),
      getNextPageParam: (lastPage, allPages) => {
        const currentPage = allPages.length;
        const totalItems = lastPage.totalResults;
        const itemsPerPage = lastPage.itemsPerPage || 10;

        if (currentPage * itemsPerPage < totalItems) {
          return currentPage + 1; // 다음 페이지 번호 반환
        }
        return undefined; // 더 이상 페이지가 없음을 알림
      },
      initialPageParam: 1,
      enabled: !!debouncedQuery,
    });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSelectAndClose = (book: ApiBook) => {
    onBookSelect({
      isbn13: book.isbn13,
      title: book.title,
      cover: book.cover,
      author: book.author, // author 정보도 함께 전달
    });
    setSearchQuery('');
    closeBookSearchModal();
  };

  const handleClose = () => {
    setSearchQuery('');
    closeBookSearchModal();
  };

  if (!isBookSearchModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl z-50 overflow-hidden flex flex-col h-[80vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">책 검색하기</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="p-6 border-b">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="책 제목을 입력하세요"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {isFetching && !isFetchingNextPage && <p>검색 중...</p>}

          {data?.pages.map((page, i) => (
            <Fragment key={i}>
              {page.items.map((book) => (
                <div
                  key={book.isbn13}
                  onClick={() => handleSelectAndClose(book)}
                  className="flex gap-3 p-2 items-center cursor-pointer hover:bg-gray-100 rounded-lg"
                >
                  <Image
                    src={book.cover}
                    alt={book.title}
                    width={40}
                    height={60}
                    className="rounded object-cover"
                    unoptimized
                  />
                  <div>
                    <span className="text-sm font-medium">{book.title}</span>
                    <span className="text-xs text-gray-600 block">
                      {book.author}
                    </span>
                  </div>
                </div>
              ))}
            </Fragment>
          ))}

          <div ref={ref} className="h-10 flex items-center justify-center">
            {isFetchingNextPage ? (
              <p>불러오는 중...</p>
            ) : hasNextPage ? (
              ' '
            ) : (data?.pages?.[0]?.items?.length ?? 0) > 0 ? (
              <p>마지막 결과입니다.</p>
            ) : (
              !isFetching && debouncedQuery && <p>검색 결과가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
