// app/api/mypage/[type]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { type: 'posts' | 'comments' } },
) {
  try {
    const { type } = params;
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    if (type === 'posts') {
      // ✅ 내가 좋아요한 책
      const likes = await prisma.book_reactions.findMany({
        where: { user_id: userId, reaction: 'like' },
        include: { book: true },
        orderBy: { created_at: 'desc' },
      });

      return NextResponse.json(
        likes.map((l) => ({
          id: l.book_isbn,
          title: l.book?.title,
          author: l.book?.author,
          cover: l.book?.cover,
          likedAt: l.created_at,
        })),
      );
    }

    if (type === 'comments') {
      // ✅ 내가 쓴 댓글
      const comments = await prisma.comments.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });

      return NextResponse.json(
        comments.map((c) => ({
          id: c.id,
          body: c.body,
          createdAt: c.created_at,
          bookIsbn: c.book_isbn,
        })),
      );
    }

    return NextResponse.json(
      { error: 'Invalid type. Use posts or comments' },
      { status: 400 },
    );
  } catch (e: any) {
    console.error('mypage API error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
