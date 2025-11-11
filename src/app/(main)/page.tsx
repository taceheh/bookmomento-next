import Slider from '@/components/Slider';
import { SortTabBar } from '@/components/sortTabBar';
import { Book } from '@/types/book';
import Section from '@/components/Section';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface RankedBookItem {
  isbn: string;
  comment_count?: number;
  like_count?: number;
  book: Book | null;
  error?: string;
}

async function getBooks(
  sort: 'bestseller' | 'new' | 'comments' | 'likes',
): Promise<Book[]> {
  const res = await fetch(`${BASE_URL}/api/book?sort=${sort}`, {
    cache: 'no-store',
  });

  if (!res.ok) return [];

  const data = await res.json();
  const items = data.items || [];

  if (sort === 'bestseller' || sort === 'new') {
    return items as Book[];
  }

  if (sort === 'comments' || sort === 'likes') {
    return (items as RankedBookItem[])
      .filter((item) => item.book)
      .map((item) => item.book as Book);
  }

  return [];
}

export default async function HomePage() {
  const [bestSellers, newBooks, reviewRanking, likeRanking] = await Promise.all(
    [
      getBooks('bestseller'),
      getBooks('new'),
      getBooks('comments'),
      getBooks('likes'),
    ],
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
