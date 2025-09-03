import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic'; // 캐시 방지
export const revalidate = 0;

type Reaction = 'like' | 'dislike';
const isReaction = (v: any): v is Reaction => v === 'like' || v === 'dislike';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
) {
  const { bookId } = await params;
  const decoded = decodeURIComponent(bookId);

  const supabase = await supabaseServer();

  // 좋아요 / 싫어요 카운트
  const [likeRes, dislikeRes] = await Promise.all([
    supabase
      .from('book_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', decoded)
      .eq('reaction', 'like'),
    supabase
      .from('book_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', decoded)
      .eq('reaction', 'dislike'),
  ]);
  if (likeRes.error || dislikeRes.error) {
    return NextResponse.json(
      { error: likeRes.error?.message || dislikeRes.error?.message },
      { status: 500 },
    );
  }

  // 내 반응(비로그인 허용)
  let myReaction: 'like' | 'dislike' | null = null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: mine } = await supabase
      .from('book_reactions')
      .select('reaction')
      .eq('book_id', decoded)
      .eq('user_id', user.id)
      .maybeSingle();
    myReaction = (mine?.reaction as any) ?? null;
  }

  return NextResponse.json({
    likes: likeRes.count ?? 0,
    dislikes: dislikeRes.count ?? 0,
    myReaction,
  });
}

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

  const { bookId } = await params;
  const decodedBookId = decodeURIComponent(bookId);
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
    .eq('book_id', decodedBookId)
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
      { user_id: user.id, book_id: decodedBookId, reaction },
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
  { params }: { params: Promise<{ bookId: string }> },
) {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bookId } = await params;
  const decoded = decodeURIComponent(bookId);

  const { error } = await supabase
    .from('book_reactions')
    .delete()
    .eq('user_id', user.id)
    .eq('book_id', decoded);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ status: 'removed', myReaction: null });
}
