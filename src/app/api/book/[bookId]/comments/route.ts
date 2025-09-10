export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

/**
 * 댓글 작성 (POST)
 * - 경로: /api/book/[isbn]/comments
 * - body: { body: string, parent_id?: string | null }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { bookId: string } },
) {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { body, parent_id = null } = await req.json();
  const isbn = await params;
  const book_isbn = isbn.bookId;

  try {
    let root_id: string;
    let depth = 0;

    if (parent_id) {
      const parent = await prisma.comments.findUnique({
        where: { id: parent_id },
        select: { id: true, root_id: true, depth: true, book_isbn: true },
      });

      if (!parent) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 },
        );
      }
      if (parent.book_isbn !== book_isbn) {
        return NextResponse.json(
          { error: 'ISBN mismatch with parent' },
          { status: 400 },
        );
      }

      root_id = parent.root_id;
      depth = (parent.depth ?? 0) + 1;
    } else {
      root_id = randomUUID();
      depth = 0;
    }

    const created = await prisma.comments.create({
      data: {
        id: randomUUID(),
        user_id: user.id,
        book_isbn,
        parent_id,
        root_id,
        depth,
        body,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error('comments POST error', e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

/**
 * 댓글 조회 (GET)
 * - 경로: /api/book/[isbn]/comments?parent_id=null | {parentId}
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { bookId: string } },
) {
  try {
    const { searchParams } = new URL(req.url);
    const parentIdParam = searchParams.get('parent_id'); // "null" | uuid | null

    const isbn = await params;
    const book_isbn = isbn.bookId;

    const isRootQuery = parentIdParam === null || parentIdParam === 'null';
    const where = {
      book_isbn,
      deleted_at: null as Date | null, // soft delete 컬럼 있을 경우
      parent_id: isRootQuery ? null : parentIdParam!,
    };

    const comments = await prisma.comments.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ items: comments });
  } catch (e: any) {
    console.error('comments GET error', e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
