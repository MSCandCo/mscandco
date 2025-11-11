import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lyrics_id, updated_lyrics, accepted_suggestions } = await request.json();

    if (!lyrics_id) {
      return NextResponse.json({ error: 'lyrics_id is required' }, { status: 400 });
    }

    // Update lyrics with accepted changes
    if (updated_lyrics) {
      const { error: updateError } = await supabase
        .from('lyrics')
        .update({ lyrics_text: updated_lyrics })
        .eq('id', lyrics_id)
        .eq('created_by', user.id);

      if (updateError) throw updateError;
    }

    // Mark suggestions as applied
    if (accepted_suggestions && accepted_suggestions.length > 0) {
      const { error: suggestionsError } = await supabase
        .from('lyrics_suggestions')
        .update({ status: 'applied' })
        .in('id', accepted_suggestions);

      if (suggestionsError) throw suggestionsError;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Save lyrics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
