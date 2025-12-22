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
    const supabase = await createServiceRoleClient();

    const { dateId } = params;
    const body = await request.json();
    
    const { source, amount, description, payment_method, reference_number, recorded_by, revolut_order_id } = body;
    
    if (!source || !amount || !recorded_by) {
      return NextResponse.json(
        { error: 'Missing required fields: source, amount, recorded_by' },
        { status: 400 }
      );
    }
    
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
    
    return NextResponse.json({
      success: true,
      revenue: revenueItem
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creating revenue:', error);
    return NextResponse.json(
      { error: 'Failed to create revenue', details: error.message },
      { status: 500 }
    );
  }
}

