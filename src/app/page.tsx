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
  books: Book[];
}

export default function HomePage() {
  // const [bestSellers, setBestSellers] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [reviewRanking, setReviewRanking] = useState([]);
  const [likeRanking, setLikeRanking] = useState([]);
  const [query, setQuery] = useState('');
  // const [searchResults, setSearchResults] = useState([]);
  const [bestSellers, setBestSellers] = useState<Book[]>([]);
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  useEffect(() => {
    fetch('/api/book/bestseller')
      .then((res) => res.json())
      .then(setBestSellers);

    fetch('/api/book/brendnew')
      .then((res) => res.json())
      .then(setNewBooks);

    fetch('/api/book/mostcomments')
      .then((res) => res.json())
      .then(setReviewRanking);

    fetch('/api/book/mostlike')
      .then((res) => res.json())
      .then(setLikeRanking);
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
        <Section title="리뷰 순위" books={reviewRanking} />
        <Section title="좋아요 베스트" books={likeRanking} />

        <footer className="text-center text-xs text-gray-400 border-t pt-6">
          © 2025 책담 冊談
        </footer>
      </main>
    </>
  );
}

function Section({ title, books }: SectionProps) {
  return (
    <section className="space-y-2 pb-10">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="grid grid-cols-5 gap-4 h-40">
        {books?.map((book) => (
          <Link href={`/book/${book.isbn}`} key={book.isbn}>
            <img className="w-30 h-40" src={book.cover} alt="book cover" />
            <div className="text-sm pt-2 line-clamp-2">{book.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
