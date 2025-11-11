import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');
  const search = searchParams.get('search');

  let query = supabase
    .from('learning_modules')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('module_category', category);
  }

  if (difficulty) {
    query = query.eq('difficulty_level', difficulty);
  }

  if (search) {
    query = query.or(`module_title.ilike.%${search}%,module_description.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    modules: data,
    count: data.length
  });
}
