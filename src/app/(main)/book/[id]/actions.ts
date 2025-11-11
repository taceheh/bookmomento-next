'use server';

import { commentSchema } from '@/lib/schemas';
import { prisma } from '@/lib/prisma';
import { supabaseServer } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

export async function addComment(
  bookId: string,
  parentId: string | null,
  formData: FormData,
) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: '로그인이 필요합니다.' };
  }

  const validationResult = commentSchema.safeParse({
    body: formData.get('body'),
  });

  if (!validationResult.success) {
    return {
      error:
        validationResult.error.flatten().fieldErrors.body?.[0] ||
        '유효하지 않은 댓글입니다.',
    };
  }
  const { body } = validationResult.data;

  try {
    let root_id: string;
    let depth = 0;

    if (parentId) {
      const parent = await prisma.comments.findUnique({
        where: { id: parentId },
        select: { root_id: true, depth: true, book_isbn: true },
      });
      if (!parent || parent.book_isbn !== bookId) {
        return { error: '유효하지 않은 부모 댓글입니다.' };
      }
      root_id = parent.root_id;
      depth = (parent.depth ?? 0) + 1;
      if (depth > 1) {
        return { error: '더 이상 답글을 작성할 수 없습니다.' };
      }
    } else {
      root_id = randomUUID();
      depth = 0;
    }

    await prisma.comments.create({
      data: {
        id: randomUUID(),
        user_id: user.id,
        book_isbn: bookId,
        parent_id: parentId,
        root_id,
        depth,
        body,
      },
    });

    revalidatePath(`/book/${bookId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Server Action Error (addComment):', error);
    return { error: '댓글 작성 중 오류가 발생했습니다.' };
  }
}

export async function editComment(
  bookId: string,
  commentId: string,
  formData: FormData,
) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: '로그인이 필요합니다.' };
  }

  const validationResult = commentSchema.safeParse({
    body: formData.get('body'),
  });

  if (!validationResult.success) {
    return {
      error:
        validationResult.error.flatten().fieldErrors.body?.[0] ||
        '유효하지 않은 댓글입니다.',
    };
  }
  const { body } = validationResult.data;

  try {
    const existingComment = await prisma.comments.findUnique({
      where: { id: commentId },
      select: { user_id: true, deleted_at: true },
    });

    if (!existingComment || existingComment.deleted_at) {
      return { error: '존재하지 않거나 삭제된 댓글입니다.' };
    }
    if (existingComment.user_id !== user.id) {
      return { error: '댓글을 수정할 권한이 없습니다.' };
    }

    await prisma.comments.update({
      where: { id: commentId },
      data: { body: body.trim(), updated_at: new Date() },
    });

    revalidatePath(`/book/${bookId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Server Action Error (editComment):', error);
    return { error: '댓글 수정 중 오류가 발생했습니다.' };
  }
}
export async function deleteComment(bookId: string, commentId: string) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: '로그인이 필요합니다.' };
  }

  try {
    const existingComment = await prisma.comments.findUnique({
      where: { id: commentId },
      select: { user_id: true, deleted_at: true },
    });

    if (!existingComment) {
      return { error: '존재하지 않거나 이미 삭제된 댓글입니다.' };
    }
    if (existingComment.deleted_at) {
      return { success: true };
    }
    if (existingComment.user_id !== user.id) {
      return { error: '댓글을 삭제할 권한이 없습니다.' };
    }

    const softDeleteTimestamp = new Date();

    console.log(
      `[ACTION-DELETE] Finding comment tree for parent: ${commentId}`,
    );

    const commentTreeIds = await prisma.$queryRaw<[{ id: string }]>`
      WITH RECURSIVE "CommentTree" AS (
        SELECT "id"
        FROM "comments"
        WHERE "id" = ${commentId}::uuid

        UNION ALL

        SELECT c."id"
        FROM "comments" c
        JOIN "CommentTree" ct ON c."parent_id" = ct."id"
      )
      SELECT "id" FROM "CommentTree";
    `;

    const idsToDelete = commentTreeIds.map((row) => row.id);

    console.log(
      `[ACTION-DELETE] Found ${
        idsToDelete.length
      } comments to delete (IDs): ${JSON.stringify(idsToDelete)}`,
    );

    if (idsToDelete.length === 0) {
      console.error(
        `[ACTION-DELETE] Fatal Error: Recursive query returned 0 IDs for existing comment ${commentId}.`,
      );

      idsToDelete.push(commentId);
    }

    const updateCount = await prisma.comments.updateMany({
      where: {
        id: {
          in: idsToDelete,
        },
        deleted_at: null,
      },
      data: {
        deleted_at: softDeleteTimestamp,
        updated_at: softDeleteTimestamp,
      },
    });

    console.log(
      `[ACTION-DELETE] Success: Total ${updateCount.count} comments marked as deleted.`,
    );

    revalidatePath(`/book/${bookId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Server Action Error (deleteComment):', error);
    return { error: '댓글 삭제 중 오류가 발생했습니다.' };
  }
}
