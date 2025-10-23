// src/components/home/Section.tsx (새로 만들기)

import Link from 'next/link';
import { Book } from '@/types/book'; // ⭐️ 공용 타입 import (가정)

interface SectionProps {
  title: string;
  books: Book[]; // ⭐️ 서버에서 데이터를 다 받아오므로 'null' 타입 제거
  emptyText?: string;
}

// ⭐️ 이 컴포넌트는 'use client'가 필요 없는 순수 서버 컴포넌트입니다.
export default function Section({ title, books, emptyText }: SectionProps) {
  return (
    <section className="space-y-2 pb-10">
      <h2 className="text-lg font-bold">{title}</h2>

      {/* ⭐️ 로딩 상태(books === null)가 사라졌으므로 로직 단순화 */}
      {books.length === 0 ? (
        <div className="text-sm text-gray-500 py-6">
          {emptyText ?? '표시할 항목이 없습니다.'}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4 h-40">
          {books.map((book) => (
            <Link href={`/book/${book.isbn}`} key={book.isbn}>
              {/* ⭐️ img 태그는 나중에 next/image로 교체 (성능최적화 단계) */}
              <img className="w-30 h-40" src={book.cover} alt="book cover" />
              <div className="text-sm pt-2 line-clamp-2">{book.title}</div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
