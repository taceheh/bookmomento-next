// app/api/books/top-commented/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export async function GET() {
  // 1) 댓글 수 집계 (전체 댓글 합산)
  const top = await prisma.comments.groupBy({
    where: { deleted_at: null },
    by: ['book_isbn'],
    _count: { book_isbn: true },
    orderBy: { _count: { book_isbn: 'desc' } },
    take: 5,
  });

  const isbns = top.map((t: any) => t.book_isbn);

  // 2) 알라딘 API 병렬 호출 (ISBN13/ISBN 자동 구분)
  const results = await Promise.allSettled(
    isbns.map(async (isbn: any) => {
      const ItemIdType =
        isbn.replace(/[^0-9Xx]/g, '').length === 13 ? 'ISBN13' : 'ISBN';
      const { data } = await axios.get(
        'https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx',
        {
          params: {
            ttbkey: process.env.NEXT_PUBLIC_ALADIN_API_KEY, // ← 서버 전용 키 권장 (NEXT_PUBLIC 금지)
            ItemId: isbn,
            ItemIdType,
            Version: '20131101',
            Output: 'JS',
            Cover: 'Big',
          },
        },
      );
      const item = Array.isArray(data?.item) ? data.item[0] : null;
      return { isbn, item };
    }),
  );

  // 3) 댓글 수와 알라딘 메타 병합(집계 순서 유지)
  const countByIsbn = new Map(
    top.map((t: any) => [t.book_isbn, t._count.book_isbn]),
  );
  const items = results.map((r, idx) => {
    const isbn = isbns[idx];
    if (r.status === 'fulfilled') {
      return {
        isbn,
        comment_count: countByIsbn.get(isbn) ?? 0,
        book: r.value.item, // 알라딘 메타(제목, 저자, 표지 등)
      };
    }
    // 실패 시에도 자리는 유지
    return {
      isbn,
      comment_count: countByIsbn.get(isbn) ?? 0,
      book: null,
      error:
        (r as PromiseRejectedResult).reason?.message ?? 'aladin lookup failed',
    };
  });
  return NextResponse.json({ items });
}
