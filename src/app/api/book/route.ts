import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { prisma } from '@/lib/prisma';

const ALADIN_API_KEY = process.env.ALADIN_API_KEY;
const ALADIN_ITEM_LIST_URL = 'http://www.aladin.co.kr/ttb/api/ItemList.aspx';
const ALADIN_ITEM_LOOKUP_URL =
  'https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx';

async function fetchAladinList(queryType: string, maxResults: string = '5') {
  const response = await axios.get(ALADIN_ITEM_LIST_URL, {
    params: {
      ttbkey: ALADIN_API_KEY,
      QueryType: queryType,
      version: '20131101',
      SearchTarget: 'Book',
      MaxResults: maxResults,
      Output: 'JS',
      Cover: 'Big',
    },
  });
  return response.data.item || [];
}

async function fetchRankedList(by: 'comments' | 'likes', take: number = 5) {
  let topList;

  if (by === 'comments') {
    topList = await prisma.comments.groupBy({
      where: { deleted_at: null },
      by: ['book_isbn'],
      _count: { book_isbn: true },
      orderBy: { _count: { book_isbn: 'desc' } },
      take,
    });
  } else {
    topList = await prisma.book_reactions.groupBy({
      by: ['book_isbn'],
      where: { reaction: 'like' },
      _count: { book_isbn: true },
      orderBy: { _count: { book_isbn: 'desc' } },
      take,
    });
  }

  const isbns = topList.map((t: any) => t.book_isbn);
  const countByIsbn = new Map(
    topList.map((t: any) => [t.book_isbn, t._count.book_isbn]),
  );

  const results = await Promise.allSettled(
    isbns.map(async (isbn: string) => {
      const ItemIdType =
        isbn.replace(/[^0-9Xx]/g, '').length === 13 ? 'ISBN13' : 'ISBN';

      const { data } = await axios.get(ALADIN_ITEM_LOOKUP_URL, {
        params: {
          ttbkey: ALADIN_API_KEY,
          ItemId: isbn,
          ItemIdType,
          Version: '20131101',
          Output: 'JS',
          Cover: 'Big',
        },
      });
      const item = Array.isArray(data?.item) ? data.item[0] : null;
      return { isbn, item };
    }),
  );

  const items = results.map((r, idx) => {
    const isbn = isbns[idx];
    const count = countByIsbn.get(isbn) ?? 0;

    if (r.status === 'fulfilled' && r.value.item) {
      return {
        isbn,
        [by === 'comments' ? 'comment_count' : 'like_count']: count,
        book: r.value.item,
      };
    }

    return {
      isbn,
      [by === 'comments' ? 'comment_count' : 'like_count']: count,
      book: null,
      error:
        (r as PromiseRejectedResult).reason?.message ?? 'Aladin lookup failed',
    };
  });

  return items;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sort = searchParams.get('sort');
  const maxResults = searchParams.get('maxResults') || '5';

  try {
    switch (sort) {
      case 'bestseller': {
        const items = await fetchAladinList('BestSeller', maxResults);
        return NextResponse.json({ items });
      }

      case 'new': {
        const items = await fetchAladinList('ItemNewSpecial', maxResults);
        return NextResponse.json({ items });
      }

      case 'comments': {
        const items = await fetchRankedList(
          'comments',
          parseInt(maxResults, 10),
        );
        return NextResponse.json({ items });
      }

      case 'likes': {
        const items = await fetchRankedList('likes', parseInt(maxResults, 10));
        return NextResponse.json({ items });
      }

      default:
        return new NextResponse(
          JSON.stringify({
            error:
              "Invalid 'sort' parameter. Must be one of: 'bestseller', 'new', 'comments', 'likes'.",
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
    }
  } catch (error: any) {
    console.error(`[API Error /api/book?sort=${sort}]`, error.message);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
