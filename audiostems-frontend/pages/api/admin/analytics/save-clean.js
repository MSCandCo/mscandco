// Clean Manual Analytics Save API - NO CHARTMETRICS
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
    // Basic auth check for admin operations
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

    const userEmail = userInfo?.email?.toLowerCase() || '';
    const userRole = userInfo?.user_metadata?.role;

    // Check admin permissions
    const isAdmin = (
      userRole === 'company_admin' || 
      userRole === 'super_admin' ||
      userEmail === 'companyadmin@mscandco.com' ||
      userEmail === 'superadmin@mscandco.com'
    );

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { artistId, analyticsData } = req.body;

    if (!artistId || !analyticsData) {
      return res.status(400).json({ error: 'Artist ID and analytics data are required' });
    }

    console.log('💾 Saving clean manual analytics for artist:', artistId);

    // Prepare clean analytics data structure
    const cleanAnalyticsData = {
      type: 'manual_analytics',
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin',
      latestRelease: analyticsData.latestRelease || null,
      milestones: analyticsData.milestones || [],
      advancedData: analyticsData.advancedData || null,
      sectionVisibility: analyticsData.sectionVisibility || {
        latestRelease: true,
        milestones: true,
        artistRanking: true,
        careerSnapshot: true,
        audienceSummary: true,
        topMarkets: true,
        topStatistics: true,
        topTracks: true,
        allReleases: true,
        platformPerformance: true
      }
    };

    console.log('📦 Clean analytics data to save:', cleanAnalyticsData);

    // Save to analytics_data column
    const { data: updated, error } = await supabase
      .from('user_profiles')
      .update({ 
        analytics_data: cleanAnalyticsData,
        updated_at: new Date().toISOString()
      })
      .eq('id', artistId)
      .select();

    if (error) {
      console.error('❌ Save error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to save analytics', 
        details: error.message 
      });
    }

    console.log('✅ Clean analytics saved successfully for artist:', artistId);

    return res.json({
      success: true,
      message: 'Analytics saved successfully',
      data: updated?.[0]
    });

  } catch (error) {
    console.error('Clean save API error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
