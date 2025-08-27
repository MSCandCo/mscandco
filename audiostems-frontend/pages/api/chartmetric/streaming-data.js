// Chartmetric API integration for real streaming data
// This replaces all mock streaming numbers with live data from Chartmetric

const CHARTMETRIC_API_BASE = 'https://api.chartmetric.com/api';

// Get Chartmetric access token
async function getChartmetricToken() {
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

// Get streaming data for an artist
async function getArtistStreamingData(artistId, token) {
  const response = await fetch(`${CHARTMETRIC_API_BASE}/artist/${artistId}/streaming-stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get streaming data for artist ${artistId}`);
  }

  return response.json();
}

// Get platform-specific data
async function getPlatformData(token, platforms = ['spotify', 'apple', 'youtube', 'amazon']) {
  const platformData = {};
  
  for (const platform of platforms) {
    try {
      const response = await fetch(`${CHARTMETRIC_API_BASE}/charts/${platform}/tracks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        platformData[platform] = await response.json();
      }
    } catch (error) {
      console.error(`Error fetching ${platform} data:`, error);
      platformData[platform] = { error: error.message };
    }
  }
  
  return platformData;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Chartmetric is configured
    if (!process.env.CHARTMETRIC_REFRESH_TOKEN) {
      return res.status(503).json({ 
        error: 'Chartmetric API not configured',
        message: 'CHARTMETRIC_REFRESH_TOKEN environment variable is required',
        fallback: true
      });
    }

    const { artistId, platform, dateRange = '30d' } = req.query;

    // Get Chartmetric token
    const token = await getChartmetricToken();

    let streamingData = {};

    if (artistId) {
      // Get specific artist data
      streamingData = await getArtistStreamingData(artistId, token);
    } else if (platform) {
      // Get platform-specific data
      streamingData = await getPlatformData(token, [platform]);
    } else {
      // Get comprehensive platform data
      streamingData = await getPlatformData(token);
    }

    // Transform data to match our application format
    const transformedData = {
      timestamp: new Date().toISOString(),
      source: 'chartmetric',
      dateRange,
      data: streamingData,
      platforms: {
        spotify: streamingData.spotify || {},
        apple: streamingData.apple || {},
        youtube: streamingData.youtube || {},
        amazon: streamingData.amazon || {},
        deezer: streamingData.deezer || {},
        tidal: streamingData.tidal || {}
      }
    };

    res.json(transformedData);

  } catch (error) {
    console.error('Chartmetric API error:', error);
    
    // Return fallback data structure when Chartmetric fails
    res.status(200).json({
      error: 'Chartmetric API unavailable',
      message: error.message,
      fallback: true,
      timestamp: new Date().toISOString(),
      data: {
        platforms: {
          spotify: { streams: 0, error: 'API unavailable' },
          apple: { streams: 0, error: 'API unavailable' },
          youtube: { streams: 0, error: 'API unavailable' },
          amazon: { streams: 0, error: 'API unavailable' },
          deezer: { streams: 0, error: 'API unavailable' },
          tidal: { streams: 0, error: 'API unavailable' }
        }
      }
    });
  }
}
