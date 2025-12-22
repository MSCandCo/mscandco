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
 * - Label Partner qualification check (daily at 2 AM UTC)
 */

import { NextResponse } from 'next/server';

// Enterprise pattern: Dynamic imports to prevent build-time analysis
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request) {
  try {
    // Enterprise pattern: Lazy load Supabase client at runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
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
      resets: null,
      labelQualification: null
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

    // 3. Label Partner Auto-Qualification (daily at 2 AM UTC)
    if (hour === 2) {
      console.log('👑 Running label Partner qualification check...');
      try {
        // Check all label admins for Partner qualification
        const { data: labels, error: fetchError } = await supabase
          .from('user_profiles')
          .select('id, email, name, label_tier, label_total_earnings, label_total_streams, label_artist_count, label_commissions_paid, label_qualified_for_partner')
          .eq('role', 'label_admin')
          .in('label_tier', ['label_starter', 'label_pro']);

        if (fetchError) throw fetchError;

        const CRITERIA = {
          annual_earnings: 50000,
          total_streams: 500000,
          artist_count: 25,
          commissions_paid: 10000
        };

        let qualified = 0;

        for (const label of labels || []) {
          const meetsEarnings = (label.label_total_earnings || 0) >= CRITERIA.annual_earnings;
          const meetsStreams = (label.label_total_streams || 0) >= CRITERIA.total_streams;
          const meetsArtists = (label.label_artist_count || 0) >= CRITERIA.artist_count;
          const meetsCommissions = (label.label_commissions_paid || 0) >= CRITERIA.commissions_paid;

          if ((meetsEarnings || meetsStreams || meetsArtists || meetsCommissions) && !label.label_qualified_for_partner) {
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({
                label_tier: 'label_partner',
                subscription_tier: 'label_partner',
                label_qualified_for_partner: true,
                label_partner_qualified_at: new Date().toISOString(),
                label_subscription_cancelled_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', label.id);

            if (!updateError) {
              qualified++;
              console.log(`✅ Upgraded ${label.email} to FREE Partner tier`);
            }
          }
        }

        results.labelQualification = {
          success: true,
          message: `Checked ${labels?.length || 0} labels, upgraded ${qualified} to FREE Partner`,
          checked: labels?.length || 0,
          qualified
        };
        console.log(`✅ Label qualification check completed: ${qualified} upgraded`);
      } catch (error) {
        console.error('❌ Label qualification check failed:', error);
        results.labelQualification = {
          success: false,
          error: error.message
        };
      }
    }

    // 4. Counter Resets (monthly on 1st, annual on Jan 1st)
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

