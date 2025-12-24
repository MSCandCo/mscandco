/**
 * Touring Platform - Tour Dates API
 * Fetch dates for a specific tour
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
 * GET - Fetch all dates for a tour
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request, { params }) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const serverSupabase = await createClient();
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

    const { id: tourId } = await params;

    // First verify the tour belongs to the user
    const { data: tour, error: tourError } = await supabaseAdmin
      .from('tours')
      .select('id')
      .eq('id', tourId)
      .eq('user_id', user.id)
      .single();

    if (tourError || !tour) {
      return NextResponse.json({ error: 'Tour not found or access denied' }, { status: 404 });
    }

    const { data: dates, error } = await supabaseAdmin
      .from('tour_dates')
      .select('*')
      .eq('tour_id', tourId)
      .order('date', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      dates: dates || [],
      count: dates?.length || 0
    });

  } catch (error) {
    console.error('❌ Error fetching tour dates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tour dates', details: error.message },
      { status: 500 }
    );
  }
}
