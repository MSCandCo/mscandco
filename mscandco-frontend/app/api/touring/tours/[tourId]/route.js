/**
 * Touring Platform - Single Tour API
 * Get, update, delete individual tours
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * GET - Fetch a single tour with all related data
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
    
    if (!tourId) {
      return NextResponse.json(
        { error: 'Tour ID required' },
        { status: 400 }
      );
    }
    
    // Fetch tour
    const { data: tour, error: tourError } = await supabaseAdmin
      .from('tours')
      .select('*')
      .eq('id', tourId)
      .single();
    
    if (tourError) throw tourError;
    if (!tour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }
    
    // Fetch tour dates
    const { data: tourDates } = await supabaseAdmin
      .from('tour_dates')
      .select('*')
      .eq('tour_id', tourId)
      .order('date', { ascending: true });
    
    // Fetch crew
    const { data: crew } = await supabaseAdmin
      .from('tour_crew')
      .select('*')
      .eq('tour_id', tourId)
      .eq('active', true);
    
    return NextResponse.json({
      success: true,
      tour: {
        ...tour,
        tour_dates: tourDates || [],
        crew: crew || []
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching tour:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tour', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update a tour
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

    const { tourId } = await params;
    const body = await request.json();
    
    if (!tourId) {
      return NextResponse.json(
        { error: 'Tour ID required' },
        { status: 400 }
      );
    }
    
    // Remove undefined fields
    const updates = Object.fromEntries(
      Object.entries(body).filter(([_, v]) => v !== undefined)
    );
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    updates.updated_at = new Date().toISOString();
    
    const { data: tour, error } = await supabaseAdmin
      .from('tours')
      .update(updates)
      .eq('id', tourId)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      tour
    });
    
  } catch (error) {
    console.error('❌ Error updating tour:', error);
    return NextResponse.json(
      { error: 'Failed to update tour', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a tour
 */
export async function DELETE(request, { params }) {
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
    
    if (!tourId) {
      return NextResponse.json(
        { error: 'Tour ID required' },
        { status: 400 }
      );
    }
    
    // Delete tour (cascade will delete related records)
    const { error } = await supabaseAdmin
      .from('tours')
      .delete()
      .eq('id', tourId);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: 'Tour deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting tour:', error);
    return NextResponse.json(
      { error: 'Failed to delete tour', details: error.message },
      { status: 500 }
    );
  }
}

