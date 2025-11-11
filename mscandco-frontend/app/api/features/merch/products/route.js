import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// POST: Create new product
export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      name,
      description,
      product_type,
      design_url,
      variants,
      base_cost,
      retail_price,
      release_id,
      provider = 'printful',
    } = await request.json();

    if (!name || !product_type || !retail_price) {
      return NextResponse.json({
        error: 'name, product_type, and retail_price required',
      }, { status: 400 });
    }

    // Calculate profit margin
    const profitMargin = calculateProfitMargin(base_cost || 10, retail_price);

    const { data: product, error: productError } = await supabase
      .from('merchandise_products')
      .insert({
        user_id: user.id,
        release_id,
        name,
        description,
        product_type,
        design_url,
        variants: variants || [],
        base_cost: base_cost || 10,
        retail_price: parseFloat(retail_price),
        profit_margin: profitMargin,
        provider,
        status: 'active',
      })
      .select()
      .single();

    if (productError) throw productError;

    return NextResponse.json({
      success: true,
      product,
      profit_analysis: {
        base_cost: base_cost || 10,
        retail_price: parseFloat(retail_price),
        profit_per_unit: parseFloat(retail_price) - (base_cost || 10),
        profit_margin_percentage: profitMargin,
      },
    });

  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Retrieve products with filtering
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const product_type = searchParams.get('product_type');
    const release_id = searchParams.get('release_id');
    const limit = parseInt(searchParams.get('limit')) || 50;

    let query = supabase
      .from('merchandise_products')
      .select('*, releases(title, cover_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    if (product_type) {
      query = query.eq('product_type', product_type);
    }

    if (release_id) {
      query = query.eq('release_id', release_id);
    }

    const { data: products, error } = await query;

    if (error) throw error;

    // Calculate aggregate stats
    const stats = {
      total_products: products.length,
      total_value: products.reduce((sum, p) => sum + (p.retail_price || 0), 0),
      avg_profit_margin: products.length > 0
        ? products.reduce((sum, p) => sum + (p.profit_margin || 0), 0) / products.length
        : 0,
      by_type: {},
    };

    products.forEach(product => {
      if (!stats.by_type[product.product_type]) {
        stats.by_type[product.product_type] = 0;
      }
      stats.by_type[product.product_type]++;
    });

    return NextResponse.json({
      success: true,
      products,
      stats,
    });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update product
export async function PUT(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      product_id,
      name,
      description,
      retail_price,
      base_cost,
      status,
      variants,
    } = await request.json();

    if (!product_id) {
      return NextResponse.json({ error: 'product_id required' }, { status: 400 });
    }

    const updates = {};

    if (name) updates.name = name;
    if (description) updates.description = description;
    if (retail_price) {
      updates.retail_price = parseFloat(retail_price);
      // Recalculate profit margin if price changed
      if (base_cost) {
        updates.profit_margin = calculateProfitMargin(base_cost, retail_price);
      }
    }
    if (base_cost) {
      updates.base_cost = base_cost;
      if (retail_price) {
        updates.profit_margin = calculateProfitMargin(base_cost, retail_price);
      }
    }
    if (status) updates.status = status;
    if (variants) updates.variants = variants;

    updates.updated_at = new Date().toISOString();

    const { data: product, error } = await supabase
      .from('merchandise_products')
      .update(updates)
      .eq('id', product_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product });

  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove product
export async function DELETE(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json({ error: 'product_id required' }, { status: 400 });
    }

    // Soft delete by setting status to 'archived'
    const { error } = await supabase
      .from('merchandise_products')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', product_id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function calculateProfitMargin(baseCost, retailPrice) {
  if (retailPrice === 0) return 0;
  const profit = retailPrice - baseCost;
  return Math.round((profit / retailPrice) * 100);
}
