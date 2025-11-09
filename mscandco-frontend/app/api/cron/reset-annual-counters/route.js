/**
 * Reset Annual Usage Counters Cron Job
 * 
 * Resets releases_this_year, tracks_this_year, and total_earnings_this_year
 * Runs on January 1st at midnight UTC
 * 
 * Schedule: 0 0 1 1 * (cron format)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting annual counter reset...');

    // Call database function to reset annual counters
    const { data, error } = await supabase.rpc('reset_annual_usage_counters');

    if (error) {
      // Fallback: Manual reset if RPC doesn't exist
      console.log('RPC not found, using manual reset...');
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          releases_this_year: 0,
          tracks_this_year: 0,
          total_earnings_this_year: 0.00,
          upgrade_prompted: false,
          updated_at: new Date().toISOString()
        })
        .neq('tier', 'investment'); // Don't reset investment partners

      if (updateError) {
        throw updateError;
      }
    }

    console.log('✅ Annual counters reset successfully');

    return NextResponse.json({
      success: true,
      message: 'Annual usage counters reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Annual counter reset failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset annual counters',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

