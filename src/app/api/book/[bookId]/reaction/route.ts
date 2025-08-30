import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic'; // 캐시 방지
export const revalidate = 0;

type Reaction = 'like' | 'dislike';
const isReaction = (v: any): v is Reaction => v === 'like' || v === 'dislike';

export async function POST(
  req: NextRequest,
  { params }: { params: { bookId: string } },
) {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bookId = decodeURIComponent(params.bookId);
  const body = await req.json().catch(() => ({}));
  const reaction = body?.reaction as Reaction;
  if (!isReaction(reaction)) {
    return NextResponse.json(
      { error: "reaction must be 'like' or 'dislike'" },
      { status: 400 },
    );
  }

  // 현재 내 반응 조회
  const { data: existing, error: selErr } = await supabase
    .from('book_reactions')
    .select('id,reaction')
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .maybeSingle();

  if (selErr) {
    return NextResponse.json({ error: selErr.message }, { status: 500 });
  }

  // 같은 반응이면 삭제(토글 OFF)
  if (existing?.reaction === reaction) {
    const { error: delErr } = await supabase
      .from('book_reactions')
      .delete()
      .eq('id', existing.id);
    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }
    return NextResponse.json({ status: 'removed', myReaction: null });
  }

  // 없었거나 다른 반응 → 업서트
  const { data: saved, error: upErr } = await supabase
    .from('book_reactions')
    .upsert(
      { user_id: user.id, book_id: bookId, reaction },
      { onConflict: 'user_id,book_id' },
    )
    .select('reaction')
    .single();

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }
  return NextResponse.json({
    status: existing ? 'switched' : 'added',
    myReaction: saved?.reaction ?? reaction,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { bookId: string } },
) {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bookId = decodeURIComponent(params.bookId);
  const { error } = await supabase
    .from('book_reactions')
    .delete()
    .eq('user_id', user.id)
    .eq('book_id', bookId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ status: 'removed', myReaction: null });
}
