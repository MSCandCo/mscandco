import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * POST /api/grant-features/carbon/calculate
 * Calculate carbon footprint for a release
 */
export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { release_id, period_start, period_end } = body;

    if (!release_id || !period_start || !period_end) {
      return NextResponse.json(
        { error: 'release_id, period_start, and period_end are required' },
        { status: 400 }
      );
    }

    // Verify user owns this release
    const { data: release, error: releaseError } = await supabase
      .from('releases')
      .select('id, user_id, title')
      .eq('id', release_id)
      .single();

    if (releaseError || !release || release.user_id !== user.id) {
      return NextResponse.json({ error: 'Release not found or unauthorized' }, { status: 404 });
    }

    // Get streaming data for the period (mock calculation - integrate with real analytics)
    // In production, query your analytics tables
    const total_streams = 0; // Replace with actual query

    // Industry standard carbon calculation (DIMPACT 2024 methodology)
    // ~0.055 kWh per stream
    // UK grid carbon intensity: ~0.233 kg CO2e per kWh
    const kWh_per_stream = 0.055;
    const carbon_per_kWh = 0.233;
    const streaming_carbon_kg = (total_streams * kWh_per_stream * carbon_per_kWh) / 1000;

    // Calculate other components
    const storage_carbon_kg = total_streams * 0.001; // Rough estimate
    const distribution_carbon_kg = total_streams * 0.002; // Rough estimate
    const total_carbon_kg = streaming_carbon_kg + storage_carbon_kg + distribution_carbon_kg;

    // Create or update carbon tracking record
    const { data: tracking, error: trackingError } = await supabase
      .from('carbon_footprint_tracking')
      .upsert({
        release_id,
        user_id: user.id,
        calculation_period_start: period_start,
        calculation_period_end: period_end,
        total_streams_count: total_streams,
        streaming_hours_total: (total_streams * 3.5) / 60, // Avg 3.5 min per stream
        streaming_carbon_kg,
        storage_carbon_kg,
        distribution_carbon_kg,
        total_carbon_kg,
        carbon_per_stream_g: total_streams > 0 ? (total_carbon_kg * 1000) / total_streams : 0,
        calculation_methodology: 'DIMPACT 2024',
        carbon_intensity_factor: kWh_per_stream,
        grid_carbon_factor: carbon_per_kWh
      }, {
        onConflict: 'release_id,calculation_period_start,calculation_period_end'
      })
      .select()
      .single();

    if (trackingError) {
      console.error('Error creating carbon tracking:', trackingError);
      return NextResponse.json({ error: 'Failed to calculate carbon footprint' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      carbon_tracking: tracking,
      insights: {
        equivalent_to: {
          tree_months_needed: Math.ceil(total_carbon_kg / 21), // 1 tree absorbs ~21kg CO2/year
          miles_driven: Math.round((total_carbon_kg / 0.411) * 0.621371), // Convert to miles
          phone_charges: Math.round(total_carbon_kg / 0.000008) // Phone charge ~8g CO2
        }
      }
    });

  } catch (error) {
    console.error('Carbon calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/grant-features/carbon/calculate?release_id=xxx
 * Get carbon footprint data for a release
 */
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const release_id = searchParams.get('release_id');

    if (!release_id) {
      return NextResponse.json({ error: 'release_id is required' }, { status: 400 });
    }

    const { data: tracking, error } = await supabase
      .from('carbon_footprint_tracking')
      .select('*')
      .eq('release_id', release_id)
      .eq('user_id', user.id)
      .order('calculation_period_end', { ascending: false });

    if (error) {
      console.error('Error fetching carbon data:', error);
      return NextResponse.json({ error: 'Failed to fetch carbon data' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      carbon_data: tracking
    });

  } catch (error) {
    console.error('Carbon fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
