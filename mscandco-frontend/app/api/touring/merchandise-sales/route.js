/**
 * Touring Platform - Merchandise Sales API
 * Track daily merchandise sales per show
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    }
  );
}

/**
 * GET - Fetch merchandise sales for a tour date or merchandise item
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import('@/lib/supabase/server');


    const supabaseAdmin = await createServiceRoleClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const tourDateId = searchParams.get('tour_date_id');
    const merchandiseId = searchParams.get('merchandise_id');
    const paymentMethod = searchParams.get('payment_method');

    let query = supabaseAdmin
      .from('tour_merchandise_sales')
      .select('*, merchandise:tour_merchandise(product_name, product_type, size, color)')
      .order('created_at', { ascending: false });

    if (tourDateId) {
      query = query.eq('tour_date_id', tourDateId);
    }

    if (merchandiseId) {
      query = query.eq('merchandise_id', merchandiseId);
    }

    if (paymentMethod) {
      query = query.eq('payment_method', paymentMethod);
    }

    const { data: sales, error } = await query;

    if (error) throw error;

    // Calculate totals
    const totalRevenue = sales?.reduce((sum, sale) => sum + (parseFloat(sale.total_amount) || 0), 0) || 0;
    const totalItems = sales?.reduce((sum, sale) => sum + (sale.quantity_sold || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      sales: sales || [],
      count: sales?.length || 0,
      summary: {
        totalRevenue,
        totalItems,
        averagePrice: totalItems > 0 ? totalRevenue / totalItems : 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching merchandise sales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch merchandise sales', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Record a merchandise sale
 */
export async function POST(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import('@/lib/supabase/server');


    const supabaseAdmin = await createServiceRoleClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const {
      tour_date_id,
      merchandise_id,
      quantity_sold,
      unit_price,
      payment_method,
      notes
    } = body;

    if (!tour_date_id || !merchandise_id || !quantity_sold || !unit_price) {
      return NextResponse.json(
        { error: 'Missing required fields: tour_date_id, merchandise_id, quantity_sold, unit_price' },
        { status: 400 }
      );
    }

    // Record the sale
    const { data: sale, error: saleError } = await supabaseAdmin
      .from('tour_merchandise_sales')
      .insert({
        tour_date_id,
        merchandise_id,
        quantity_sold,
        unit_price,
        payment_method: payment_method || null,
        notes: notes || null
      })
      .select('*, merchandise:tour_merchandise(product_name, product_type, size, color)')
      .single();

    if (saleError) throw saleError;

    // Update merchandise inventory and sold count
    const { data: merchandise, error: merchError } = await supabaseAdmin
      .from('tour_merchandise')
      .select('current_inventory, sold')
      .eq('id', merchandise_id)
      .single();

    if (!merchError && merchandise) {
      await supabaseAdmin
        .from('tour_merchandise')
        .update({
          current_inventory: merchandise.current_inventory - quantity_sold,
          sold: merchandise.sold + quantity_sold,
          updated_at: new Date().toISOString()
        })
        .eq('id', merchandise_id);
    }

    return NextResponse.json({
      success: true,
      sale
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error recording merchandise sale:', error);
    return NextResponse.json(
      { error: 'Failed to record merchandise sale', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update a merchandise sale
 */
export async function PATCH(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import('@/lib/supabase/server');


    const supabaseAdmin = await createServiceRoleClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Sale ID is required' }, { status: 400 });
    }

    // Get the original sale to calculate inventory adjustment
    const { data: originalSale } = await supabaseAdmin
      .from('tour_merchandise_sales')
      .select('merchandise_id, quantity_sold')
      .eq('id', id)
      .single();

    // Update the sale
    const { data: sale, error } = await supabaseAdmin
      .from('tour_merchandise_sales')
      .update(updates)
      .eq('id', id)
      .select('*, merchandise:tour_merchandise(product_name, product_type, size, color)')
      .single();

    if (error) throw error;

    // If quantity changed, adjust inventory
    if (originalSale && updates.quantity_sold !== undefined) {
      const quantityDiff = updates.quantity_sold - originalSale.quantity_sold;

      const { data: merchandise } = await supabaseAdmin
        .from('tour_merchandise')
        .select('current_inventory, sold')
        .eq('id', originalSale.merchandise_id)
        .single();

      if (merchandise) {
        await supabaseAdmin
          .from('tour_merchandise')
          .update({
            current_inventory: merchandise.current_inventory - quantityDiff,
            sold: merchandise.sold + quantityDiff,
            updated_at: new Date().toISOString()
          })
          .eq('id', originalSale.merchandise_id);
      }
    }

    return NextResponse.json({
      success: true,
      sale
    });

  } catch (error) {
    console.error('❌ Error updating merchandise sale:', error);
    return NextResponse.json(
      { error: 'Failed to update merchandise sale', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a merchandise sale
 */
export async function DELETE(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import('@/lib/supabase/server');


    const supabaseAdmin = await createServiceRoleClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Sale ID is required' }, { status: 400 });
    }

    // Get the sale to restore inventory
    const { data: sale } = await supabaseAdmin
      .from('tour_merchandise_sales')
      .select('merchandise_id, quantity_sold')
      .eq('id', id)
      .single();

    // Delete the sale
    const { error } = await supabaseAdmin
      .from('tour_merchandise_sales')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Restore inventory
    if (sale) {
      const { data: merchandise } = await supabaseAdmin
        .from('tour_merchandise')
        .select('current_inventory, sold')
        .eq('id', sale.merchandise_id)
        .single();

      if (merchandise) {
        await supabaseAdmin
          .from('tour_merchandise')
          .update({
            current_inventory: merchandise.current_inventory + sale.quantity_sold,
            sold: merchandise.sold - sale.quantity_sold,
            updated_at: new Date().toISOString()
          })
          .eq('id', sale.merchandise_id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Merchandise sale deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting merchandise sale:', error);
    return NextResponse.json(
      { error: 'Failed to delete merchandise sale', details: error.message },
      { status: 500 }
    );
  }
}
