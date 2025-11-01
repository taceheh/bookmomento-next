import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  const page = searchParams.get('page') || '1';
  const count = searchParams.get('count') || '10';

  if (!q) {
    return new NextResponse('Missing query parameter: q', { status: 400 });
  }

  try {
    const response = await axios.get(
      'https://www.aladin.co.kr/ttb/api/ItemSearch.aspx',
      {
        params: {
          ttbkey: process.env.ALADIN_API_KEY,
          Query: q,
          version: '20131101',
          SearchTarget: 'Book',
          Output: 'JS',
          Cover: 'Big',

          Start: page, // 페이지 번호
          MaxResults: count, // 페이지당 결과 수 (10개)
        },
      },
    );

    return NextResponse.json({
      items: response.data.item || [], // 검색 결과 배열
      totalResults: response.data.totalResults || 0,
      itemsPerPage: response.data.itemsPerPage || 0,
      startIndex: response.data.startIndex || 1,
    });
  } catch (error) {
    console.error('알라딘 ItemSearch API 오류 : ', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
