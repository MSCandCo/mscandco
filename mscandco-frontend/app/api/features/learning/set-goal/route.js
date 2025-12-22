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

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { primary_goal, target_skills, time_commitment, budget, timeline } = body;

    // Validate required fields
    if (!primary_goal || !time_commitment || !budget || !timeline) {
      return NextResponse.json(
        { error: 'All goal fields are required' },
        { status: 400 }
      );
    }

    // Check if user already has an active goal
    const { data: existingGoal } = await supabase
      .from('learning_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingGoal) {
      // Update existing goal
      const { data, error } = await supabase
        .from('learning_goals')
        .update({
          primary_goal,
          target_skills: target_skills || [],
          time_commitment,
          budget,
          timeline,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingGoal.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating learning goal:', error);
        return NextResponse.json({ error: 'Failed to update learning goal' }, { status: 500 });
      }

      return NextResponse.json({ success: true, goal: data });
    } else {
      // Create new goal
      const { data, error } = await supabase
        .from('learning_goals')
        .insert({
          user_id: user.id,
          primary_goal,
          target_skills: target_skills || [],
          time_commitment,
          budget,
          timeline,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating learning goal:', error);
        return NextResponse.json({ error: 'Failed to create learning goal' }, { status: 500 });
      }

      // Generate recommended courses based on goal
      // In production, use ML to recommend relevant courses
      // await generateCourseRecommendations(user.id, data);

      return NextResponse.json({ success: true, goal: data });
    }
  } catch (error) {
    console.error('Error in setting learning goal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
