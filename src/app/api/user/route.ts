import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabaseServer } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
  try {
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

    // authentication만 삭제하면 trigger가 나머지 자동 처리!
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id,
    );

    if (deleteError) {
      console.error('회원 탈퇴 실패:', deleteError);
      return NextResponse.json(
        { error: '회원 탈퇴 처리 중 오류가 발생했습니다.' },
        { status: 500 },
      );
    }

    // 세션 종료
    await sb.auth.signOut();

    return NextResponse.json({
      success: true,
      message: '회원 탈퇴가 완료되었습니다.',
    });
  } catch (error) {
    console.error('회원 탈퇴 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { nickname } = await req.json();

    if (!nickname || typeof nickname !== 'string') {
      return NextResponse.json(
        { error: '닉네임을 입력해주세요.' },
        { status: 400 },
      );
    }
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
      return NextResponse.json(
        { error: '닉네임은 2자 이상 20자 이하여야 합니다.' },
        { status: 400 },
      );
    }
    if (!/^[a-zA-Z0-9가-힣_]*$/.test(trimmedNickname)) {
      return NextResponse.json(
        { error: '닉네임은 영문, 숫자, 한글, 밑줄(_)만 사용할 수 있습니다.' },
        { status: 400 },
      );
    }

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

    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: { nickname: trimmedNickname },
    });

    if (!updatedUser) {
      console.error('Prisma 업데이트 실패:', user.id);
      return NextResponse.json(
        { error: '닉네임 변경에 실패했습니다.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      nickname: updatedUser.nickname,
    });
  } catch (error: any) {
    console.error('API 에러:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '이미 사용 중인 닉네임입니다.' },
        { status: 409 }, // 409 Conflict
      );
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
