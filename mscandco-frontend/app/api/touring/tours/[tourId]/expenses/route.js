/**
 * Touring Platform - Expenses API
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * GET - Get expenses for a tour
 */
export async function GET(request, { params }) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { tourId } = params;
    const tourDateId = request.nextUrl.searchParams.get('tourDateId');
    
    let query = supabaseAdmin
      .from('tour_expenses')
      .select('*')
      .eq('tour_id', tourId)
      .order('date', { ascending: false });
    
    if (tourDateId) {
      query = query.eq('tour_date_id', tourDateId);
    }
    
    const { data: expenses, error } = await query;
    
    if (error) throw error;
    
    // Calculate totals
    const total = expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0) || 0;
    const byCategory = {};
    
    expenses?.forEach(exp => {
      const cat = exp.category || 'other';
      byCategory[cat] = (byCategory[cat] || 0) + parseFloat(exp.amount || 0);
    });
    
    return NextResponse.json({
      success: true,
      expenses: expenses || [],
      total,
      byCategory
    });
    
  } catch (error) {
    console.error('❌ Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create expense
 */
export async function POST(request, { params }) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { tourId } = params;
    const body = await request.json();
    
    const { tour_date_id, category, amount, description, date, vendor, payment_method, submitted_by, revolut_order_id } = body;
    
    if (!category || !amount || !description || !date || !submitted_by) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const { data: expense, error } = await supabaseAdmin
      .from('tour_expenses')
      .insert({
        tour_id: tourId,
        tour_date_id: tour_date_id || null,
        category,
        amount: parseFloat(amount),
        description,
        date,
        vendor: vendor || null,
        payment_method: payment_method || null,
        submitted_by,
        revolut_order_id: revolut_order_id || null,
        status: 'pending',
        currency: 'GBP' // Changed to GBP to match Revolut default
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      expense
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense', details: error.message },
      { status: 500 }
    );
  }
}

