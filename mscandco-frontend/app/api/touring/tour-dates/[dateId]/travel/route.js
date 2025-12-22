/**
 * Touring Platform - Travel API
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * GET - Get travel items for a tour date
 */
export async function GET(request, { params }) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { dateId } = params;
    
    const { data: travelItems, error } = await supabaseAdmin
      .from('travel_items')
      .select('*')
      .eq('tour_date_id', dateId)
      .order('departure_time', { ascending: true });
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      travelItems: travelItems || []
    });
    
  } catch (error) {
    console.error('❌ Error fetching travel items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch travel items', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create travel item
 */
export async function POST(request, { params }) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { dateId } = params;
    const body = await request.json();
    
    const { travel_type, departure_location, arrival_location, departure_time, arrival_time, airline, flight_number, transport_company, vehicle_type, confirmation_number, passengers, cost } = body;
    
    if (!travel_type || !departure_location || !arrival_location || !departure_time || !arrival_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const travelData = {
      tour_date_id: dateId,
      travel_type,
      departure_location,
      arrival_location,
      departure_time,
      arrival_time,
      confirmation_number: confirmation_number || null,
      passengers: passengers || [],
      cost: cost || null,
      currency: 'USD'
    };
    
    // Add type-specific fields
    if (travel_type === 'air') {
      travelData.airline = airline || null;
      travelData.flight_number = flight_number || null;
    } else if (travel_type === 'ground') {
      travelData.transport_company = transport_company || null;
      travelData.vehicle_type = vehicle_type || null;
    }
    
    const { data: travelItem, error } = await supabaseAdmin
      .from('travel_items')
      .insert(travelData)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      travelItem
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creating travel item:', error);
    return NextResponse.json(
      { error: 'Failed to create travel item', details: error.message },
      { status: 500 }
    );
  }
}

