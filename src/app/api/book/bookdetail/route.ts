import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isbn = searchParams.get('isbn');

  if (!isbn) {
    return NextResponse.json({ error: 'Missing ISBN' }, { status: 400 });
  }

  try {
    // 1) DB에서 먼저 조회
    const existing =
      isbn.length === 13
        ? await prisma.books.findUnique({ where: { isbn13: isbn } })
        : await prisma.books.findFirst({ where: { isbn10: isbn } });

    if (existing) {
      return NextResponse.json(existing);
    }

    // 2) 알라딘 API 호출
    const { data } = await axios.get(
      `https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx`,
      {
        params: {
          ttbkey: process.env.ALADIN_API_KEY,
          ItemId: isbn,
          ItemIdType: 'ISBN',
          version: '20131101',
          Output: 'JS',
          Cover: 'Big',
        },
      },
    );
    const item = Array.isArray(data?.item) ? data.item[0] : null;
    if (!item?.isbn13) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // 3) DB에 저장 (upsert)
    const saved = await prisma.books.upsert({
      where: { isbn13: item.isbn13 },
      update: {
        title: item.title,
        author: item.author,
        publisher: item.publisher,
        cover: item.cover,
        description: item.description,
        pub_date: item.pubDate ? new Date(item.pubDate) : null,
        category_id: item.categoryId,
        category_name: item.categoryName,
        price_standard: item.priceStandard,
        price_sales: item.priceSales,
        sales_point: item.salesPoint,
        customer_review_rank: item.customerReviewRank,
        link: item.link,
        updated_at: new Date(),
      },
      create: {
        isbn13: item.isbn13,
        isbn10: item.isbn,
        title: item.title,
        author: item.author,
        publisher: item.publisher,
        cover: item.cover,
        description: item.description,
        pub_date: item.pubDate ? new Date(item.pubDate) : null,
        category_id: item.categoryId,
        category_name: item.categoryName,
        price_standard: item.priceStandard,
        price_sales: item.priceSales,
        sales_point: item.salesPoint,
        customer_review_rank: item.customerReviewRank,
        link: item.link,
      },
    });

    return NextResponse.json(saved);
  } catch (error: any) {
    console.error('알라딘 상세보기 API 오류:', error?.message || error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
