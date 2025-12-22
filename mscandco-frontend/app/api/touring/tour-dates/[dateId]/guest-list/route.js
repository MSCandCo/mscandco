/**
 * Touring Platform - Guest List API
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * GET - Get guest list for a tour date
 */
export async function GET(request, { params }) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { dateId } = params;
    const status = request.nextUrl.searchParams.get('status');
    
    let query = supabaseAdmin
      .from('guest_lists')
      .select('*')
      .eq('tour_date_id', dateId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: guests, error } = await query;
    
    if (error) throw error;
    
    // Get allotments
    const { data: allotments } = await supabaseAdmin
      .from('guest_list_allotments')
      .select('*')
      .eq('tour_date_id', dateId);
    
    return NextResponse.json({
      success: true,
      guests: guests || [],
      allotments: allotments || []
    });
    
  } catch (error) {
    console.error('❌ Error fetching guest list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guest list', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Add guest to list
 */
export async function POST(request, { params }) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { dateId } = params;
    const body = await request.json();
    
    const { requester_id, requester_name, guest_name, guest_email, guest_phone, plus_ones, pass_type, notes } = body;
    
    if (!guest_name || !pass_type) {
      return NextResponse.json(
        { error: 'Missing required fields: guest_name, pass_type' },
        { status: 400 }
      );
    }
    
    // Check allotment limits
    const { data: allotment } = await supabaseAdmin
      .from('guest_list_allotments')
      .select('*')
      .eq('tour_date_id', dateId)
      .eq('pass_type', pass_type)
      .single();
    
    if (allotment && allotment.enforce) {
      const { data: existingGuests } = await supabaseAdmin
        .from('guest_lists')
        .select('total_guests')
        .eq('tour_date_id', dateId)
        .eq('pass_type', pass_type)
        .eq('status', 'approved');
      
      const currentCount = existingGuests?.reduce((sum, g) => sum + (g.total_guests || 1), 0) || 0;
      const requestedCount = 1 + (plus_ones || 0);
      
      if (currentCount + requestedCount > allotment.total_allotment) {
        return NextResponse.json(
          { error: `Guest list limit reached for ${pass_type}. Available: ${allotment.total_allotment - currentCount}` },
          { status: 400 }
        );
      }
    }
    
    const { data: guest, error } = await supabaseAdmin
      .from('guest_lists')
      .insert({
        tour_date_id: dateId,
        requester_id: requester_id || null,
        requester_name: requester_name || null,
        guest_name,
        guest_email: guest_email || null,
        guest_phone: guest_phone || null,
        plus_ones: plus_ones || 0,
        pass_type,
        status: 'pending',
        notes: notes || null
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      guest
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error adding guest:', error);
    return NextResponse.json(
      { error: 'Failed to add guest', details: error.message },
      { status: 500 }
    );
  }
}

