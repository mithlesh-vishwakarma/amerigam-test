import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export const runtime = 'nodejs';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('posts').select('*, profiles!posts_author_id_fkey(*)').eq('id', id).single();
    if (error) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    return NextResponse.json({ post: data });
  } catch { return NextResponse.json({ error: 'Post not found.' }, { status: 404 }); }
}
