// Simple Earnings Save API - Similar to Analytics Save
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
      lastUpdated, 
      type 
    } = req.body;

    console.log('Earnings save request:', { 
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

    const currentTimestamp = new Date().toISOString();
    
    // Create earnings history entry with timestamp
    const newEarningsEntry = {
      timestamp: currentTimestamp,
      updatedBy: 'admin',
      type: type || 'manual_earnings',
      data: {}
    };

    // Add the specific data for this entry
    if (basicMetrics) {
      newEarningsEntry.data.basicMetrics = basicMetrics;
    }

    if (advancedMetrics) {
      newEarningsEntry.data.advancedMetrics = advancedMetrics;
    }

    if (platformRevenue) {
      newEarningsEntry.data.platformRevenue = platformRevenue;
    }

    if (territoryRevenue) {
      newEarningsEntry.data.territoryRevenue = territoryRevenue;
    }

    // Maintain earnings history array and current data
    const earningsData = {
      ...existingData,
      lastUpdated: currentTimestamp,
      updatedBy: 'admin',
      type: 'manual_earnings',
      // Current data (latest values for display)
      currentData: newEarningsEntry.data,
      // History array for time-based filtering
      history: [...(existingData.history || []), newEarningsEntry].slice(-50) // Keep last 50 entries
    };

    // Also merge current data into top level for backward compatibility
    Object.assign(earningsData, newEarningsEntry.data);


    // All sections are always visible - no visibility toggles

    console.log('Final earnings data to save:', {
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

      console.log('Earnings data saved successfully for artist:', artistId);

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
