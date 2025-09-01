// Detailed Chartmetric API Debug Report for Support Team
// This generates comprehensive logs and request details for Chartmetric engineering team

export default async function handler(req, res) {
  const report = {
    timestamp: new Date().toISOString(),
    environment: 'development',
    artistId: 895052, // Charles Dada
    requestDetails: [],
    errors: [],
    successfulCalls: [],
    summary: {}
  };

  console.log('🔍 GENERATING DETAILED CHARTMETRIC DEBUG REPORT');
  console.log('📋 Artist ID: 895052 (Charles Dada)');
  console.log('🕐 Timestamp:', report.timestamp);

  try {
    // Step 1: Get authentication token
    console.log('\n=== STEP 1: AUTHENTICATION ===');
    const tokenRequest = {
      url: 'https://api.chartmetric.com/api/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { refreshtoken: process.env.CHARTMETRIC_REFRESH_TOKEN?.substring(0, 10) + '...' },
      timestamp: new Date().toISOString()
    };
    
    report.requestDetails.push(tokenRequest);
    console.log('🔑 Token request URL:', tokenRequest.url);
    console.log('🔑 Token request method:', tokenRequest.method);
    console.log('🔑 Refresh token (first 10 chars):', process.env.CHARTMETRIC_REFRESH_TOKEN?.substring(0, 10));

    const tokenResponse = await fetch('https://api.chartmetric.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshtoken: process.env.CHARTMETRIC_REFRESH_TOKEN
      })
    });

    console.log('✅ Token response status:', tokenResponse.status);
    console.log('✅ Token response headers:', Object.fromEntries(tokenResponse.headers));

    const tokenData = await tokenResponse.json();
    const token = tokenData.token;

    if (!token) {
      report.errors.push({
        step: 'authentication',
        error: 'No token received',
        response: tokenData
      });
      return res.json(report);
    }

    console.log('✅ Token obtained successfully, length:', token.length);
    report.successfulCalls.push('authentication');

    // Step 2: Test all endpoints we're trying to use
    const artistId = 895052;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const testEndpoints = [
      {
        name: 'Basic Artist Data',
        url: `https://api.chartmetric.com/api/artist/${artistId}`,
        purpose: 'Get basic artist info, Spotify followers, monthly listeners'
      },
      {
        name: 'Latest Albums',
        url: `https://api.chartmetric.com/api/artist/${artistId}/albums?limit=1&offset=0&sortBy=release_date`,
        purpose: 'Get latest release information'
      },
      {
        name: 'Recent Milestones',
        url: `https://api.chartmetric.com/api/artist/${artistId}/milestones?since=2024-01-01&until=2024-12-31`,
        purpose: 'Get recent achievements and milestones'
      },
      {
        name: 'Spotify Stats',
        url: `https://api.chartmetric.com/api/artist/${artistId}/stat/spotify`,
        purpose: 'Get detailed Spotify statistics'
      },
      {
        name: 'Instagram Stats',
        url: `https://api.chartmetric.com/api/artist/${artistId}/stat/instagram`,
        purpose: 'Get Instagram follower and engagement data'
      },
      {
        name: 'YouTube Stats',
        url: `https://api.chartmetric.com/api/artist/${artistId}/stat/youtube`,
        purpose: 'Get YouTube subscriber and view data'
      },
      {
        name: 'TikTok Stats',
        url: `https://api.chartmetric.com/api/artist/${artistId}/stat/tiktok`,
        purpose: 'Get TikTok follower and engagement data'
      },
      {
        name: 'Social Footprint',
        url: `https://api.chartmetric.com/api/artist/${artistId}/social-footprint`,
        purpose: 'Get total social media presence across platforms'
      },
      {
        name: 'Geographic Data',
        url: `https://api.chartmetric.com/api/artist/${artistId}/geographic`,
        purpose: 'Get primary/secondary markets and country breakdown'
      },
      {
        name: 'Fan Metrics',
        url: `https://api.chartmetric.com/api/artist/${artistId}/fan-metrics`,
        purpose: 'Get audience demographics and fan data'
      },
      {
        name: 'Rankings',
        url: `https://api.chartmetric.com/api/artist/${artistId}/rankings`,
        purpose: 'Get country, global, and genre rankings'
      },
      {
        name: 'Playlists',
        url: `https://api.chartmetric.com/api/artist/${artistId}/playlists`,
        purpose: 'Get playlist placement and reach data'
      }
    ];

    console.log('\n=== STEP 2: TESTING ALL ENDPOINTS ===');

    for (const endpoint of testEndpoints) {
      console.log(`\n🔍 Testing: ${endpoint.name}`);
      console.log(`📍 URL: ${endpoint.url}`);
      console.log(`🎯 Purpose: ${endpoint.purpose}`);

      const requestDetail = {
        name: endpoint.name,
        url: endpoint.url,
        purpose: endpoint.purpose,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer [TOKEN]',
          'Content-Type': 'application/json'
        },
        timestamp: new Date().toISOString()
      };

      try {
        const response = await fetch(endpoint.url, { headers });
        
        console.log(`📊 Response status: ${response.status}`);
        console.log(`📊 Response headers:`, Object.fromEntries(response.headers));

        requestDetail.responseStatus = response.status;
        requestDetail.responseHeaders = Object.fromEntries(response.headers);

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint.name}: SUCCESS`);
          console.log(`📦 Data structure:`, Object.keys(data));
          
          requestDetail.success = true;
          requestDetail.dataKeys = Object.keys(data);
          requestDetail.sampleData = {
            hasObj: !!data.obj,
            objKeys: data.obj ? Object.keys(data.obj).slice(0, 10) : [],
            dataType: typeof data.obj
          };

          report.successfulCalls.push(endpoint.name);
        } else {
          const errorText = await response.text();
          console.log(`❌ ${endpoint.name}: FAILED`);
          console.log(`❌ Error response:`, errorText);
          
          requestDetail.success = false;
          requestDetail.errorResponse = errorText;
          
          report.errors.push({
            endpoint: endpoint.name,
            url: endpoint.url,
            status: response.status,
            error: errorText
          });
        }

      } catch (error) {
        console.log(`❌ ${endpoint.name}: NETWORK ERROR`);
        console.log(`❌ Error:`, error.message);
        
        requestDetail.success = false;
        requestDetail.networkError = error.message;
        
        report.errors.push({
          endpoint: endpoint.name,
          url: endpoint.url,
          error: error.message,
          type: 'network_error'
        });
      }

      report.requestDetails.push(requestDetail);
    }

    // Step 3: Summary
    console.log('\n=== STEP 3: SUMMARY ===');
    report.summary = {
      totalEndpoints: testEndpoints.length,
      successfulEndpoints: report.successfulCalls.length,
      failedEndpoints: report.errors.length,
      successRate: `${Math.round((report.successfulCalls.length / testEndpoints.length) * 100)}%`,
      workingEndpoints: report.successfulCalls,
      failingEndpoints: report.errors.map(e => e.endpoint)
    };

    console.log(`📊 Success rate: ${report.summary.successRate}`);
    console.log(`✅ Working endpoints: ${report.summary.workingEndpoints.join(', ')}`);
    console.log(`❌ Failing endpoints: ${report.summary.failingEndpoints.join(', ')}`);

    return res.json(report);

  } catch (error) {
    console.error('❌ Report generation failed:', error);
    report.errors.push({
      step: 'report_generation',
      error: error.message
    });
    return res.json(report);
  }
}
