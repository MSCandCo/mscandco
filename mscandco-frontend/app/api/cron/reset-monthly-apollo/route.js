/**
 * Reset Monthly Apollo Counters Cron Job
 * 
 * Resets apollo_queries_used_this_month for all users
 * Runs on the 1st of each month at midnight UTC
 * 
 * Schedule: 0 0 1 * * (cron format)
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

    console.log('🔄 Starting monthly Apollo counter reset...');

    // Call database function to reset monthly Apollo counters
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

    console.log('✅ Monthly Apollo counters reset successfully');

    return NextResponse.json({
      success: true,
      message: 'Monthly Apollo counters reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Monthly Apollo counter reset failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset monthly Apollo counters',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

