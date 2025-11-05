'use server';

import { z } from 'zod';
import { profileSchema } from '@/lib/schemas';
import { prisma } from '@/lib/prisma';
import { supabaseServer } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';

export async function updateUserNickname(formData: FormData) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  const validationResult = profileSchema.safeParse({
    nickname: formData.get('nickname'),
  });

  if (!validationResult.success) {
    return {
      error:
        validationResult.error.flatten().fieldErrors.nickname?.[0] ||
        '유효하지 않은 닉네임입니다.',
    };
  }

  const { nickname } = validationResult.data;

  try {
    await prisma.public_users.update({
      where: { id: user.id },
      data: { nickname: nickname },
    });

    revalidatePath('/mypage/edit');
    revalidatePath('/mypage');

    return { success: true, message: '닉네임이 성공적으로 변경되었습니다.' };
  } catch (error: any) {
    console.error('Server Action Error (updateUserNickname):', error);
    if (error.code === 'P2002') {
      return { error: '이미 사용 중인 닉네임입니다.' };
    }
    return { error: '닉네임 변경 중 서버 오류가 발생했습니다.' };
  }
}
