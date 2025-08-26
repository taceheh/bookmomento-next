import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const response = await axios.get(
      'http://www.aladin.co.kr/ttb/api/ItemList.aspx',
      {
        params: {
          ttbkey: process.env.NEXT_PUBLIC_ALADIN_API_KEY, // .env로 키 분리
          QueryType: 'ItemNewSpecial',
          version: '20131101',
          SearchTarget: 'Book',
          MaxResults: '5',
          Output: 'JS',
          Cover: 'Big',
        },
      },
    );

    const items = response.data.item;
    return NextResponse.json(items);
  } catch (error) {
    console.error('알라딘 API 오류:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
