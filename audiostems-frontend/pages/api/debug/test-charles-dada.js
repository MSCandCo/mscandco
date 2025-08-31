// Test Charles Dada real data from Chartmetric API
export default async function handler(req, res) {
  try {
    console.log('🎵 Testing Charles Dada (ID: 895052) data from Chartmetric API');

    // Get Chartmetric token
    const tokenResponse = await fetch('https://api.chartmetric.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshtoken: process.env.CHARTMETRIC_REFRESH_TOKEN
      })
    });

    const tokenData = await tokenResponse.json();
    const token = tokenData.token;

    if (!token) {
      return res.status(401).json({ error: 'Failed to get token' });
    }

    const artistId = 895052; // Charles Dada
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log(`🔍 Fetching data for artist ID: ${artistId}`);

    // Test multiple endpoints to see what's available
    const endpoints = [
      { name: 'artist', url: `https://api.chartmetric.com/api/artist/${artistId}` },
      { name: 'spotify_stats', url: `https://api.chartmetric.com/api/artist/${artistId}/stat/spotify` },
      { name: 'instagram_stats', url: `https://api.chartmetric.com/api/artist/${artistId}/stat/instagram` },
      { name: 'youtube_stats', url: `https://api.chartmetric.com/api/artist/${artistId}/stat/youtube` },
      { name: 'tiktok_stats', url: `https://api.chartmetric.com/api/artist/${artistId}/stat/tiktok` },
      { name: 'audience_stats', url: `https://api.chartmetric.com/api/artist/${artistId}/audience-stats` },
      { name: 'fan_metrics', url: `https://api.chartmetric.com/api/artist/${artistId}/fan-metrics` },
      { name: 'playlists', url: `https://api.chartmetric.com/api/artist/${artistId}/playlists` },
      { name: 'tracks', url: `https://api.chartmetric.com/api/artist/${artistId}/tracks` }
    ];

    const results = {};

    // Test each endpoint
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing ${endpoint.name}...`);
        const response = await fetch(endpoint.url, { headers });
        
        if (response.ok) {
          const data = await response.json();
          results[endpoint.name] = {
            success: true,
            status: response.status,
            data: data.obj || data,
            available: true
          };
          console.log(`✅ ${endpoint.name}: Success`);
        } else {
          results[endpoint.name] = {
            success: false,
            status: response.status,
            error: await response.text(),
            available: false
          };
          console.log(`❌ ${endpoint.name}: ${response.status}`);
        }
      } catch (error) {
        results[endpoint.name] = {
          success: false,
          error: error.message,
          available: false
        };
        console.log(`❌ ${endpoint.name}: ${error.message}`);
      }
    }

    // Return comprehensive results
    res.json({
      success: true,
      artistId: 895052,
      artistName: 'Charles Dada',
      results,
      summary: {
        total_endpoints: endpoints.length,
        successful: Object.values(results).filter(r => r.success).length,
        available_data: Object.keys(results).filter(key => results[key].success)
      }
    });

  } catch (error) {
    console.error('Test failed:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
}