/**
 * Cron Job: Check Label Partner Qualification
 *
 * Runs daily to check if labels qualify for FREE Partner tier
 * Auto-upgrades qualified labels and cancels paid subscriptions
 *
 * Schedule: Daily at 2:00 AM UTC
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('Unauthorized cron request - invalid secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createRouteHandlerClient(
      { cookies },
      { supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY }
    );

    console.log('Starting label Partner qualification check...');

    // Get all label admins who are not already on Partner or Enterprise tier
    const { data: labels, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, email, name, label_tier, label_total_earnings, label_total_streams, label_artist_count, label_commissions_paid, label_qualified_for_partner')
      .eq('role', 'label_admin')
      .in('label_tier', ['label_starter', 'label_pro']);

    if (fetchError) {
      console.error('Error fetching labels:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${labels.length} labels to check for qualification`);

    // Partner qualification criteria (ANY of these)
    const CRITERIA = {
      annual_earnings: 50000, // £50,000+
      total_streams: 500000, // 500,000+
      artist_count: 25, // 25+ artists
      commissions_paid: 10000 // £10,000+
    };

    const qualified = [];
    const alreadyQualified = [];
    const notYetQualified = [];

    for (const label of labels) {
      // Check if meets ANY qualification criteria
      const meetsEarnings = (label.label_total_earnings || 0) >= CRITERIA.annual_earnings;
      const meetsStreams = (label.label_total_streams || 0) >= CRITERIA.total_streams;
      const meetsArtists = (label.label_artist_count || 0) >= CRITERIA.artist_count;
      const meetsCommissions = (label.label_commissions_paid || 0) >= CRITERIA.commissions_paid;

      const qualifies = meetsEarnings || meetsStreams || meetsArtists || meetsCommissions;

      if (qualifies) {
        if (label.label_qualified_for_partner) {
          // Already marked as qualified (likely auto-upgraded by trigger)
          alreadyQualified.push({
            id: label.id,
            email: label.email,
            name: label.name,
            reason: 'Already qualified'
          });
        } else {
          // Newly qualified - upgrade them!
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              label_tier: 'label_partner',
              subscription_tier: 'label_partner',
              label_qualified_for_partner: true,
              label_partner_qualified_at: new Date().toISOString(),
              label_subscription_cancelled_at: new Date().toISOString(), // Mark for subscription cancellation
              updated_at: new Date().toISOString()
            })
            .eq('id', label.id);

          if (updateError) {
            console.error(`Error upgrading label ${label.id}:`, updateError);
          } else {
            qualified.push({
              id: label.id,
              email: label.email,
              name: label.name,
              previousTier: label.label_tier,
              earnings: label.label_total_earnings,
              streams: label.label_total_streams,
              artists: label.label_artist_count,
              commissions: label.label_commissions_paid,
              qualificationReason: meetsEarnings ? 'Earnings £50K+' :
                                    meetsStreams ? 'Streams 500K+' :
                                    meetsArtists ? 'Artists 25+' :
                                    'Commissions £10K+'
            });

            console.log(`✅ Upgraded ${label.email} to FREE Partner tier (${meetsEarnings ? 'Earnings' : meetsStreams ? 'Streams' : meetsArtists ? 'Artists' : 'Commissions'})`);

            // TODO: Send notification email to label admin
            // TODO: Cancel Stripe subscription if they were on paid plan
          }
        }
      } else {
        notYetQualified.push({
          id: label.id,
          email: label.email,
          name: label.name,
          progress: {
            earnings: `£${(label.label_total_earnings || 0).toLocaleString()}`,
            streams: (label.label_total_streams || 0).toLocaleString(),
            artists: label.label_artist_count || 0,
            commissions: `£${(label.label_commissions_paid || 0).toLocaleString()}`
          }
        });
      }
    }

    const summary = {
      totalChecked: labels.length,
      newlyQualified: qualified.length,
      alreadyQualified: alreadyQualified.length,
      notYetQualified: notYetQualified.length,
      timestamp: new Date().toISOString()
    };

    console.log('Label Partner qualification check complete:', summary);

    return NextResponse.json({
      success: true,
      summary,
      qualified: qualified.map(q => ({
        email: q.email,
        name: q.name,
        reason: q.qualificationReason
      })),
      alreadyQualified: alreadyQualified.length,
      notYetQualified: notYetQualified.length
    });

  } catch (error) {
    console.error('Error in label qualification cron:', error);
    return NextResponse.json(
      { error: 'Failed to check label qualifications', details: error.message },
      { status: 500 }
    );
  }
}
