/**
 * Touring Platform - Production Requirements API
 * Manage technical and production requirements for shows
 */

import { NextResponse } from 'next/server';

/**
 * GET - Fetch production requirements for a tour or tour date
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const serverSupabase = await createClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import('@/lib/supabase/server');


    const supabaseAdmin = await createServiceRoleClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tour_id');
    const tourDateId = searchParams.get('tour_date_id');

    let query = supabaseAdmin
      .from('tour_production_requirements')
      .select('*')
      .order('created_at', { ascending: false });

    if (tourId) {
      query = query.eq('tour_id', tourId);
    }

    if (tourDateId) {
      query = query.eq('tour_date_id', tourDateId);
    }

    const { data: requirements, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      requirements: requirements || [],
      count: requirements?.length || 0
    });

  } catch (error) {
    console.error('❌ Error fetching production requirements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch production requirements', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new production requirements
 */
export async function POST(request) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const serverSupabase = await createClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import('@/lib/supabase/server');


    const supabaseAdmin = await createServiceRoleClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const {
      tour_id,
      tour_date_id,
      stage_size,
      stage_height,
      power_requirements,
      lighting_requirements,
      sound_requirements,
      backline_requirements,
      local_crew_needed,
      dressing_rooms_needed,
      green_room_requirements,
      parking_requirements,
      security_requirements,
      catering_requirements,
      merchandise_space,
      wifi_requirements,
      notes
    } = body;

    if (!tour_id) {
      return NextResponse.json(
        { error: 'Missing required field: tour_id' },
        { status: 400 }
      );
    }

    const { data: requirement, error } = await supabaseAdmin
      .from('tour_production_requirements')
      .insert({
        tour_id,
        tour_date_id: tour_date_id || null,
        stage_size: stage_size || null,
        stage_height: stage_height || null,
        power_requirements: power_requirements || null,
        lighting_requirements: lighting_requirements || null,
        sound_requirements: sound_requirements || null,
        backline_requirements: backline_requirements || null,
        local_crew_needed: local_crew_needed || null,
        dressing_rooms_needed: dressing_rooms_needed || null,
        green_room_requirements: green_room_requirements || null,
        parking_requirements: parking_requirements || null,
        security_requirements: security_requirements || null,
        catering_requirements: catering_requirements || null,
        merchandise_space: merchandise_space || null,
        wifi_requirements: wifi_requirements || null,
        notes: notes || null
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      requirement
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating production requirements:', error);
    return NextResponse.json(
      { error: 'Failed to create production requirements', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update production requirements
 */
export async function PATCH(request) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const serverSupabase = await createClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import('@/lib/supabase/server');


    const supabaseAdmin = await createServiceRoleClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Requirements ID is required' }, { status: 400 });
    }

    const { data: requirement, error } = await supabaseAdmin
      .from('tour_production_requirements')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      requirement
    });

  } catch (error) {
    console.error('❌ Error updating production requirements:', error);
    return NextResponse.json(
      { error: 'Failed to update production requirements', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete production requirements
 */
export async function DELETE(request) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const serverSupabase = await createClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import('@/lib/supabase/server');


    const supabaseAdmin = await createServiceRoleClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Requirements ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('tour_production_requirements')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Production requirements deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting production requirements:', error);
    return NextResponse.json(
      { error: 'Failed to delete production requirements', details: error.message },
      { status: 500 }
    );
  }
}
