import { createClient } from '@supabase/supabase-js';
import chartmetric, { getArtistInsights, getTrackInsights } from '@/lib/chartmetric';
// AcceberAI mock removed - ready for real AI integration

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { 
      user_id, 
      date_start, 
      date_end, 
      include_chartmetric = 'true',
      include_ai_insights = 'true' 
    } = req.query;

    // Determine target user (for admins checking other users)
    const targetUserId = user_id || user.id;

    // Verify access permissions
    if (targetUserId !== user.id) {
      const { data: roleData } = await supabase
        .from('user_role_assignments')
        .select('role_name')
        .eq('user_id', user.id)
        .single();

      if (!roleData || !['company_admin', 'super_admin', 'label_admin'].includes(roleData.role_name)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get user's subscription to determine feature access
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan, advanced_analytics')
      .eq('user_id', targetUserId)
      .single();

    const hasAdvancedAnalytics = subscription?.advanced_analytics || false;
    const hasChartmetricAccess = subscription?.plan === 'artist_pro';

    // Get basic platform earnings
    let query_earnings = supabase
      .from('platform_earnings')
      .select(`
        *,
        assets!inner(track_title, spotify_track_id),
        releases!inner(release_title, status)
      `)
      .eq('user_id', targetUserId);

    if (date_start) {
      query_earnings = query_earnings.gte('reporting_period_start', date_start);
    }
    if (date_end) {
      query_earnings = query_earnings.lte('reporting_period_end', date_end);
    }

    const { data: earnings, error: earningsError } = await query_earnings;

    if (earningsError) {
      console.error('Error fetching earnings:', earningsError);
      return res.status(500).json({ error: 'Failed to fetch earnings data' });
    }

    // Calculate basic metrics
    const basicMetrics = {
      total_streams: earnings?.reduce((sum, e) => sum + (e.streams || 0), 0) || 0,
      total_revenue: earnings?.reduce((sum, e) => sum + (e.revenue_net || 0), 0) || 0,
      total_releases: [...new Set(earnings?.map(e => e.releases.id) || [])].length,
      platforms: [...new Set(earnings?.map(e => e.platform) || [])],
      top_performing_track: earnings?.sort((a, b) => (b.revenue_net || 0) - (a.revenue_net || 0))[0] || null
    };

    let analyticsData = {
      basic_metrics: basicMetrics,
      earnings_breakdown: earnings || [],
      subscription_level: subscription?.plan || 'artist_starter',
      features_available: {
        advanced_analytics: hasAdvancedAnalytics,
        chartmetric_access: hasChartmetricAccess,
        ai_insights: true
      }
    };

    // Enhanced analytics for Pro users
    if (hasAdvancedAnalytics && include_chartmetric === 'true' && hasChartmetricAccess) {
      try {
        // Get user profile for Chartmetric lookup
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('artist_name, spotify_artist_id')
          .eq('id', targetUserId)
          .single();

        if (profile?.spotify_artist_id || profile?.artist_name) {
          const chartmetricData = await getArtistInsights(
            profile.artist_name, 
            profile.spotify_artist_id
          );

          if (chartmetricData?.success) {
            analyticsData.chartmetric_insights = {
              social_footprint: chartmetricData.data.social_footprint,
              streaming_stats: chartmetricData.data.streaming_stats,
              popularity_score: chartmetricData.data.popularity,
              last_updated: new Date().toISOString()
            };
          }
        }

        // Get track-level Chartmetric data for recent releases
        const recentTracks = earnings?.filter(e => e.assets?.spotify_track_id)
          .slice(0, 5) || []; // Last 5 tracks with Spotify IDs

        const trackInsights = await Promise.all(
          recentTracks.map(async (track) => {
            const insights = await getTrackInsights(track.assets.spotify_track_id);
            return {
              track_id: track.assets.id,
              track_title: track.assets.track_title,
              chartmetric_data: insights.success ? insights.data : null
            };
          })
        );

        analyticsData.track_insights = trackInsights;

      } catch (chartmetricError) {
        console.error('Chartmetric API error:', chartmetricError);
        analyticsData.chartmetric_error = 'Failed to fetch Chartmetric data';
      }
    }

    // AI-powered insights (available to all users, enhanced for Pro)
    if (include_ai_insights === 'true') {
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        const aiLevel = hasAdvancedAnalytics ? 'premium' : 'basic';
        
        // AI analysis placeholder - ready for real AI integration
        analyticsData.ai_insights = {
          performance_analysis: {
            performance_score: 0,
            revenue_analysis: { roi: 0, profit_margin: 0, break_even_achieved: false },
            growth_trajectory: "stable",
            recommendations: []
          },
          access_level: aiLevel,
          last_analyzed: new Date().toISOString()
        };

        // Strategic recommendations placeholder
        analyticsData.ai_recommendations = [];

      } catch (aiError) {
        console.error('Acceber AI error:', aiError);
        analyticsData.ai_error = 'Failed to fetch AI insights';
      }
    }

    return res.status(200).json({
      success: true,
      analytics: analyticsData,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in comprehensive analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
