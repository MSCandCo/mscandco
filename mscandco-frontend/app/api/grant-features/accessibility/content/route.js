import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const release_id = searchParams.get('release_id');
  const content_type = searchParams.get('content_type');
  const language_code = searchParams.get('language_code');

  let query = supabase
    .from('accessibility_content')
    .select('*, releases(title, artwork_url)')
    .eq('user_id', user.id);

  if (release_id) {
    query = query.eq('release_id', release_id);
  }

  if (content_type) {
    query = query.eq('content_type', content_type);
  }

  if (language_code) {
    query = query.eq('language_code', language_code);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    content: data,
    count: data.length
  });
}
