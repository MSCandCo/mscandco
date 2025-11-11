import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lyrics_id = searchParams.get('lyrics_id');

    if (!lyrics_id) {
      return NextResponse.json({ error: 'lyrics_id is required' }, { status: 400 });
    }

    // Verify ownership
    const { data: lyrics } = await supabase
      .from('lyrics')
      .select('id, created_by')
      .eq('id', lyrics_id)
      .single();

    if (!lyrics || lyrics.created_by !== user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    // Get all suggestions
    const { data: suggestions, error } = await supabase
      .from('lyrics_suggestions')
      .select('*')
      .eq('lyrics_id', lyrics_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error('Get suggestions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { suggestion_id, status } = await request.json();

    if (!suggestion_id || !['accepted', 'rejected', 'applied'].includes(status)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Update suggestion status
    const { data, error } = await supabase
      .from('lyrics_suggestions')
      .update({ status })
      .eq('id', suggestion_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, suggestion: data });

  } catch (error) {
    console.error('Update suggestion error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
