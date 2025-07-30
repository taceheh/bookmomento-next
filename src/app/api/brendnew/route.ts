import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isbn = searchParams.get('isbn');

  if (!isbn) {
    return new NextResponse('Missing ISBN', { status: 400 });
  }

  try {
    const response = await axios.get(
      `https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx`,
      {
        params: {
          ttbkey: process.env.NEXT_PUBLIC_ALADIN_API_KEY,
          ItemId: isbn,
          ItemIdType: 'ISBN',
          version: '20131101',
          Output: 'JS',
          Cover: 'Big',
        },
      },
    );

    return NextResponse.json(response.data.item);
  } catch (error) {
    console.error('알라딘 상세보기 API 오류 : ', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
