import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '20');

  let dbQuery = supabase
    .from('copyright_knowledge_base')
    .select('*')
    .limit(limit);

  if (query) {
    dbQuery = dbQuery.or(`work_title.ilike.%${query}%,work_artist.ilike.%${query}%`);
  }

  const { data, error } = await dbQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    results: data,
    count: data.length
  });
}
