/**
 * Public API: Get Earnings Summary
 * 
 * Endpoint: GET /api/v1/earnings
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
    const currency = searchParams.get('currency') || 'GBP';
    const timeframe = searchParams.get('timeframe') || 'month';

    // Get user profile for wallet balance
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('wallet_balance, default_currency')
      .eq('id', userId)
      .single();

    // Get earnings from earnings_log
    let dateFilter = new Date();
    switch (timeframe) {
      case 'week':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case 'month':
        dateFilter.setMonth(dateFilter.getMonth() - 1);
        break;
      case 'quarter':
        dateFilter.setMonth(dateFilter.getMonth() - 3);
        break;
      case 'year':
        dateFilter.setFullYear(dateFilter.getFullYear() - 1);
        break;
      default:
        dateFilter = null;
    }

    let query = supabase
      .from('earnings_log')
      .select('amount, currency, platform, status, created_at')
      .eq('user_id', userId);

    if (dateFilter) {
      query = query.gte('created_at', dateFilter.toISOString());
    }

    const { data: earnings, error } = await query;

    if (error) throw error;

    // Calculate totals
    const totalPaid = earnings
      ?.filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

    const totalPending = earnings
      ?.filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

    // Group by platform
    const platformBreakdown = {};
    earnings?.forEach(e => {
      if (!platformBreakdown[e.platform]) {
        platformBreakdown[e.platform] = { paid: 0, pending: 0 };
      }
      if (e.status === 'paid') {
        platformBreakdown[e.platform].paid += parseFloat(e.amount);
      } else if (e.status === 'pending') {
        platformBreakdown[e.platform].pending += parseFloat(e.amount);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        wallet_balance: profile?.wallet_balance || 0,
        total_paid: totalPaid,
        total_pending: totalPending,
        currency: currency,
        timeframe: timeframe,
        platform_breakdown: platformBreakdown,
        recent_earnings: earnings?.slice(0, 10) || [],
      },
    });
  } catch (error) {
    console.error('API v1 earnings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}, { requiredScopes: ['read'] });

