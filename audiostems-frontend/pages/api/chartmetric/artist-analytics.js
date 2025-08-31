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

    // Fetch comprehensive data from multiple Chartmetric endpoints
    const artistId = profile.chartmetric_artist_id;
    console.log('🔍 Fetching comprehensive data for artist ID:', artistId);

    const [
      artistResponse,
      socialFootprintResponse,
      fanMetricsResponse,
      geographicResponse,
      spotifyResponse,
      appleResponse,
      youtubeResponse,
      instagramResponse,
      tiktokResponse,
      playlistsResponse,
      chartsResponse,
      rankingsResponse
    ] = await Promise.allSettled([
      fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}`, { headers }),
      fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}/social-footprint`, { headers }),
      fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}/fan-metrics`, { headers }),
      fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}/geographic`, { headers }),
      fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}/stat/spotify`, { headers }),
      fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}/stat/applemusic`, { headers }),
      fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}/stat/youtube`, { headers }),
      fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}/stat/instagram`, { headers }),
      fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}/stat/tiktok`, { headers }),
      fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}/playlists`, { headers }),
      fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}/charts`, { headers }),
      fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}/rankings`, { headers })
    ]);

    // Helper function to safely process API responses
    const processResponse = async (response, name) => {
      if (response.status === 'fulfilled' && response.value.ok) {
        try {
          const data = await response.value.json();
          console.log(`✅ ${name} data: Available`);
          return data;
        } catch (error) {
          console.log(`❌ ${name} data: JSON parse error`, error.message);
          return null;
        }
      } else {
        const status = response.status === 'fulfilled' ? response.value.status : 'Network Error';
        console.log(`❌ ${name} data: ${status}`);
        return null;
      }
    };

    // Process all responses
    const [
      artistData,
      socialFootprintData,
      fanMetricsData,
      geographicData,
      spotifyData,
      appleData,
      youtubeData,
      instagramData,
      tiktokData,
      playlistsData,
      chartsData,
      rankingsData
    ] = await Promise.all([
      processResponse(artistResponse, 'Artist'),
      processResponse(socialFootprintResponse, 'Social Footprint'),
      processResponse(fanMetricsResponse, 'Fan Metrics'),
      processResponse(geographicResponse, 'Geographic'),
      processResponse(spotifyResponse, 'Spotify'),
      processResponse(appleResponse, 'Apple Music'),
      processResponse(youtubeResponse, 'YouTube'),
      processResponse(instagramResponse, 'Instagram'),
      processResponse(tiktokResponse, 'TikTok'),
      processResponse(playlistsResponse, 'Playlists'),
      processResponse(chartsResponse, 'Charts'),
      processResponse(rankingsResponse, 'Rankings')
    ]);

    if (!artistData) {
      console.error('❌ Failed to fetch basic artist data');
      return res.status(400).json({ 
        error: 'Failed to fetch artist data from Chartmetric'
      });
    }

    console.log('✅ Artist data fetched successfully');
    
    // Extract real data from successful API responses
    const realData = {
      // Basic artist info
      artist: {
        id: artistData.obj?.id,
        name: artistData.obj?.name,
        image_url: artistData.obj?.image_url,
        verified: artistData.obj?.verified || false,
        genres: artistData.obj?.genres || [],
        // Real Spotify data from artist endpoint
        sp_followers: artistData.obj?.sp_followers || 0,
        sp_monthly_listeners: artistData.obj?.sp_monthly_listeners || 0,
        cm_artist_score: artistData.obj?.cm_artist_score || 0
      },

      // Real social footprint calculation
      socialFootprint: {
        total_fanbase: (artistData.obj?.sp_followers || 0) + 
                      (instagramData?.obj?.followers || 0) + 
                      (youtubeData?.obj?.subscribers || 0) + 
                      (tiktokData?.obj?.followers || 0),
        breakdown: {
          spotify: artistData.obj?.sp_followers || 0,
          instagram: instagramData?.obj?.followers || 0,
          youtube: youtubeData?.obj?.subscribers || 0,
          tiktok: tiktokData?.obj?.followers || 0
        }
      },

      // Real platform statistics (from successful API calls)
      platforms: {
        spotify: {
          followers: artistData.obj?.sp_followers || 0,
          monthly_listeners: artistData.obj?.sp_monthly_listeners || 0,
          popularity: spotifyData?.obj?.popularity || 0,
          available: !!spotifyData || !!artistData
        },
        instagram: {
          followers: instagramData?.obj?.followers || 0,
          posts: instagramData?.obj?.posts || 0,
          engagement_rate: instagramData?.obj?.engagement_rate || 0,
          available: !!instagramData
        },
        youtube: {
          subscribers: youtubeData?.obj?.subscribers || 0,
          views: youtubeData?.obj?.views || 0,
          videos: youtubeData?.obj?.videos || 0,
          available: !!youtubeData
        },
        tiktok: {
          followers: tiktokData?.obj?.followers || 0,
          likes: tiktokData?.obj?.likes || 0,
          videos: tiktokData?.obj?.videos || 0,
          available: !!tiktokData
        }
      },

      // Real geographic data (if available)
      geographic: {
        primary_market: geographicData?.obj?.primary_market || { country: 'Unknown', percentage: 0 },
        secondary_market: geographicData?.obj?.secondary_market || { country: 'Unknown', percentage: 0 },
        breakdown: geographicData?.obj?.breakdown || [],
        available: !!geographicData
      },

      // Real playlist data (if available)  
      playlists: {
        total_playlists: playlistsData?.obj?.total_playlists || 0,
        total_reach: playlistsData?.obj?.total_reach || 0,
        available: !!playlistsData
      },

      // Real rankings data (if available)
      rankings: {
        country_rank: rankingsData?.obj?.country_rank || null,
        global_rank: rankingsData?.obj?.global_rank || null,
        genre_rank: rankingsData?.obj?.genre_rank || {},
        available: !!rankingsData
      },

      // Metadata
      userContext: {
        linkedArtist: {
          id: profile.chartmetric_artist_id,
          name: profile.chartmetric_artist_name,
          verified: profile.chartmetric_verified
        }
      },
      dateRange,
      userId,
      fetchedAt: new Date().toISOString(),
      dataAvailability: {
        artist: !!artistData,
        socialFootprint: !!(artistData || instagramData || youtubeData || tiktokData),
        fanMetrics: !!fanMetricsData,
        geographic: !!geographicData,
        spotify: !!spotifyData || !!artistData,
        apple: !!appleData,
        youtube: !!youtubeData,
        instagram: !!instagramData,
        tiktok: !!tiktokData,
        playlists: !!playlistsData,
        charts: !!chartsData,
        rankings: !!rankingsData
      }
    };

    console.log('🎯 Real data compiled:', {
      spotifyFollowers: realData.artist.sp_followers,
      monthlyListeners: realData.artist.sp_monthly_listeners,
      instagramFollowers: realData.platforms.instagram.followers,
      totalSocialFootprint: realData.socialFootprint.total_fanbase
    });

    return res.json({
      success: true,
      data: realData,
      message: 'Real analytics data retrieved successfully'
    });

  } catch (error) {
    console.error('Chartmetric analytics error:', error);
    
    // Handle rate limiting specifically
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Please wait a moment before refreshing your analytics',
        retryAfter: 60, // seconds
        fallback: true
      });
    }
    
    // Handle authentication errors
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'API credentials may have expired. Please contact support.',
        fallback: true
      });
    }
    
    // General error handling
    return res.status(500).json({
      error: 'Failed to fetch analytics data',
      message: error.message,
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
}