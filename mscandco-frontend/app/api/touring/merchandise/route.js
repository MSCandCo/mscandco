/**
 * Touring Platform - Merchandise API
 * Manage tour merchandise inventory
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

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
 * GET - Fetch merchandise for a tour
 */
export async function GET(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tour_id');
    const productType = searchParams.get('type');
    const lowStock = searchParams.get('low_stock') === 'true';

    if (!tourId) {
      return NextResponse.json({ error: 'tour_id is required' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('tour_merchandise')
      .select('*')
      .eq('tour_id', tourId)
      .order('product_name', { ascending: true });

    if (productType) {
      query = query.eq('product_type', productType);
    }

    if (lowStock) {
      // Consider low stock as less than 10 items
      query = query.lt('current_inventory', 10);
    }

    const { data: merchandise, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      merchandise: merchandise || [],
      count: merchandise?.length || 0
    });

  } catch (error) {
    console.error('❌ Error fetching merchandise:', error);
    return NextResponse.json(
      { error: 'Failed to fetch merchandise', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new merchandise item
 */
export async function POST(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const {
      tour_id,
      product_name,
      product_type,
      size,
      color,
      price,
      cost,
      starting_inventory,
      current_inventory
    } = body;

    if (!tour_id || !product_name) {
      return NextResponse.json(
        { error: 'Missing required fields: tour_id, product_name' },
        { status: 400 }
      );
    }

    const { data: item, error } = await supabaseAdmin
      .from('tour_merchandise')
      .insert({
        tour_id,
        product_name,
        product_type: product_type || null,
        size: size || null,
        color: color || null,
        price: price || null,
        cost: cost || null,
        starting_inventory: starting_inventory || 0,
        current_inventory: current_inventory !== undefined ? current_inventory : starting_inventory || 0,
        sold: 0
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      item
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating merchandise:', error);
    return NextResponse.json(
      { error: 'Failed to create merchandise', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update merchandise item
 */
export async function PATCH(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Merchandise ID is required' }, { status: 400 });
    }

    const { data: item, error } = await supabaseAdmin
      .from('tour_merchandise')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      item
    });

  } catch (error) {
    console.error('❌ Error updating merchandise:', error);
    return NextResponse.json(
      { error: 'Failed to update merchandise', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete merchandise item
 */
export async function DELETE(request) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Merchandise ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('tour_merchandise')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Merchandise deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting merchandise:', error);
    return NextResponse.json(
      { error: 'Failed to delete merchandise', details: error.message },
      { status: 500 }
    );
  }
}
