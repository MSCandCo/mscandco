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
    const { course_id } = body;

    if (!course_id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('learning_courses')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 });
    }

    // Enroll in course
    const { data, error } = await supabase
      .from('learning_courses')
      .insert({
        user_id: user.id,
        course_id,
        status: 'in_progress',
        progress: 0,
        hours_completed: 0,
        enrolled_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error enrolling in course:', error);
      return NextResponse.json({ error: 'Failed to enroll in course' }, { status: 500 });
    }

    // Log activity
    await supabase.from('learning_activity').insert({
      user_id: user.id,
      activity_type: 'course_enrollment',
      activity_date: new Date().toISOString(),
      course_id,
    });

    return NextResponse.json({ success: true, enrollment: data });
  } catch (error) {
    console.error('Error in course enrollment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
