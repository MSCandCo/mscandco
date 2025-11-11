import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category');
  const access_level = searchParams.get('access_level') || 'public';

  let query = supabase
    .from('research_datasets')
    .select('*')
    .eq('access_level', access_level)
    .order('published_at', { ascending: false });

  if (category) {
    query = query.eq('dataset_category', category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    datasets: data,
    count: data.length
  });
}
