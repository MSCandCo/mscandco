import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mentor_id, topic, preferred_date, preferred_time, duration, notes } = body;

    // Validate required fields
    if (!mentor_id || !topic || !preferred_date || !preferred_time) {
      return NextResponse.json(
        { error: 'Mentor, topic, date, and time are required' },
        { status: 400 }
      );
    }

    // Check mentor availability
    const { data: mentor } = await supabase
      .from('mentors')
      .select('*')
      .eq('id', mentor_id)
      .single();

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    // Book mentorship session
    const { data, error } = await supabase
      .from('mentorship_sessions')
      .insert({
        user_id: user.id,
        mentor_id,
        topic,
        scheduled_date: preferred_date,
        scheduled_time: preferred_time,
        duration: duration || 60,
        notes: notes || null,
        status: 'pending',
        booked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error booking mentorship session:', error);
      return NextResponse.json(
        { error: 'Failed to book mentorship session' },
        { status: 500 }
      );
    }

    // Send notification to mentor (in production)
    // await sendMentorNotification(mentor, data);

    // Log activity
    await supabase.from('learning_activity').insert({
      user_id: user.id,
      activity_type: 'mentorship_booking',
      activity_date: new Date().toISOString(),
      session_id: data.id,
    });

    return NextResponse.json({ success: true, session: data });
  } catch (error) {
    console.error('Error in booking mentorship session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
