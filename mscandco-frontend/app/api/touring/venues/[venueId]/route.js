/**
 * Touring Platform - Single Venue API
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * GET - Get venue details
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
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

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

