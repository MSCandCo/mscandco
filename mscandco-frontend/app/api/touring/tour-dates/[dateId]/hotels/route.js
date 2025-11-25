/**
 * Touring Platform - Hotels API
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET - Get hotels for a tour date
 */
export async function GET(request, { params }) {
  try {
    const { dateId } = params;
    
    const { data: hotels, error } = await supabaseAdmin
      .from('hotels')
      .select('*, hotel_rooms(*)')
      .eq('tour_date_id', dateId)
      .order('check_in', { ascending: true });
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      hotels: hotels || []
    });
    
  } catch (error) {
    console.error('❌ Error fetching hotels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotels', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create hotel booking
 */
export async function POST(request, { params }) {
  try {
    const { dateId } = params;
    const body = await request.json();
    
    const { name, address, city, state_province, country, check_in, check_out, confirmation_number, rate, total_cost, room_count } = body;
    
    if (!name || !city || !country || !check_in || !check_out) {
      return NextResponse.json(
        { error: 'Missing required fields: name, city, country, check_in, check_out' },
        { status: 400 }
      );
    }
    
    const { data: hotel, error } = await supabaseAdmin
      .from('hotels')
      .insert({
        tour_date_id: dateId,
        name,
        address: address || null,
        city,
        state_province: state_province || null,
        country,
        check_in,
        check_out,
        confirmation_number: confirmation_number || null,
        rate: rate || null,
        total_cost: total_cost || null,
        room_count: room_count || null,
        currency: 'USD'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      hotel
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creating hotel:', error);
    return NextResponse.json(
      { error: 'Failed to create hotel booking', details: error.message },
      { status: 500 }
    );
  }
}

