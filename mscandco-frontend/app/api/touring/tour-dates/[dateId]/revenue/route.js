/**
 * Touring Platform - Revenue API
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * GET - Get revenue for a tour date
 */
export async function GET(request, { params }) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { dateId } = params;
    
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabaseAdmin = await createServiceRoleClient();
    
    const { data: revenue, error } = await supabaseAdmin
      .from('tour_revenue')
      .select('*')
      .eq('tour_date_id', dateId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const total = revenue?.reduce((sum, rev) => sum + parseFloat(rev.amount || 0), 0) || 0;
    const bySource = {};
    
    revenue?.forEach(rev => {
      const source = rev.source || 'other';
      bySource[source] = (bySource[source] || 0) + parseFloat(rev.amount || 0);
    });
    
    return NextResponse.json({
      success: true,
      revenue: revenue || [],
      total,
      bySource
    });
    
  } catch (error) {
    console.error('❌ Error fetching revenue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Add revenue
 */
export async function POST(request, { params }) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabaseAdmin = await createServiceRoleClient();

    const { dateId } = params;
    const body = await request.json();
    
    const { source, amount, description, payment_method, reference_number, recorded_by, revolut_order_id } = body;
    
    if (!source || !amount || !recorded_by) {
      return NextResponse.json(
        { error: 'Missing required fields: source, amount, recorded_by' },
        { status: 400 }
      );
    }
    
    // Get tour date info to find the tour and artist
    const { data: tourDate, error: dateError } = await supabaseAdmin
      .from('tour_dates')
      .select(`
        id,
        tour_id,
        date,
        tours (
          id,
          user_id,
          name
        )
      `)
      .eq('id', dateId)
      .single();
    
    if (dateError || !tourDate) {
      return NextResponse.json(
        { error: 'Tour date not found', details: dateError?.message },
        { status: 404 }
      );
    }
    
    const tour = tourDate.tours;
    const artistId = tour?.user_id;
    
    if (!artistId) {
      return NextResponse.json(
        { error: 'Could not determine artist for this tour' },
        { status: 400 }
      );
    }
    
    // Create revenue entry in tour_revenue table
    const { data: revenueItem, error } = await supabaseAdmin
      .from('tour_revenue')
      .insert({
        tour_date_id: dateId,
        source,
        amount: parseFloat(amount),
        description: description || null,
        payment_method: payment_method || null,
        reference_number: reference_number || null,
        recorded_by,
        revolut_order_id: revolut_order_id || null,
        currency: 'GBP' // Changed to GBP to match Revolut default
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Also create an entry in earnings_log so it appears on the earnings page
    const { data: earningsEntry, error: earningsError } = await supabaseAdmin
      .from('earnings_log')
      .insert({
        artist_id: artistId,
        amount: parseFloat(amount),
        currency: 'GBP',
        earning_type: 'touring', // Categorized as touring earnings
        platform: `Tour: ${tour?.name || 'Unknown'}`,
        territory: 'Live Performance',
        status: 'pending', // Tour revenue starts as pending until confirmed
        notes: description || `Tour revenue: ${source}${tourDate.date ? ` (${new Date(tourDate.date).toLocaleDateString()})` : ''}`,
        created_at: new Date().toISOString(),
        created_by: recorded_by
      })
      .select()
      .single();
    
    if (earningsError) {
      console.error('⚠️ Warning: Failed to create earnings_log entry for touring revenue:', earningsError);
      // Don't fail the request, but log the error
      // The revenue is still recorded in tour_revenue
    } else {
      console.log('✅ Created earnings_log entry for touring revenue:', earningsEntry.id);
    }
    
    return NextResponse.json({
      success: true,
      revenue: revenueItem,
      earnings_entry_id: earningsEntry?.id || null
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creating revenue:', error);
    return NextResponse.json(
      { error: 'Failed to create revenue', details: error.message },
      { status: 500 }
    );
  }
}

