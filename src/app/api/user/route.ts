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
