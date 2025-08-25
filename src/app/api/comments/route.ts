export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { book_isbn, body, parent_id = null } = await req.json();

  try {
    const created = await prisma.comments.create({
      data: {
        user_id: user.id,
        book_isbn,
        parent_id,
        root_id: parent_id ?? user.id, // 임시 값 (root_id null 방지)
        body,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error('insert error', e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
