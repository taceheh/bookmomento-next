// app/api/likes/[type]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: 'posts' | 'comments' }> },
) {
  try {
    const { type } = await params;

    // URL에서 userId 파라미터 가져오기
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // console.log('API called:', { type, userId });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    if (type === 'posts') {
      // 내가 좋아요한 책
      const likes = await prisma.book_reactions.findMany({
        where: { user_id: userId, reaction: 'like' },
        orderBy: { created_at: 'desc' },
      });

      // console.log('Found likes:', likes.length);

      // 책 정보를 별도로 조회
      const booksData = await Promise.all(
        likes.map(async (like) => {
          const book = await prisma.books.findUnique({
            where: { isbn13: like.book_isbn },
          });

          return {
            id: like.book_isbn,
            title: book?.title || 'Unknown Title',
            author: book?.author || 'Unknown Author',
            cover: book?.cover || '',
            likedAt: like.created_at,
          };
        }),
      );

      return NextResponse.json(booksData);
    }

    if (type === 'comments') {
      // 내가 쓴 댓글
      const comments = await prisma.comments.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });

      // console.log('Found comments:', comments.length);

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
    console.error('likes API error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
