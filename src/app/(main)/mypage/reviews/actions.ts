'use server'; // 서버 액션 파일임을 명시

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { supabaseServer } from '@/lib/supabaseServer';
import { reviewSchema } from '@/lib/schemas';

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

    // 캐시 무효화 (마이페이지 새로고침)
    revalidatePath('/mypage/read-books');
    return { success: true, message: '기록이 추가되었습니다.' };
  } catch (e: any) {
    // P2002: Unique 제약 조건 위반 (이미 리뷰를 작성한 책)
    if (e.code === 'P2002') {
      return { error: '이미 리뷰를 작성한 책입니다.' };
    }
    // 그 외 DB 오류
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
    // 서버 컴포넌트에서 호출될 것이므로 에러를 throw 하거나 빈 배열을 반환합니다.
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
      // (참고) 'schema.prisma'에 'books' 관계가 설정되어 있어야 함
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
