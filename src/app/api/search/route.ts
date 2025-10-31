import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q) {
    return new NextResponse('Missing q', { status: 400 });
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
          MaxResults: '5',
          Output: 'JS',
          Cover: 'Big',
          itemsPerPage: '5',
          totalResults: '5',
        },
      },
    );
    return NextResponse.json(response.data.item);
  } catch (error) {
    console.error('알라딘 상세보기 API 오류 : ', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
