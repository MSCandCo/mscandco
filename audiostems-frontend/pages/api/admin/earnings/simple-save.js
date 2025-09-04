// Simple Earnings Save API - Similar to Analytics Save
import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      artistId, 
      basicMetrics, 
      advancedMetrics, 
      platformRevenue, 
      territoryRevenue, 
      dateRange, 
      sectionVisibility, 
      lastUpdated, 
      type 
    } = req.body;

    console.log('💰 Earnings save request:', { 
      artistId, 
      type, 
      hasBasicMetrics: !!basicMetrics,
      hasPlatformRevenue: !!platformRevenue,
      hasTerritoryRevenue: !!territoryRevenue
    });

    if (!artistId) {
      return res.status(400).json({ error: 'Artist ID is required' });
    }

    // Get existing earnings data first to merge
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('earnings_data')
      .eq('id', artistId)
      .single();

    if (fetchError) {
      console.error('Error fetching existing earnings data:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch existing data' });
    }

    const existingData = existingProfile?.earnings_data || {};

    // Merge earnings data
    const earningsData = {
      ...existingData,
      lastUpdated: lastUpdated || new Date().toISOString(),
      updatedBy: 'admin',
      type: 'manual_earnings'
    };

    // Update basic data if provided
    if (basicMetrics) {
      earningsData.basicMetrics = basicMetrics;
    }

    // Update advanced data if provided
    if (advancedMetrics) {
      earningsData.advancedMetrics = advancedMetrics;
    }

    if (platformRevenue) {
      earningsData.platformRevenue = platformRevenue;
    }

    if (territoryRevenue) {
      earningsData.territoryRevenue = territoryRevenue;
    }

    if (dateRange) {
      earningsData.dateRange = dateRange;
    }

    // Update visibility settings if provided
    if (sectionVisibility) {
      earningsData.sectionVisibility = sectionVisibility;
    }

    console.log('💾 Final earnings data to save:', {
      artistId,
      dataKeys: Object.keys(earningsData),
      platformCount: earningsData.platformRevenue?.length || 0,
      territoryCount: earningsData.territoryRevenue?.length || 0
    });

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
      console.error('Error saving earnings data:', error);
      return res.status(500).json({ error: 'Failed to save earnings data' });
    }

    console.log('✅ Earnings data saved successfully for artist:', artistId);

    return res.status(200).json({
      success: true,
      message: `${type === 'basic' ? 'Basic' : 'Advanced'} earnings data saved successfully`,
      data: updated[0]
    });

  } catch (error) {
    console.error('Earnings save error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
