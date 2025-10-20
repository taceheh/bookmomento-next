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
