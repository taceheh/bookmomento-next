// app/api/books/top-commented/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export async function GET() {
  const top = await prisma.book_reactions.groupBy({
    by: ['book_isbn'],
    where: { reaction: 'like' },
    _count: { book_isbn: true },
    orderBy: { _count: { book_isbn: 'desc' } },
    take: 5,
  });

  const isbns = top.map((t) => t.book_isbn);

  const results = await Promise.allSettled(
    isbns.map(async (isbn: any) => {
      const ItemIdType =
        isbn.replace(/[^0-9Xx]/g, '').length === 13 ? 'ISBN13' : 'ISBN';
      const { data } = await axios.get(
        'https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx',
        {
          params: {
            ttbkey: process.env.NEXT_PUBLIC_ALADIN_API_KEY,
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

  const countByIsbn = new Map(
    top.map((t: any) => [t.book_isbn, t._count.book_isbn]),
  );
  const items = results.map((r, idx) => {
    const isbn = isbns[idx];
    if (r.status === 'fulfilled') {
      return {
        isbn,
        comment_count: countByIsbn.get(isbn) ?? 0,
        book: r.value.item,
      };
    }
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
