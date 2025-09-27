// Artist Earnings Data API - Load Manual Earnings Data
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For now, use hardcoded user ID - in production this would come from auth
    const userId = '0a060de5-1c94-4060-a1c2-860224fc348d'; // Henry Taylor

    console.log('Loading earnings data for user:', userId);

    const { data, error } = await supabase
      .from('user_profiles')
      .select('earnings_data')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error loading earnings data:', error);
      return res.status(500).json({ error: 'Failed to load earnings data' });
    }

    const earningsData = data?.earnings_data || {};

    console.log('Earnings data loaded:', {
      hasBasicMetrics: !!earningsData.basicMetrics,
      hasAdvancedMetrics: !!earningsData.advancedMetrics,
      platformCount: earningsData.platformRevenue?.length || 0,
      territoryCount: earningsData.territoryRevenue?.length || 0,
      lastUpdated: earningsData.lastUpdated
    });

    return res.status(200).json({
      success: true,
      data: earningsData,
      message: 'Earnings data loaded successfully'
    });

  } catch (error) {
    console.error('Earnings data load error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
