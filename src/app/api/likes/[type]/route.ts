// app/api/likes/[type]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: 'posts' | 'comments' }> },
) {
  try {
    const { type } = await params;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

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

      const likedIsbns = likes.map((like) => like.book_isbn.trim());

      const books = await prisma.books.findMany({
        where: {
          isbn10: { in: likedIsbns },
        },
      });

      const bookMap = new Map(books.map((book) => [book.isbn10, book]));

      const booksData = likes.map((like) => {
        const cleanIsbn = like.book_isbn.trim(); // (이 값은 ISBN-10)
        const book = bookMap.get(cleanIsbn);

        return {
          id: like.book_isbn, // (ISBN-10)
          title: book?.title || 'Unknown Title',
          author: book?.author || 'Unknown Author',
          cover: book?.cover || '',
          likedAt: like.created_at,
        };
      });

      return NextResponse.json(booksData);
    }

    if (type === 'comments') {
      // 내가 쓴 댓글
      const comments = await prisma.comments.findMany({
        where: { user_id: userId, deleted_at: null },
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
    console.error('likes API error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
