/**
 * Touring Platform - Single Tour API
 * Fetch, update, or delete a specific tour
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
 * GET - Fetch a specific tour
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request, { params }) {
  try {
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import('@/lib/supabase/server\');


    const supabaseAdmin = await createServiceRoleClient();;
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { id } = await params;

    const { data: tour, error } = await supabaseAdmin
      .from('tours')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      tour
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
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import('@/lib/supabase/server\');


    const supabaseAdmin = await createServiceRoleClient();;
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { id } = await params;
    const body = await request.json();
    const { ...updates } = body;

    const { data: tour, error } = await supabaseAdmin
      .from('tours')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
      }
      throw error;
    }

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
    const serverSupabase = await createServerClient();
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lazy load Supabase admin client


    const { createServiceRoleClient } = await import('@/lib/supabase/server\');


    const supabaseAdmin = await createServiceRoleClient();;
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('tours')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

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
