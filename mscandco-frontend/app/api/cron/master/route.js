/**
 * Master Cron Job Handler
 * 
 * Handles all scheduled tasks in a single cron job to stay within Vercel's limit
 * 
 * Schedule: 0 0 * * * (runs daily at midnight UTC)
 * 
 * Tasks:
 * - Daily analytics aggregation
 * - Subscription renewals (every 6 hours, checked daily)
 * - Counter resets (monthly on 1st, annual on Jan 1st)
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

    const now = new Date();
    const hour = now.getHours();
    const date = now.getDate();
    const month = now.getMonth(); // 0-11
    const isFirstOfMonth = date === 1;
    const isJanuary = month === 0;

    console.log('🔄 Master cron job running...', {
      hour,
      date,
      month: month + 1,
      isFirstOfMonth,
      isJanuary
    });

    const results = {
      analytics: null,
      renewals: null,
      resets: null
    };

    // 1. Daily Analytics Aggregation (runs at midnight)
    if (hour === 0) {
      console.log('📊 Running daily analytics aggregation...');
      try {
        // Import and run analytics aggregation
        const { triggerAnalyticsJob } = await import('@/lib/jobs/inngest-client');
        const { query } = await import('@/lib/db/postgres');

        const result = await query(
          `SELECT id FROM user_profiles WHERE role IN ('artist', 'label_admin')`
        );

        const users = result.rows;
        const jobs = users.map(user => 
          triggerAnalyticsJob(user.id, 'daily')
        );

        await Promise.all(jobs);

        results.analytics = {
          success: true,
          message: `Triggered analytics for ${users.length} users`
        };
        console.log(`✅ Analytics aggregation completed for ${users.length} users`);
      } catch (error) {
        console.error('❌ Analytics aggregation failed:', error);
        results.analytics = {
          success: false,
          error: error.message
        };
      }
    }

    // 2. Subscription Renewals (check every 6 hours: 0, 6, 12, 18)
    if (hour % 6 === 0) {
      console.log('💳 Running subscription renewals check...');
      try {
        const { triggerRenewalJob } = await import('@/lib/jobs/inngest-client');
        const { query } = await import('@/lib/db/postgres');

        const result = await query(
          `SELECT id, user_id, plan_name, amount
           FROM subscriptions
           WHERE status = 'active'
           AND next_billing_date <= NOW()
           ORDER BY next_billing_date ASC`
        );

        const subscriptions = result.rows;

        if (subscriptions.length > 0) {
          const jobs = subscriptions.map(sub => 
            triggerRenewalJob(sub.user_id, sub.id)
          );
          await Promise.all(jobs);

          results.renewals = {
            success: true,
            message: `Triggered renewal for ${subscriptions.length} subscriptions`,
            count: subscriptions.length
          };
          console.log(`✅ Triggered renewal for ${subscriptions.length} subscriptions`);
        } else {
          results.renewals = {
            success: true,
            message: 'No subscriptions due for renewal',
            count: 0
          };
        }
      } catch (error) {
        console.error('❌ Subscription renewals failed:', error);
        results.renewals = {
          success: false,
          error: error.message
        };
      }
    }

    // 3. Counter Resets (monthly on 1st, annual on Jan 1st)
    if (isFirstOfMonth) {
      console.log('📅 Running counter resets...');

      // Annual reset (only on January 1st)
      if (isJanuary) {
        try {
          const { data, error } = await supabase.rpc('reset_annual_usage_counters');

          if (error) {
            // Fallback: Manual reset
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({
                releases_this_year: 0,
                tracks_this_year: 0,
                total_earnings_this_year: 0.00,
                upgrade_prompted: false,
                updated_at: new Date().toISOString()
              })
              .neq('tier', 'investment');

            if (updateError) throw updateError;
          }

          results.resets = {
            ...results.resets,
            annual: {
              success: true,
              message: 'Annual counters reset successfully'
            }
          };
          console.log('✅ Annual counters reset successfully');
        } catch (error) {
          console.error('❌ Annual counter reset failed:', error);
          results.resets = {
            ...results.resets,
            annual: {
              success: false,
              error: error.message
            }
          };
        }
      }

      // Monthly Apollo reset (every 1st of month)
      try {
        const { data, error } = await supabase.rpc('reset_monthly_apollo_counters');

        if (error) {
          // Fallback: Manual reset
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              apollo_queries_used_this_month: 0,
              updated_at: new Date().toISOString()
            });

          if (updateError) throw updateError;
        }

        results.resets = {
          ...results.resets,
          monthly: {
            success: true,
            message: 'Monthly Apollo counters reset successfully'
          }
        };
        console.log('✅ Monthly Apollo counters reset successfully');
      } catch (error) {
        console.error('❌ Monthly Apollo counter reset failed:', error);
        results.resets = {
          ...results.resets,
          monthly: {
            success: false,
            error: error.message
          }
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Master cron job completed',
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('❌ Master cron job failed:', error);
    return NextResponse.json(
      {
        error: 'Master cron job failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

