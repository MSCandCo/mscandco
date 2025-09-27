// Clean Manual Analytics API - NO CHARTMETRICS
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

    console.log('📊 Loading manual analytics for user:', userId);

    // Fetch analytics data from user_profiles (analytics_data column)
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('analytics_data, first_name, last_name, artist_name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error loading user profile:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to load analytics data' 
      });
    }

    const analyticsData = userProfile?.analytics_data;

    // Return empty state if no manual analytics data
    if (!analyticsData || analyticsData.type !== 'manual_analytics') {
      console.log('📭 No manual analytics data found for user:', userId);
      return res.json({
        success: true,
        data: null,
        message: 'No analytics data available'
      });
    }

    console.log('✅ Manual analytics loaded for:', userProfile?.first_name);

    // Return clean manual analytics data
    return res.json({
      success: true,
      data: {
        latestRelease: analyticsData.latestRelease || null,
        milestones: analyticsData.milestones || [],
        advancedData: analyticsData.advancedData || null,
        sectionVisibility: analyticsData.sectionVisibility || {},
        lastUpdated: analyticsData.lastUpdated,
        source: 'manual_admin_system'
      }
    });

  } catch (error) {
    console.error('Manual analytics API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
