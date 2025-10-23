import Slider from '@/components/Slider';
import { SortTabBar } from '@/components/sortTabBar';
import { Book } from '@/types/book';
import Section from '@/components/Section';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function getBestSellers(): Promise<Book[]> {
  const res = await fetch(`${BASE_URL}/api/book/bestseller`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

async function getNewBooks(): Promise<Book[]> {
  const res = await fetch(`${BASE_URL}/api/book/brendnew`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

async function getReviewRanking(): Promise<Book[]> {
  const res = await fetch(`${BASE_URL}/api/book/most-commented`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const { items } = await res.json();
  return items
    .filter((it: any) => it.book)
    .map((it: any) => ({
      isbn: it.isbn,
      title: it.book.title,
      cover: it.book.cover,
    }));
}

async function getLikeRanking(): Promise<Book[]> {
  const res = await fetch(`${BASE_URL}/api/book/most-liked`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const { items } = await res.json();
  return items
    .filter((it: any) => it.book)
    .map((it: any) => ({
      isbn: it.isbn,
      title: it.book.title,
      cover: it.book.cover,
    }));
}

export default async function HomePage() {
  const [bestSellers, newBooks, reviewRanking, likeRanking] = await Promise.all(
    [getBestSellers(), getNewBooks(), getReviewRanking(), getLikeRanking()],
  );

  return (
    <>
      <SortTabBar />
      <main className="max-w-screen-md mx-auto px-4 py-6 space-y-8">
        <Slider />
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
