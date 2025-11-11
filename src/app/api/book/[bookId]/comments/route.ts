export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
) {
  try {
    const { searchParams } = new URL(req.url);
    const parentIdParam = searchParams.get('parent_id');

    const isbn = await params;
    const book_isbn = isbn.bookId;

    const isRootQuery = parentIdParam === null || parentIdParam === 'null';
    const where = {
      book_isbn,
      deleted_at: null as Date | null,
      parent_id: isRootQuery ? null : parentIdParam!,
    };

    const comments = await prisma.comments.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    const totalCount = await prisma.comments.count({
      where: {
        book_isbn,
        deleted_at: null,
      },
    });

    return NextResponse.json({
      items: comments,
      count: comments.length, // 현재 쿼리된 개수 (루트만)
      totalCount, // 전체 댓글 수 (루트+대댓글)
    });
  } catch (e: any) {
    console.error('comments GET error', e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
