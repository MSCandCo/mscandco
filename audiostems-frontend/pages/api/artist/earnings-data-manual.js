// Manual Earnings API for Artists - Same concept as Analytics
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user ID from JWT token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    let userInfo;
    try {
      userInfo = jwt.decode(token);
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = userInfo?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    console.log('💰 Loading manual earnings for user:', userId);

    // Fetch earnings data from user_profiles (earnings_data column)
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('earnings_data, first_name, last_name, artist_name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error loading user profile:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to load earnings data' 
      });
    }

    const earningsData = userProfile?.earnings_data;

    // Return empty state if no manual earnings data
    if (!earningsData || earningsData.type !== 'manual_earnings') {
      console.log('📭 No manual earnings data found for user:', userId);
      return res.json({
        success: true,
        data: null,
        message: 'No earnings data available'
      });
    }

    console.log('✅ Manual earnings loaded for:', userProfile?.first_name);

    // Return clean manual earnings data
    return res.json({
      success: true,
      data: {
        basicEarnings: earningsData.basicEarnings || null,
        platformBreakdown: earningsData.platformBreakdown || [],
        monthlyBreakdown: earningsData.monthlyBreakdown || [],
        revenueStreams: earningsData.revenueStreams || [],
        payoutHistory: earningsData.payoutHistory || [],
        sectionVisibility: earningsData.sectionVisibility || {},
        lastUpdated: earningsData.lastUpdated,
        source: 'manual_admin_system'
      }
    });

  } catch (error) {
    console.error('Manual earnings API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
