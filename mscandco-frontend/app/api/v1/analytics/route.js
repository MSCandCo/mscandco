/**
 * Public API: Get Analytics Data
 * 
 * Endpoint: GET /api/v1/analytics
 * Authentication: Bearer token (API key)
 */

import { NextResponse } from 'next/server';
import { withAPIAuth } from '@/lib/api-auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const GET = withAPIAuth(async (request, { userId }) => {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'month';
    const metric = searchParams.get('metric'); // optional: 'streams', 'earnings', 'countries', 'platforms'

    // Get user's analytics data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('analytics_data')
      .eq('id', userId)
      .single();

    const analyticsData = profile?.analytics_data || {};

    // If specific metric requested, return only that
    if (metric && analyticsData[metric]) {
      return NextResponse.json({
        success: true,
        data: {
          metric,
          timeframe,
          value: analyticsData[metric],
        },
      });
    }

    // Return full analytics
    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        total_streams: analyticsData.total_streams || 0,
        total_listeners: analyticsData.total_listeners || 0,
        top_platform: analyticsData.top_platform || 'N/A',
        top_country: analyticsData.top_country || 'N/A',
        top_track: analyticsData.top_track || {},
        platform_breakdown: analyticsData.platform_breakdown || {},
        country_breakdown: analyticsData.country_breakdown || {},
        recent_milestones: analyticsData.recent_milestones || [],
        growth: {
          streams: analyticsData.stream_growth || 0,
          listeners: analyticsData.listener_growth || 0,
        },
      },
    });
  } catch (error) {
    console.error('API v1 analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}, { requiredScopes: ['read'] });

