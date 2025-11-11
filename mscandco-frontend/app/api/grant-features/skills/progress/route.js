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
  const module_id = searchParams.get('module_id');

  let query = supabase
    .from('learning_enrollments')
    .select('*, learning_modules(*)')
    .eq('user_id', user.id);

  if (module_id) {
    query = query.eq('module_id', module_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    enrollments: data,
    count: data.length
  });
}

export async function PUT(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { enrollment_id, progress_percentage, enrollment_status } = body;

  if (!enrollment_id) {
    return NextResponse.json(
      { error: 'Missing required field: enrollment_id' },
      { status: 400 }
    );
  }

  const updateData = {
    updated_at: new Date().toISOString()
  };

  if (progress_percentage !== undefined) {
    updateData.progress_percentage = Math.min(100, Math.max(0, progress_percentage));
  }

  if (enrollment_status) {
    updateData.enrollment_status = enrollment_status;
  }

  // If completed, set completion date
  if (progress_percentage === 100 || enrollment_status === 'completed') {
    updateData.completed_at = new Date().toISOString();
    updateData.enrollment_status = 'completed';
  }

  const { data, error } = await supabase
    .from('learning_enrollments')
    .update(updateData)
    .eq('id', enrollment_id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    enrollment: data,
    message: 'Progress updated successfully'
  });
}
