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
      root_id = parent.root_id; // 부모의 루트를 승계
      depth = (parent.depth ?? 0) + 1; // 깊이 +1 (최대 1까지만 허용하려면 여기서 가드)
      // 예: if (depth > 1) return 400
    } else {
      root_id = randomUUID(); // 루트 댓글이면 자기 자신을 루트로
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

// 댓글 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isbn = searchParams.get('book_isbn');
    const parentIdParam = searchParams.get('parent_id'); // "null" | null | "uuid"

    if (!isbn) {
      return NextResponse.json(
        { error: 'book_isbn is required' },
        { status: 400 },
      );
    }

    // parent_id 판단 로직
    const isRootQuery = parentIdParam === null || parentIdParam === 'null';
    const where = {
      book_isbn: isbn,
      deleted_at: null as Date | null,
      parent_id: isRootQuery ? null : parentIdParam!, // 대댓글이면 parent_id=부모ID
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

// 댓글 삭제
export async function DELETE(req: NextRequest) {}

// 댓글 수정
export async function PATCH(req: NextRequest) {}
