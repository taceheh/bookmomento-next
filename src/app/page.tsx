'use client';

import { SortTabBar } from '@/components/sortTabBar';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Book {
  isbn: string;
  title: string;
  cover: string;
}

interface SectionProps {
  title: string;
  books: Book[] | null; // null = 로딩 중, [] = 데이터 없음
  emptyText?: string; // 섹션별 빈 문구
}

export default function HomePage() {
  const [bestSellers, setBestSellers] = useState<Book[] | null>(null);
  const [newBooks, setNewBooks] = useState<Book[] | null>(null);
  const [reviewRanking, setReviewRanking] = useState<Book[] | null>(null);
  const [likeRanking, setLikeRanking] = useState<Book[] | null>(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  useEffect(() => {
    fetch('/api/book/bestseller')
      .then((res) => res.json())
      .then((data) => setBestSellers(data))
      .catch(() => setBestSellers([]));

    fetch('/api/book/brendnew')
      .then((res) => res.json())
      .then((data) => setNewBooks(data))
      .catch(() => setNewBooks([]));

    fetch('/api/book/most-commented')
      .then((res) => res.json())
      .then(({ items }) =>
        setReviewRanking(
          items
            .filter((it: any) => it.book)
            .map((it: any) => ({
              isbn: it.isbn,
              title: it.book.title,
              cover: it.book.cover,
            })),
        ),
      )
      .catch(() => setReviewRanking([]));

    fetch('/api/book/mostlike')
      .then((res) => res.json())
      .then((data) => setLikeRanking(data))
      .catch(() => setLikeRanking([]));
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    const res = await fetch(`/search?title=${query}`);
    const data = await res.json();
    setSearchResults(data);
  };

  return (
    <>
      <SortTabBar />
      <main className="max-w-screen-md mx-auto px-4 py-6 space-y-8">
        <div className="bg-black h-[400px]"></div>
        <nav className="justify-between flex">
          <div className="w-20 h-20 border-black-100 border-1"></div>
          <div className="w-20 h-20 border-black-100 border-1"></div>
          <div className="w-20 h-20 border-black-100 border-1"></div>
          <div className="w-20 h-20 border-black-100 border-1"></div>
          <div className="w-20 h-20 border-black-100 border-1"></div>
        </nav>
        {searchResults.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {searchResults.map((book) => (
              <div key={book.isbn}>
                <button
                  onClick={() =>
                    (window.location.href = `/detailGo?isbn=${book.isbn}`)
                  }
                >
                  <img src={book.cover} alt="book cover" />
                  <div>{book.title}</div>
                </button>
              </div>
            ))}
          </div>
        )}

        <Section title="베스트셀러" books={bestSellers} />
        <Section title="신간 추천" books={newBooks} />
        <Section
          title="리뷰 순위"
          books={reviewRanking}
          emptyText="아직 댓글을 단 책이 없어요!"
        />
        <Section
          title="좋아요 베스트"
          books={likeRanking}
          emptyText="아직 좋아요를 단 책이 없어요!"
        />

        <footer className="text-center text-xs text-gray-400 border-t pt-6">
          © 2025 책담 冊談
        </footer>
      </main>
    </>
  );
}

function Section({ title, books, emptyText }: SectionProps) {
  return (
    <section className="space-y-2 pb-10">
      <h2 className="text-lg font-bold">{title}</h2>
      {books === null ? (
        <div className="text-sm text-gray-400 py-6">불러오는 중...</div>
      ) : books.length === 0 ? (
        <div className="text-sm text-gray-500 py-6">
          {emptyText ?? '표시할 항목이 없습니다.'}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4 h-40">
          {books.map((book) => (
            <Link href={`/book/${book.isbn}`} key={book.isbn}>
              <img className="w-30 h-40" src={book.cover} alt="book cover" />
              <div className="text-sm pt-2 line-clamp-2">{book.title}</div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
