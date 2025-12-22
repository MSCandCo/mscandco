/**
 * Touring Platform - Day Sheets API
 * Manage daily schedules with call times and activities
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    }
  );
}

/**
 * GET - Fetch day sheets for a tour date
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    const serverSupabase = await createServerClient();
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
    const tourDateId = searchParams.get('tour_date_id');
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('tour_day_sheets')
      .select('*, tour_dates!inner(*)');

    if (tourDateId) {
      query = query.eq('tour_date_id', tourDateId);
    }

    if (date) {
      query = query.eq('date', date);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('date', { ascending: true });

    const { data: daySheets, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      daySheets: daySheets || [],
      count: daySheets?.length || 0
    });

  } catch (error) {
    console.error('❌ Error fetching day sheets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch day sheets', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new day sheet
 */
export async function POST(request) {
  try {
    const serverSupabase = await createServerClient();
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
      tour_date_id,
      date,
      crew_call,
      load_in,
      soundcheck,
      doors_time,
      show_time,
      curfew,
      load_out,
      schedule,
      weather,
      venue_notes,
      catering_notes,
      special_instructions,
      emergency_info,
      status
    } = body;

    if (!tour_date_id || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: tour_date_id, date' },
        { status: 400 }
      );
    }

    const { data: daySheet, error } = await supabaseAdmin
      .from('tour_day_sheets')
      .insert({
        tour_date_id,
        date,
        crew_call: crew_call || null,
        load_in: load_in || null,
        soundcheck: soundcheck || null,
        doors_time: doors_time || null,
        show_time: show_time || null,
        curfew: curfew || null,
        load_out: load_out || null,
        schedule: schedule || [],
        weather: weather || null,
        venue_notes: venue_notes || null,
        catering_notes: catering_notes || null,
        special_instructions: special_instructions || null,
        emergency_info: emergency_info || null,
        status: status || 'draft'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      daySheet
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating day sheet:', error);
    return NextResponse.json(
      { error: 'Failed to create day sheet', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update a day sheet
 */
export async function PATCH(request) {
  try {
    const serverSupabase = await createServerClient();
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
    const { id, publish, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Day sheet ID is required' }, { status: 400 });
    }

    // Handle publishing
    if (publish) {
      updates.status = 'published';
      updates.published_at = new Date().toISOString();
      updates.published_by = user.id;
    }

    const { data: daySheet, error } = await supabaseAdmin
      .from('tour_day_sheets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      daySheet
    });

  } catch (error) {
    console.error('❌ Error updating day sheet:', error);
    return NextResponse.json(
      { error: 'Failed to update day sheet', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a day sheet
 */
export async function DELETE(request) {
  try {
    const serverSupabase = await createServerClient();
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
      return NextResponse.json({ error: 'Day sheet ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('tour_day_sheets')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Day sheet deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting day sheet:', error);
    return NextResponse.json(
      { error: 'Failed to delete day sheet', details: error.message },
      { status: 500 }
    );
  }
}
