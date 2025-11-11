import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { module_id } = body;

  if (!module_id) {
    return NextResponse.json(
      { error: 'Missing required field: module_id' },
      { status: 400 }
    );
  }

  // Check if already enrolled
  const { data: existingEnrollment } = await supabase
    .from('learning_enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('module_id', module_id)
    .single();

  if (existingEnrollment) {
    return NextResponse.json(
      {
        error: 'Already enrolled in this module',
        enrollment: existingEnrollment
      },
      { status: 400 }
    );
  }

  // Create enrollment
  const { data, error } = await supabase
    .from('learning_enrollments')
    .insert([{
      user_id: user.id,
      module_id,
      enrollment_status: 'active',
      progress_percentage: 0,
      enrolled_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    enrollment: data,
    message: 'Successfully enrolled in course'
  });
}
