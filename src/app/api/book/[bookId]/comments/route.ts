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

// 댓글 삭제 (Soft Delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { bookId: string } },
) {
  // console.log('DELETE request received for bookId:', params.bookId);

  const supabase = await supabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('comment_id');
    const book_isbn = searchParams.get('book_isbn') || params.bookId;

    console.log('DELETE - commentId:', commentId, 'book_isbn:', book_isbn);

    if (!commentId) {
      return NextResponse.json(
        { error: 'comment_id is required' },
        { status: 400 },
      );
    }

    // 댓글 존재 여부 및 권한 확인
    const existingComment = await prisma.comments.findUnique({
      where: { id: commentId },
      select: { id: true, user_id: true, deleted_at: true },
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (existingComment.deleted_at) {
      return NextResponse.json(
        { error: 'Comment already deleted' },
        { status: 400 },
      );
    }

    if (existingComment.user_id !== user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Soft Delete: deleted_at 필드만 업데이트
    await prisma.comments.update({
      where: { id: commentId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    console.log('DELETE success:', commentId);
    return NextResponse.json(
      { message: 'Comment deleted successfully' },
      { status: 200 },
    );
  } catch (e: any) {
    console.error('comments DELETE error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 댓글 수정 (PATCH)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { bookId: string } },
) {
  // console.log('PATCH request received for bookId:', params.bookId);

  const supabase = await supabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('comment_id');

    const isbn = await params;
    const book_isbn = searchParams.get('book_isbn') || isbn.bookId;

    console.log('PATCH - commentId:', commentId, 'book_isbn:', book_isbn);

    if (!commentId) {
      return NextResponse.json(
        { error: 'comment_id is required' },
        { status: 400 },
      );
    }

    const { body } = await req.json();

    if (!body || !body.trim()) {
      return NextResponse.json({ error: 'Body is required' }, { status: 400 });
    }

    // 댓글 존재 여부 및 권한 확인
    const existingComment = await prisma.comments.findUnique({
      where: { id: commentId },
      select: { id: true, user_id: true, deleted_at: true },
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (existingComment.deleted_at) {
      return NextResponse.json(
        { error: 'Cannot edit deleted comment' },
        { status: 400 },
      );
    }

    if (existingComment.user_id !== user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // 댓글 수정
    const updatedComment = await prisma.comments.update({
      where: { id: commentId },
      data: {
        body: body.trim(),
        updated_at: new Date(),
      },
    });

    console.log('PATCH success:', updatedComment.id);
    return NextResponse.json(updatedComment, { status: 200 });
  } catch (e: any) {
    console.error('comments PATCH error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
