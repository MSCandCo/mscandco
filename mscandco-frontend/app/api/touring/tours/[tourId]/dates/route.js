/**
 * Touring Platform - Tour Dates API
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * GET - Get all dates for a tour
 */
export async function GET(request, { params }) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { tourId } = await params;
    
    const { data: dates, error } = await supabaseAdmin
      .from('tour_dates')
      .select('*, venues(*)')
      .eq('tour_id', tourId)
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      dates: dates || []
    });
    
  } catch (error) {
    console.error('❌ Error fetching tour dates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tour dates', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new tour date
 */
export async function POST(request, { params }) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { tourId } = params;
    const body = await request.json();
    
    const { date, venue_id, city, state_province, country, show_time, doors_time, soundcheck_time, status, capacity, notes } = body;
    
    if (!date || !city || !country) {
      return NextResponse.json(
        { error: 'Missing required fields: date, city, country' },
        { status: 400 }
      );
    }
    
    const { data: tourDate, error } = await supabaseAdmin
      .from('tour_dates')
      .insert({
        tour_id: tourId,
        date,
        venue_id: venue_id || null,
        city,
        state_province: state_province || null,
        country,
        show_time: show_time || null,
        doors_time: doors_time || null,
        soundcheck_time: soundcheck_time || null,
        status: status || 'pending',
        capacity: capacity || null,
        notes: notes || null
      })
      .select('*, venues(*)')
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      date: tourDate
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creating tour date:', error);
    return NextResponse.json(
      { error: 'Failed to create tour date', details: error.message },
      { status: 500 }
    );
  }
}

