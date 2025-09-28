// Chartmetric API Integration
// This module integrates with Chartmetric API for real-time analytics and social footprint tracking

const CHARTMETRIC_API_BASE = 'https://api.chartmetric.com/api';

/**
 * Get Chartmetric access token
 * @returns {Promise<string|null>} Access token or null if failed
 */
async function getAccessToken() {
  const refreshToken = process.env.CHARTMETRIC_REFRESH_TOKEN;
  
  if (!refreshToken) {
    console.warn('CHARTMETRIC_REFRESH_TOKEN not configured');
    return null;
  }

  try {
    const response = await fetch(`${CHARTMETRIC_API_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshtoken: refreshToken
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error getting Chartmetric access token:', error);
    return null;
  }
}

/**
 * Get artist insights from Chartmetric
 * @param {string} artistName - Artist name
 * @param {string} spotifyArtistId - Spotify artist ID (optional)
 * @returns {Promise<Object>} Artist insights data
 */
export async function getArtistInsights(artistName, spotifyArtistId = null) {
  const token = await getAccessToken();
  
  if (!token) {
    return {
      success: false,
      error: 'Failed to authenticate with Chartmetric API'
    };
  }

  try {
    // If we have Spotify ID, use it directly, otherwise search by name
    let artistId = spotifyArtistId;
    
    if (!artistId && artistName) {
      // Search for artist by name
      const searchResponse = await fetch(`${CHARTMETRIC_API_BASE}/search?q=${encodeURIComponent(artistName)}&type=artists&limit=1`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.obj && searchData.obj.artists && searchData.obj.artists.length > 0) {
          artistId = searchData.obj.artists[0].id;
        }
      }
    }

    if (!artistId) {
      return {
        success: false,
        error: 'Artist not found in Chartmetric database'
      };
    }

    // Get artist insights
    const insightsResponse = await fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}/stat/spotify`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!insightsResponse.ok) {
      throw new Error(`Failed to get artist insights: ${insightsResponse.status}`);
    }

    const insightsData = await insightsResponse.json();

    // Get social media stats
    const socialResponse = await fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}/stat/socialmedia`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let socialData = {};
    if (socialResponse.ok) {
      socialData = await socialResponse.json();
    }

    return {
      success: true,
      data: {
        artist_id: artistId,
        artist_name: artistName,
        streaming_stats: insightsData.obj || {},
        social_footprint: socialData.obj || {},
        popularity: insightsData.obj?.followers || 0,
        last_updated: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error fetching artist insights:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get track insights from Chartmetric
 * @param {string} spotifyTrackId - Spotify track ID
 * @returns {Promise<Object>} Track insights data
 */
export async function getTrackInsights(spotifyTrackId) {
  const token = await getAccessToken();
  
  if (!token) {
    return {
      success: false,
      error: 'Failed to authenticate with Chartmetric API'
    };
  }

  try {
    const response = await fetch(`${CHARTMETRIC_API_BASE}/track/${spotifyTrackId}/stat/spotify`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get track insights: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        track_id: spotifyTrackId,
        stats: data.obj || {},
        last_updated: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error fetching track insights:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Default export - main Chartmetric API client
 */
const chartmetric = {
  getAccessToken,
  getArtistInsights,
  getTrackInsights
};

export default chartmetric;
