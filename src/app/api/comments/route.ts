export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

// 댓글 생성
export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { book_isbn, body, parent_id = null } = await req.json();

  try {
    const newId = randomUUID();
    const created = await prisma.comments.create({
      data: {
        id: newId,
        user_id: user.id,
        book_isbn,
        parent_id,
        root_id: newId,
        body,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error('insert error', e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// 댓글 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isbn = searchParams.get('book_isbn');
    const parentIdParam = searchParams.get('parent_id');

    if (!isbn) {
      return NextResponse.json(
        { error: 'book_isbn is required' },
        { status: 400 },
      );
    }

    console.log('isbn param:', isbn);
    const comments = await prisma.comments.findMany({
      where: {
        book_isbn: isbn,
        deleted_at: null,
        parent_id: null, // 최상위 댓글만
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ items: comments });
  } catch (e: any) {
    console.error('insert error', e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
