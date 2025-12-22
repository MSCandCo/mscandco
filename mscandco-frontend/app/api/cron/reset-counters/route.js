/**
 * Reset Usage Counters Cron Job
 * 
 * Handles both annual and monthly counter resets:
 * - Annual reset: January 1st at midnight UTC (releases, tracks, earnings)
 * - Monthly reset: 1st of each month at midnight UTC (Apollo queries)
 * 
 * Schedule: 0 0 1 * * (runs on 1st of every month)
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


export async function GET(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const isJanuary = now.getMonth() === 0; // January is month 0
    const isFirstOfMonth = now.getDate() === 1;

    console.log('🔄 Starting counter reset...', {
      isJanuary,
      isFirstOfMonth,
      month: now.getMonth() + 1,
      date: now.getDate()
    });

    const results = {
      annual: null,
      monthly: null
    };

    // Annual reset (only on January 1st)
    if (isJanuary && isFirstOfMonth) {
      console.log('📅 Running annual counter reset...');
      
      try {
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

        results.annual = {
          success: true,
          message: 'Annual counters reset successfully'
        };
        console.log('✅ Annual counters reset successfully');
      } catch (error) {
        console.error('❌ Annual counter reset failed:', error);
        results.annual = {
          success: false,
          error: error.message
        };
      }
    }

    // Monthly reset (every 1st of month)
    if (isFirstOfMonth) {
      console.log('📅 Running monthly Apollo counter reset...');
      
      try {
        const { data, error } = await supabase.rpc('reset_monthly_apollo_counters');

        if (error) {
          // Fallback: Manual reset if RPC doesn't exist
          console.log('RPC not found, using manual reset...');
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              apollo_queries_used_this_month: 0,
              updated_at: new Date().toISOString()
            });

          if (updateError) {
            throw updateError;
          }
        }

        results.monthly = {
          success: true,
          message: 'Monthly Apollo counters reset successfully'
        };
        console.log('✅ Monthly Apollo counters reset successfully');
      } catch (error) {
        console.error('❌ Monthly Apollo counter reset failed:', error);
        results.monthly = {
          success: false,
          error: error.message
        };
      }
    }

    // If neither reset ran, return info message
    if (!isFirstOfMonth) {
      return NextResponse.json({
        success: true,
        message: 'Not the 1st of the month - no resets needed',
        timestamp: now.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Counter resets completed',
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('❌ Counter reset failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset counters',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

