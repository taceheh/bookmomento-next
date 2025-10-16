import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function UPDATE(req: NextRequest) {}

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

  //TODO: any 타입 추후 수정
  try {
    await prisma.$transaction(async (tx: any) => {
      // 좋아요/반응 삭제
      await tx.book_reactions.deleteMany({
        where: { user_id: user.id },
      });

      // 댓글 익명화 (NULL로 변경)
      await tx.comments.updateMany({
        where: { user_id: user.id },
        data: {
          user_id: null, // DELETED_USER_ID 대신 null 사용
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

export async function PATCH(req: Request) {
  try {
    // 1. 요청 본문 파싱
    const { nickname } = await req.json();

    // 2. 유효성 검사
    if (!nickname || typeof nickname !== 'string') {
      return NextResponse.json(
        { error: '닉네임을 입력해주세요.' },
        { status: 400 },
      );
    }

    const trimmedNickname = nickname.trim();

    if (trimmedNickname.length < 2) {
      return NextResponse.json(
        { error: '닉네임은 최소 2글자 이상이어야 합니다.' },
        { status: 400 },
      );
    }

    if (trimmedNickname.length > 20) {
      return NextResponse.json(
        { error: '닉네임은 최대 20글자까지 가능합니다.' },
        { status: 400 },
      );
    }

    // 3. 사용자 인증 확인
    const sb = await supabaseServer();
    const {
      data: { user },
      error: authError,
    } = await sb.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 },
      );
    }

    // 5. DB 업데이트
    const { error: updateError } = await sb
      .from('users')
      .update({ nickname: trimmedNickname })
      .eq('id', user.id);

    if (updateError) {
      console.error('DB 업데이트 에러:', updateError);
      return NextResponse.json(
        { error: '닉네임 변경에 실패했습니다.' },
        { status: 500 },
      );
    }

    // 6. 성공 응답
    return NextResponse.json({
      success: true,
      nickname: trimmedNickname,
    });
  } catch (error) {
    console.error('API 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
