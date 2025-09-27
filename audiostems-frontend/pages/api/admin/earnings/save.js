// Manual Earnings Save API - Same concept as Analytics
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get auth token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Decode JWT to get user info
    let userInfo;
    try {
      userInfo = jwt.decode(token);
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userEmail = userInfo?.email?.toLowerCase() || '';
    const userRole = userInfo?.user_metadata?.role;

    // Check if user is admin
    const isAdmin = (
      userRole === 'company_admin' || 
      userRole === 'super_admin' ||
      userEmail === 'companyadmin@mscandco.com' ||
      userEmail === 'superadmin@mscandco.com'
    );

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log('💰 Admin earnings save operation authorized');

    const { 
      artistId, 
      basicEarnings, 
      platformBreakdown, 
      monthlyBreakdown, 
      revenueStreams, 
      payoutHistory,
      projectedEarnings,
      taxSummary,
      royaltyRates,
      type 
    } = req.body;

    if (!artistId) {
      return res.status(400).json({ error: 'Artist ID is required' });
    }

    console.log('💾 Earnings save request:', {
      artistId,
      type,
      basicEarnings,
      platformBreakdown: platformBreakdown?.length || 0,
      monthlyBreakdown: monthlyBreakdown?.length || 0,
      revenueStreams: revenueStreams?.length || 0,
      payoutHistory: payoutHistory?.length || 0,
    });

    // Get existing earnings data
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('earnings_data')
      .eq('id', artistId)
      .single();

    // Initialize or update earnings data
    let earningsData = existingProfile?.earnings_data || {
      type: 'manual_earnings',
      updatedBy: 'admin'
    };

    // Update basic earnings - convert empty strings to "0"
    if (basicEarnings) {
      earningsData.basicEarnings = {
        ...basicEarnings,
        totalEarnings: basicEarnings.totalEarnings || '0',
        currentMonth: basicEarnings.currentMonth || '0',
        lastMonth: basicEarnings.lastMonth || '0'
      };
    }

    // Update advanced data if provided - convert empty strings to "0"
    if (platformBreakdown) {
      earningsData.platformBreakdown = platformBreakdown.map(platform => ({
        ...platform,
        earnings: platform.earnings || '0',
        percentage: platform.percentage || '0',
        streams: platform.streams || '0'
      }));
    }
    if (monthlyBreakdown) {
      earningsData.monthlyBreakdown = monthlyBreakdown.map(month => ({
        ...month,
        earnings: month.earnings || '0',
        growth: month.growth || '0'
      }));
    }
    if (revenueStreams) {
      earningsData.revenueStreams = revenueStreams.map(stream => ({
        ...stream,
        amount: stream.amount || '0',
        percentage: stream.percentage || '0'
      }));
    }
    if (payoutHistory) {
      earningsData.payoutHistory = payoutHistory.map(payout => ({
        ...payout,
        amount: payout.amount || '0'
      }));
    }
    if (projectedEarnings) {
      earningsData.projectedEarnings = {
        nextMonth: projectedEarnings.nextMonth || '0',
        yearEnd: projectedEarnings.yearEnd || '0'
      };
    }
    if (taxSummary) {
      earningsData.taxSummary = {
        taxWithheld: taxSummary.taxWithheld || '0',
        netEarnings: taxSummary.netEarnings || '0'
      };
    }
    if (royaltyRates) {
      earningsData.royaltyRates = {
        streamingRate: royaltyRates.streamingRate || '70',
        performanceRate: royaltyRates.performanceRate || '85',
        syncRate: royaltyRates.syncRate || '90'
      };
    }

    // Set all sections to be visible by default
    earningsData.sectionVisibility = {
      totalEarnings: true,
      platformBreakdown: true,
      monthlyBreakdown: true,
      revenueStreams: true,
      payoutHistory: true,
      projectedEarnings: true,
      taxSummary: true,
      royaltyRates: true
    };

    // Update timestamp
    earningsData.lastUpdated = new Date().toISOString();

    console.log('📦 Final earnings data to save:', earningsData);

    // Save to database
    const { data: updated, error } = await supabase
      .from('user_profiles')
      .update({ 
        earnings_data: earningsData,
        updated_at: new Date().toISOString()
      })
      .eq('id', artistId)
      .select();

    if (error) {
      console.error('❌ Save error:', error);
      return res.status(500).json({ error: 'Failed to save earnings', details: error.message });
    }

    console.log('✅ Earnings saved to user_profiles:', updated?.[0]?.id);

    return res.status(200).json({
      success: true,
      message: 'Earnings saved successfully',
      data: updated?.[0]
    });

  } catch (error) {
    console.error('Earnings save error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
