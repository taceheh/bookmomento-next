'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { reviewSchema } from '@/lib/schemas';
import { supabaseServer } from '@/lib/supabaseServer';

export async function addReview(formData: FormData) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: '로그인이 필요합니다.' };
  }

  const validatedFields = reviewSchema.safeParse({
    book_isbn: formData.get('book_isbn'),
    review: formData.get('review'),
  });

  // 유효성 검사 실패 시
  if (!validatedFields.success) {
    return {
      error: '입력값이 유효하지 않습니다.',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { book_isbn, review } = validatedFields.data;

  try {
    await prisma.reviews.create({
      data: {
        user_id: user.id, // 인증된 사용자 ID
        book_isbn: book_isbn,
        review: review,
      },
    });

    revalidatePath('/mypage/read-books');
    return { success: true, message: '기록이 추가되었습니다.' };
  } catch (e: any) {
    if (e.code === 'P2002') {
      return { error: '이미 리뷰를 작성한 책입니다.' };
    }
    console.error(e);
    return { error: '데이터베이스 저장 중 오류가 발생했습니다.' };
  }
}

/**
 * '내 리뷰 조회' 함수 (서버 컴포넌트용)
 */
export async function getMyReviews() {
  const supabase = await supabaseServer(); //
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  try {
    const reviews = await prisma.reviews.findMany({
      //
      where: {
        user_id: user.id,
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        books: {
          select: {
            isbn13: true,
            title: true,
            cover: true,
          },
        },
      },
    });
    return reviews;
  } catch (e) {
    console.error(e);
    return []; // 오류 발생 시 빈 배열 반환
  }
}
