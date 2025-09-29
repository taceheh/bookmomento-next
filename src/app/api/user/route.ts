import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DELETED_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function DELETE(req: NextRequest) {
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

  try {
    await prisma.$transaction(async (tx) => {
      // 좋아요/반응 삭제
      await tx.book_reactions.deleteMany({
        where: { user_id: user.id },
      });

      // 댓글 익명화
      await tx.comments.updateMany({
        where: { user_id: user.id },
        data: {
          user_id: DELETED_USER_ID,
          updated_at: new Date(),
        },
      });

      // 사용자 정보 삭제
      await tx.users.delete({
        where: { id: user.id },
      });
    });

    // Auth 사용자 삭제
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      user.id,
    );

    if (deleteError) {
      throw new Error(`Auth deletion failed: ${deleteError.message}`);
    }

    return NextResponse.json({
      message: 'Account deleted successfully',
      details: {
        commentsAnonymized: true,
        reactionsDeleted: true,
        userDataDeleted: true,
      },
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 },
    );
  }
}
