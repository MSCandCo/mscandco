import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get or create skill profile
  let { data: profile, error } = await supabase
    .from('user_skill_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code === 'PGRST116') {
    // Profile doesn't exist, create it
    const { data: newProfile, error: createError } = await supabase
      .from('user_skill_profiles')
      .insert([{
        user_id: user.id,
        total_modules_completed: 0,
        total_certificates_earned: 0,
        total_learning_hours: 0,
        skill_level: 'beginner'
      }])
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    profile = newProfile;
  } else if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Get enrollments summary
  const { data: enrollments } = await supabase
    .from('learning_enrollments')
    .select('enrollment_status')
    .eq('user_id', user.id);

  const activeEnrollments = enrollments?.filter(e => e.enrollment_status === 'active').length || 0;
  const completedEnrollments = enrollments?.filter(e => e.enrollment_status === 'completed').length || 0;

  // Get certificates
  const { data: certificates } = await supabase
    .from('learning_certificates')
    .select('id')
    .eq('user_id', user.id);

  const certificatesCount = certificates?.length || 0;

  return NextResponse.json({
    success: true,
    profile: {
      ...profile,
      active_enrollments: activeEnrollments,
      completed_modules: completedEnrollments,
      certificates_earned: certificatesCount
    }
  });
}

export async function PUT(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const allowedFields = [
    'preferred_learning_style',
    'learning_goals',
    'skill_level',
    'total_learning_hours'
  ];

  // Filter to only allowed fields
  const updateData = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  updateData.updated_at = new Date().toISOString();

  const { data: profile, error } = await supabase
    .from('user_skill_profiles')
    .update(updateData)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    profile,
    message: 'Skill profile updated successfully'
  });
}
