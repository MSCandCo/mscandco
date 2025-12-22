import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's learning statistics
    const { data: courses, error: coursesError } = await supabase
      .from('learning_courses')
      .select('*')
      .eq('user_id', user.id);

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return NextResponse.json({ error: 'Failed to fetch learning stats' }, { status: 500 });
    }

    // Calculate statistics
    const stats = {
      total_courses_completed: courses?.filter((c) => c.status === 'completed').length || 0,
      total_hours_learned:
        courses?.reduce((sum, c) => sum + (c.hours_completed || 0), 0) || 0,
      current_skill_level: 'Intermediate', // Calculate based on completed courses
      certificates_earned: courses?.filter((c) => c.certificate_earned).length || 0,
      active_courses: courses?.filter((c) => c.status === 'in_progress').length || 0,
      learning_streak_days: await calculateLearningStreak(supabase, user.id),
    };

    // Fetch skill progress
    const { data: skills, error: skillsError } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', user.id)
      .order('skill_level', { ascending: false });

    if (skillsError) {
      console.error('Error fetching skills:', skillsError);
    }

    return NextResponse.json({ stats, skills: skills || [] });
  } catch (error) {
    console.error('Error in fetching learning stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function calculateLearningStreak(supabase, userId) {
  const { data: activities } = await supabase
    .from('learning_activity')
    .select('activity_date')
    .eq('user_id', userId)
    .order('activity_date', { ascending: false })
    .limit(100);

  if (!activities || activities.length === 0) return 0;

  let streak = 1;
  let currentDate = new Date(activities[0].activity_date);

  for (let i = 1; i < activities.length; i++) {
    const activityDate = new Date(activities[i].activity_date);
    const daysDiff = Math.floor(
      (currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      streak++;
      currentDate = activityDate;
    } else if (daysDiff > 1) {
      break;
    }
  }

  return streak;
}
