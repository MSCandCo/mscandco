// Test Chartmetric API token and basic functionality
export default async function handler(req, res) {
  try {
    console.log('🔧 Testing Chartmetric API setup...');
    
    // Check environment variables
    if (!process.env.CHARTMETRIC_REFRESH_TOKEN) {
      return res.status(500).json({
        error: 'CHARTMETRIC_REFRESH_TOKEN not configured',
        message: 'Environment variable missing'
      });
    }
    
    console.log('✅ Environment variable found');
    console.log('Token length:', process.env.CHARTMETRIC_REFRESH_TOKEN?.length);
    
    // Test token request
    const tokenResponse = await fetch('https://api.chartmetric.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshtoken: process.env.CHARTMETRIC_REFRESH_TOKEN
      })
    });
    
    console.log('Token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token request failed:', errorText);
      return res.status(500).json({
        error: 'Token request failed',
        status: tokenResponse.status,
        details: errorText
      });
    }
    
    const tokenData = await tokenResponse.json();
    console.log('✅ Token obtained successfully');
    
    // Test a simple search
    const searchResponse = await fetch('https://api.chartmetric.com/api/search?q=moses%20bliss&type=artists&limit=5', {
      headers: {
        'Authorization': `Bearer ${tokenData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Search response status:', searchResponse.status);
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Search failed:', errorText);
      return res.status(500).json({
        error: 'Search test failed',
        status: searchResponse.status,
        details: errorText
      });
    }
    
    const searchData = await searchResponse.json();
    console.log('✅ Search test successful');
    console.log('Found artists:', searchData?.obj?.artists?.length || 0);
    
    return res.json({
      success: true,
      message: 'Chartmetric API working correctly',
      tokenValid: true,
      searchWorking: true,
      artistsFound: searchData?.obj?.artists?.length || 0,
      sampleArtists: searchData?.obj?.artists?.slice(0, 3) || []
    });
    
  } catch (error) {
    console.error('❌ Chartmetric test failed:', error);
    return res.status(500).json({
      error: 'Chartmetric API test failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
