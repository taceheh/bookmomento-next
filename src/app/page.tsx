import Slider from '@/components/Slider';
import { SortTabBar } from '@/components/sortTabBar';
import { Book } from '@/types/book';
import Section from '@/components/Section';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// 'comments' 또는 'likes' 정렬 시의 API 응답 아이템 타입
// (book 필드 안에 알라딘 item 객체가 중첩되어 있음)
interface RankedBookItem {
  isbn: string;
  comment_count?: number;
  like_count?: number;
  book: Book | null; // Aladin 'item' 객체 (Book 타입과 일치 가정)
  error?: string;
}

/**
 * 헬퍼 함수: 통합 API를 호출하고 items 배열을 반환합니다.
 * @param sort - 'bestseller', 'new', 'comments', 'likes'
 */
async function getBooks(
  sort: 'bestseller' | 'new' | 'comments' | 'likes',
): Promise<Book[]> {
  const res = await fetch(`${BASE_URL}/api/book?sort=${sort}`, {
    cache: 'no-store',
  });

  if (!res.ok) return [];

  const data = await res.json();
  const items = data.items || [];

  // 'bestseller'와 'new'는 items가 이미 Book[] 배열입니다.
  if (sort === 'bestseller' || sort === 'new') {
    return items as Book[];
  }

  // 'comments'와 'likes'는 items가 RankedBookItem[] 배열입니다.
  // 중첩된 'book' 객체만 추출하여 Book[] 배열로 변환합니다.
  if (sort === 'comments' || sort === 'likes') {
    return (items as RankedBookItem[])
      .filter((item) => item.book) // book 객체가 null이 아닌 것만 필터링
      .map((item) => item.book as Book); // book 객체만 매핑하여 반환
  }

  return [];
}

export default async function HomePage() {
  // Promise.all을 사용하여 병렬로 4개의 API를 호출합니다.
  const [bestSellers, newBooks, reviewRanking, likeRanking] = await Promise.all(
    [
      getBooks('bestseller'),
      getBooks('new'), // 'brendnew' -> 'new'로 수정
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
