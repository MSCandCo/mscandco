import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { webinar_id } = body;

    if (!webinar_id) {
      return NextResponse.json({ error: 'Webinar ID is required' }, { status: 400 });
    }

    // Check if already registered
    const { data: existing } = await supabase
      .from('webinar_registrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('webinar_id', webinar_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already registered for this webinar' }, { status: 400 });
    }

    // Register for webinar
    const { data, error } = await supabase
      .from('webinar_registrations')
      .insert({
        user_id: user.id,
        webinar_id,
        registered_at: new Date().toISOString(),
        status: 'registered',
      })
      .select()
      .single();

    if (error) {
      console.error('Error registering for webinar:', error);
      return NextResponse.json({ error: 'Failed to register for webinar' }, { status: 500 });
    }

    // Send confirmation email (in production)
    // await sendWebinarConfirmation(user, webinar);

    // Log activity
    await supabase.from('learning_activity').insert({
      user_id: user.id,
      activity_type: 'webinar_registration',
      activity_date: new Date().toISOString(),
      webinar_id,
    });

    return NextResponse.json({ success: true, registration: data });
  } catch (error) {
    console.error('Error in webinar registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
