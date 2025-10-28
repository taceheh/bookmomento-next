import { z } from 'zod';

/**
 * 프로필 수정 폼 유효성 검사 스키마
 */
export const profileSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다.')
    .max(20, '닉네임은 20자 이하여야 합니다.')
    .regex(
      /^[a-zA-Z0-9가-힣_]*$/,
      '닉네임은 영문, 숫자, 한글, 밑줄(_)만 사용할 수 있습니다.',
    ),
});

// Zod 스키마에서 TypeScript 타입 추론
export type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * 댓글/답글 폼 유효성 검사 스키마
 */
export const commentSchema = z.object({
  body: z
    .string()
    .min(1, '댓글을 입력해주세요.')
    .max(1000, '댓글은 1,000자 이내로 작성해주세요.'),
});

export type CommentFormData = z.infer<typeof commentSchema>;
