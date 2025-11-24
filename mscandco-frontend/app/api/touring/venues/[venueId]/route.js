/**
 * Touring Platform - Single Venue API
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET - Get venue details
 */
export async function GET(request, { params }) {
  try {
    const { venueId } = params;
    
    const { data: venue, error } = await supabaseAdmin
      .from('venues')
      .select('*')
      .eq('id', venueId)
      .single();
    
    if (error) throw error;
    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      venue
    });
    
  } catch (error) {
    console.error('❌ Error fetching venue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venue', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update venue
 */
export async function PATCH(request, { params }) {
  try {
    const { venueId } = params;
    const body = await request.json();
    
    const updates = Object.fromEntries(
      Object.entries(body).filter(([_, v]) => v !== undefined)
    );
    
    updates.updated_at = new Date().toISOString();
    
    const { data: venue, error } = await supabaseAdmin
      .from('venues')
      .update(updates)
      .eq('id', venueId)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      venue
    });
    
  } catch (error) {
    console.error('❌ Error updating venue:', error);
    return NextResponse.json(
      { error: 'Failed to update venue', details: error.message },
      { status: 500 }
    );
  }
}

