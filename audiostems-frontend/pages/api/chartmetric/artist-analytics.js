// Chartmetric Artist Analytics API
// Fetches comprehensive analytics data for a linked Chartmetric artist

import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const CHARTMETRIC_API_BASE = 'https://api.chartmetric.com/api';

// Get Chartmetric access token
async function getChartmetricToken() {
  if (!process.env.CHARTMETRIC_REFRESH_TOKEN) {
    throw new Error('Chartmetric API not configured');
  }

  const response = await fetch(`${CHARTMETRIC_API_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshtoken: process.env.CHARTMETRIC_REFRESH_TOKEN
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get Chartmetric token');
  }

  const data = await response.json();
  return data.token;
}

// Get comprehensive artist analytics from Chartmetric
async function getArtistAnalytics(artistId, token, dateRange = '30d') {
  const endpoints = {
    // Core artist data
    artist: `${CHARTMETRIC_API_BASE}/artist/${artistId}`,
    
    // Streaming platform stats
    spotify: `${CHARTMETRIC_API_BASE}/artist/${artistId}/stat/spotify`,
    apple: `${CHARTMETRIC_API_BASE}/artist/${artistId}/stat/applemusic`, 
    youtube: `${CHARTMETRIC_API_BASE}/artist/${artistId}/stat/youtube`,
    instagram: `${CHARTMETRIC_API_BASE}/artist/${artistId}/stat/instagram`,
    tiktok: `${CHARTMETRIC_API_BASE}/artist/${artistId}/stat/tiktok`,
    
    // Charts and rankings
    charts: `${CHARTMETRIC_API_BASE}/artist/${artistId}/charts`,
    
    // Fan metrics and social footprint
    fanMetrics: `${CHARTMETRIC_API_BASE}/artist/${artistId}/fan-metrics`,
    socialFootprint: `${CHARTMETRIC_API_BASE}/artist/${artistId}/social-footprint`,
    
    // Geographic data
    geographic: `${CHARTMETRIC_API_BASE}/artist/${artistId}/geographic`,
    
    // Playlist data
    playlists: `${CHARTMETRIC_API_BASE}/artist/${artistId}/playlists`,
    
    // Career trajectory
    career: `${CHARTMETRIC_API_BASE}/artist/${artistId}/career-stage`
  };

  const results = {};
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Fetch all data in parallel
  const promises = Object.entries(endpoints).map(async ([key, url]) => {
    try {
      const response = await fetch(url, { headers });
      if (response.ok) {
        const data = await response.json();
        results[key] = data;
      } else {
        results[key] = { error: `HTTP ${response.status}`, available: false };
      }
    } catch (error) {
      results[key] = { error: error.message, available: false };
    }
  });

  await Promise.all(promises);
  return results;
}

// Transform Chartmetric data to our application format
function transformAnalyticsData(rawData) {
  const artist = rawData.artist?.obj || {};
  const spotify = rawData.spotify?.obj || {};
  const apple = rawData.apple?.obj || {};
  const youtube = rawData.youtube?.obj || {};
  const instagram = rawData.instagram?.obj || {};
  const tiktok = rawData.tiktok?.obj || {};
  const fanMetrics = rawData.fanMetrics?.obj || {};
  const geographic = rawData.geographic?.obj || {};
  const playlists = rawData.playlists?.obj || {};
  const career = rawData.career?.obj || {};

  return {
    // Artist overview
    artist: {
      id: artist.id,
      name: artist.name,
      image: artist.image_url,
      genres: artist.genres || [],
      verified: artist.verified || false
    },

    // Career snapshot
    careerSnapshot: {
      stage: career.stage || 'Developing',
      momentum: career.momentum || 'Steady',
      networkStrength: career.network_strength || 'Emerging',
      socialEngagement: career.social_engagement || 'Active'
    },

    // Platform statistics
    platforms: {
      spotify: {
        followers: spotify.followers || 0,
        monthlyListeners: spotify.monthly_listeners || 0,
        popularity: spotify.popularity || 0,
        playlistReach: spotify.playlist_reach || 0,
        streams: spotify.streams || 0,
        available: !rawData.spotify?.error
      },
      apple: {
        followers: apple.followers || 0,
        streams: apple.streams || 0,
        available: !rawData.apple?.error
      },
      youtube: {
        subscribers: youtube.subscribers || 0,
        views: youtube.views || 0,
        videos: youtube.videos || 0,
        available: !rawData.youtube?.error
      },
      instagram: {
        followers: instagram.followers || 0,
        posts: instagram.posts || 0,
        engagement: instagram.engagement_rate || 0,
        available: !rawData.instagram?.error
      },
      tiktok: {
        followers: tiktok.followers || 0,
        likes: tiktok.likes || 0,
        videos: tiktok.videos || 0,
        views: tiktok.views || 0,
        available: !rawData.tiktok?.error
      }
    },

    // Audience insights
    audience: {
      totalFanbase: fanMetrics.total_fanbase || 0,
      primaryMarket: geographic.primary_market || { country: 'Unknown', percentage: 0 },
      secondaryMarket: geographic.secondary_market || { country: 'Unknown', percentage: 0 },
      demographics: fanMetrics.demographics || {},
      geographic: geographic.breakdown || []
    },

    // Playlist and discovery
    discovery: {
      playlistCount: playlists.total_playlists || 0,
      playlistReach: playlists.total_reach || 0,
      topPlaylists: playlists.top_playlists || []
    },

    // Metadata
    lastUpdated: new Date().toISOString(),
    dataSource: 'chartmetric',
    availability: {
      spotify: !rawData.spotify?.error,
      apple: !rawData.apple?.error,
      youtube: !rawData.youtube?.error,
      instagram: !rawData.instagram?.error,
      tiktok: !rawData.tiktok?.error,
      fanMetrics: !rawData.fanMetrics?.error,
      geographic: !rawData.geographic?.error,
      playlists: !rawData.playlists?.error,
      career: !rawData.career?.error
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🎵 Chartmetric analytics API called');
    
    // Get user from JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token);
    const userId = decoded?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if Chartmetric is configured
    if (!process.env.CHARTMETRIC_REFRESH_TOKEN) {
      return res.status(503).json({ 
        error: 'Chartmetric API not configured',
        message: 'Please link your artist profile to enable analytics',
        requiresLinking: true
      });
    }

    // Get user's linked Chartmetric artist
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('chartmetric_artist_id, chartmetric_artist_name, chartmetric_verified')
      .eq('id', userId)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Failed to get user profile' });
    }

    if (!profile.chartmetric_artist_id) {
      return res.status(400).json({ 
        error: 'No Chartmetric artist linked',
        message: 'Please link your artist profile to view analytics',
        requiresLinking: true
      });
    }

    const { dateRange = '30d' } = req.query;
    
    console.log('🔍 Fetching analytics for artist:', profile.chartmetric_artist_name, 'ID:', profile.chartmetric_artist_id);
    
    // Get Chartmetric token
    const chartmetricToken = await getChartmetricToken();
    console.log('✅ Chartmetric token obtained');
    
    // Fetch comprehensive analytics data
    const headers = {
      'Authorization': `Bearer ${chartmetricToken}`,
      'Content-Type': 'application/json'
    };

    // Fetch multiple endpoints in parallel for comprehensive data
    const [
      artistResponse,
      socialFootprintResponse,
      fanMetricsResponse,
      geographicResponse,
      spotifyResponse
    ] = await Promise.allSettled([
      fetch(`${CHARTMETRIC_API_BASE}/artist/${profile.chartmetric_artist_id}`, { headers }),
      fetch(`${CHARTMETRIC_API_BASE}/artist/${profile.chartmetric_artist_id}/social-footprint`, { headers }),
      fetch(`${CHARTMETRIC_API_BASE}/artist/${profile.chartmetric_artist_id}/fan-metrics`, { headers }),
      fetch(`${CHARTMETRIC_API_BASE}/artist/${profile.chartmetric_artist_id}/geographic`, { headers }),
      fetch(`${CHARTMETRIC_API_BASE}/artist/${profile.chartmetric_artist_id}/stat/spotify`, { headers })
    ]);

    // Process the responses
    const artistData = artistResponse.status === 'fulfilled' && artistResponse.value.ok ? 
      await artistResponse.value.json() : null;
    
    const socialFootprintData = socialFootprintResponse.status === 'fulfilled' && socialFootprintResponse.value.ok ? 
      await socialFootprintResponse.value.json() : null;
    
    const fanMetricsData = fanMetricsResponse.status === 'fulfilled' && fanMetricsResponse.value.ok ? 
      await fanMetricsResponse.value.json() : null;
    
    const geographicData = geographicResponse.status === 'fulfilled' && geographicResponse.value.ok ? 
      await geographicResponse.value.json() : null;
    
    const spotifyData = spotifyResponse.status === 'fulfilled' && spotifyResponse.value.ok ? 
      await spotifyResponse.value.json() : null;

    if (!artistData) {
      console.error('❌ Failed to fetch basic artist data');
      return res.status(400).json({ 
        error: 'Failed to fetch artist data from Chartmetric'
      });
    }

    console.log('✅ Artist data fetched successfully');
    console.log('📊 Social footprint data:', socialFootprintData ? 'Available' : 'Not available');
    console.log('🌍 Geographic data:', geographicData ? 'Available' : 'Not available');
    console.log('👥 Fan metrics data:', fanMetricsData ? 'Available' : 'Not available');
    
    // Construct comprehensive analytics response
    const analytics = {
      artist: artistData.obj,
      socialFootprint: socialFootprintData?.obj || null,
      fanMetrics: fanMetricsData?.obj || null,
      geographic: geographicData?.obj || null,
      spotify: spotifyData?.obj || null,
      userContext: {
        linkedArtist: {
          id: profile.chartmetric_artist_id,
          name: profile.chartmetric_artist_name,
          verified: profile.chartmetric_verified
        }
      },
      dateRange,
      userId
    };

    return res.json({
      success: true,
      data: analytics,
      message: 'Analytics data retrieved successfully'
    });

  } catch (error) {
    console.error('Chartmetric analytics error:', error);
    
    return res.status(500).json({
      error: 'Failed to fetch analytics data',
      message: error.message,
      fallback: true
    });
  }
}