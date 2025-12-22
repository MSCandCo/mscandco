/**
 * Touring Platform - Itinerary API
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * GET - Get itinerary for a tour date
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

    const { dateId } = params;
    
    const { data: items, error } = await supabaseAdmin
      .from('itinerary_items')
      .select('*')
      .eq('tour_date_id', dateId)
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      items: items || []
    });
    
  } catch (error) {
    console.error('❌ Error fetching itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch itinerary', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Add itinerary item
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

    const { dateId } = params;
    const body = await request.json();
    
    const { item_type, title, start_time, end_time, location, address, description, participants, reminder_minutes, notes } = body;
    
    if (!item_type || !title || !start_time) {
      return NextResponse.json(
        { error: 'Missing required fields: item_type, title, start_time' },
        { status: 400 }
      );
    }
    
    const { data: item, error } = await supabaseAdmin
      .from('itinerary_items')
      .insert({
        tour_date_id: dateId,
        item_type,
        title,
        start_time,
        end_time: end_time || null,
        location: location || null,
        address: address || null,
        description: description || null,
        participants: participants || [],
        reminder_minutes: reminder_minutes || null,
        notes: notes || null,
        status: 'scheduled'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      item
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creating itinerary item:', error);
    return NextResponse.json(
      { error: 'Failed to create itinerary item', details: error.message },
      { status: 500 }
    );
  }
}

