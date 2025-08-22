import { createClient } from '@supabase/supabase-js';
import aceberAI from '@/lib/acceber-ai';
import chartmetric from '@/lib/chartmetric';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

    // Check user's subscription for AI access level
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan, advanced_analytics')
      .eq('user_id', user.id)
      .single();

    const aiAccessLevel = subscription?.plan === 'artist_pro' ? 'premium' : 'basic';

    const { release_data, analysis_type = 'basic' } = req.body;

    // Get user's profile and historical data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get user's historical releases for context
    const { data: historicalReleases } = await supabase
      .from('releases')
      .select(`
        *,
        platform_earnings(streams, revenue_net, platform)
      `)
      .eq('artist_user_id', user.id)
      .eq('status', 'live');

    // Prepare data for AI analysis
    const artistData = {
      name: profile?.artist_name || `${profile?.first_name} ${profile?.last_name}`,
      genre: release_data.genre,
      followers: 0, // Will be populated from Chartmetric if available
      release_history: historicalReleases || [],
      social_footprint: {}
    };

    const trackMetadata = {
      title: release_data.releaseTitle,
      genre: release_data.genre,
      duration: release_data.tracks?.[0]?.duration || 0,
      energy: 'medium',
      mood: 'neutral'
    };

    const targetAudience = {
      countries: ['UK', 'US'],
      age_groups: ['18-24', '25-34'],
      platforms: ['spotify', 'apple_music', 'youtube_music']
    };

    let insights = {};

    // Basic AI insights (available to all users)
    if (analysis_type === 'basic' || analysis_type === 'comprehensive') {
      try {
        // Release timing analysis
        const timingAnalysis = await aceberAI.analyzeReleaseTimining(
          artistData, 
          trackMetadata, 
          targetAudience
        );

        if (timingAnalysis.success) {
          insights.timing_insights = timingAnalysis.insights;
        }

        // Revenue potential analysis
        const revenueAnalysis = await aceberAI.analyzeRevenuePotential(
          {
            title: release_data.releaseTitle,
            artist: artistData.name,
            genre: release_data.genre,
            track_count: release_data.tracks?.length || 1,
            marketing_budget: 0
          },
          {
            releases: historicalReleases || [],
            avg_streams: historicalReleases?.reduce((sum, r) => 
              sum + (r.platform_earnings?.reduce((s, e) => s + (e.streams || 0), 0) || 0), 0
            ) / (historicalReleases?.length || 1) || 0,
            avg_revenue: historicalReleases?.reduce((sum, r) => 
              sum + (r.platform_earnings?.reduce((s, e) => s + (e.revenue_net || 0), 0) || 0), 0
            ) / (historicalReleases?.length || 1) || 0
          }
        );

        if (revenueAnalysis.success) {
          insights.revenue_insights = revenueAnalysis.insights;
        }

      } catch (error) {
        console.error('Basic AI analysis error:', error);
        insights.ai_error = 'Failed to get basic AI insights';
      }
    }

    // Premium AI insights (Pro users only)
    if (analysis_type === 'comprehensive' && aiAccessLevel === 'premium') {
      try {
        // Generate release bio and marketing copy
        const bioGeneration = await aceberAI.generateReleaseBio(
          {
            title: release_data.releaseTitle,
            genre: release_data.genre,
            themes: [],
            tracks: release_data.tracks || []
          },
          {
            name: artistData.name,
            bio: profile?.bio || '',
            musical_style: release_data.genre
          },
          'professional'
        );

        if (bioGeneration.success) {
          insights.generated_content = bioGeneration.content;
        }

        // Strategic recommendations
        const recommendations = await aceberAI.getReleaseRecommendations(
          profile,
          { 
            current_trends: [], 
            seasonal_factor: aceberAI.getSeasonalFactor() 
          }
        );

        if (recommendations.success) {
          insights.strategic_recommendations = recommendations.recommendations;
        }

      } catch (error) {
        console.error('Premium AI analysis error:', error);
        insights.premium_ai_error = 'Failed to get premium AI insights';
      }
    }

    // Chartmetric integration (Pro users only)
    if (aiAccessLevel === 'premium' && profile?.spotify_artist_id) {
      try {
        const chartmetricInsights = await chartmetric.getArtistAnalytics(profile.spotify_artist_id);
        if (chartmetricInsights.success) {
          insights.chartmetric_data = chartmetricInsights.data;
          
          // Update artist data with real follower counts
          artistData.followers = chartmetricInsights.data.followers;
          artistData.social_footprint = chartmetricInsights.data.social_footprint;
        }
      } catch (error) {
        console.error('Chartmetric integration error:', error);
        insights.chartmetric_error = 'Failed to fetch Chartmetric data';
      }
    }

    return res.status(200).json({
      success: true,
      insights,
      access_level: aiAccessLevel,
      generated_at: new Date().toISOString(),
      user_id: user.id
    });

  } catch (error) {
    console.error('Error in AI insights API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
