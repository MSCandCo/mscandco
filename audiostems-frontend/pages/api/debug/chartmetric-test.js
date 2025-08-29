// Comprehensive Chartmetric API Debug Test
// This will help us identify the exact issue with artist linking

export default async function handler(req, res) {
  const results = {
    test1_connectivity: null,
    test2_environment: null,
    test3_authentication: null,
    test4_artist_search: null,
    summary: null
  };

  console.log('🔍 STARTING COMPREHENSIVE CHARTMETRIC DEBUG TESTS');

  // TEST 1: Basic API Connectivity
  try {
    console.log('=== TEST 1: API CONNECTIVITY ===');
    const response = await fetch('https://api.chartmetric.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshtoken: 'test' })
    });
    
    console.log('Connectivity response status:', response.status);
    const text = await response.text();
    console.log('Connectivity response body:', text);
    
    results.test1_connectivity = {
      status: response.status,
      body: text,
      success: response.status !== 0
    };
  } catch (error) {
    console.error('Connectivity test failed:', error);
    results.test1_connectivity = {
      error: error.message,
      success: false
    };
  }

  // TEST 2: Environment Variables
  console.log('=== TEST 2: ENVIRONMENT VARIABLES ===');
  const hasToken = !!process.env.CHARTMETRIC_REFRESH_TOKEN;
  const tokenLength = process.env.CHARTMETRIC_REFRESH_TOKEN?.length || 0;
  const tokenStart = process.env.CHARTMETRIC_REFRESH_TOKEN?.substring(0, 10) || 'MISSING';
  
  console.log('CHARTMETRIC_REFRESH_TOKEN exists:', hasToken);
  console.log('Token length:', tokenLength);
  console.log('Token starts with:', tokenStart);
  
  results.test2_environment = {
    hasToken,
    tokenLength,
    tokenStart,
    success: hasToken && tokenLength > 0
  };

  // TEST 3: Token Authentication
  let validToken = null;
  try {
    console.log('=== TEST 3: TOKEN AUTHENTICATION ===');
    
    if (!hasToken) {
      console.log('❌ Cannot test auth - no refresh token');
      results.test3_authentication = {
        error: 'No refresh token available',
        success: false
      };
    } else {
      const response = await fetch('https://api.chartmetric.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshtoken: process.env.CHARTMETRIC_REFRESH_TOKEN
        })
      });
      
      console.log('Auth response status:', response.status);
      console.log('Auth response headers:', Object.fromEntries(response.headers));
      
      const data = await response.json();
      console.log('Auth response data:', data);
      
      if (data.token) {
        console.log('✅ Token obtained successfully, length:', data.token.length);
        validToken = data.token;
        results.test3_authentication = {
          status: response.status,
          tokenObtained: true,
          tokenLength: data.token.length,
          success: true
        };
      } else {
        console.log('❌ No token in response');
        results.test3_authentication = {
          status: response.status,
          data,
          error: 'No token in response',
          success: false
        };
      }
    }
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    results.test3_authentication = {
      error: error.message,
      success: false
    };
  }

  // TEST 4: Artist Search
  try {
    console.log('=== TEST 4: ARTIST SEARCH ===');
    
    if (!validToken) {
      console.log('❌ Cannot test search - no valid token');
      results.test4_artist_search = {
        error: 'No valid token available for search',
        success: false
      };
    } else {
      const response = await fetch('https://api.chartmetric.com/api/search?q=drake&type=artists&limit=5', {
        headers: {
          'Authorization': `Bearer ${validToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Search response status:', response.status);
      const data = await response.json();
      console.log('Search response data:', data);
      
      results.test4_artist_search = {
        status: response.status,
        artistsFound: data?.obj?.artists?.length || 0,
        data: data,
        success: response.status === 200 && data?.obj?.artists?.length > 0
      };
    }
    
  } catch (error) {
    console.error('❌ Search test failed:', error);
    results.test4_artist_search = {
      error: error.message,
      success: false
    };
  }

  // SUMMARY
  console.log('=== SUMMARY ===');
  const allTests = [
    results.test1_connectivity?.success,
    results.test2_environment?.success,
    results.test3_authentication?.success,
    results.test4_artist_search?.success
  ];
  
  const passedTests = allTests.filter(Boolean).length;
  const totalTests = allTests.length;
  
  results.summary = {
    passed: passedTests,
    total: totalTests,
    allPassed: passedTests === totalTests,
    issues: []
  };

  if (!results.test1_connectivity?.success) {
    results.summary.issues.push('API connectivity failed - network or URL issue');
  }
  if (!results.test2_environment?.success) {
    results.summary.issues.push('Missing or invalid CHARTMETRIC_REFRESH_TOKEN environment variable');
  }
  if (!results.test3_authentication?.success) {
    results.summary.issues.push('Token authentication failed - invalid refresh token or expired trial');
  }
  if (!results.test4_artist_search?.success) {
    results.summary.issues.push('Artist search failed - token or API issue');
  }

  console.log(`Tests passed: ${passedTests}/${totalTests}`);
  console.log('Issues found:', results.summary.issues);

  // Return comprehensive results
  res.json({
    success: results.summary.allPassed,
    message: `Chartmetric Debug Complete: ${passedTests}/${totalTests} tests passed`,
    results,
    nextSteps: results.summary.allPassed 
      ? ['All tests passed! Chartmetric integration should work.', 'Apply database migration for persistent storage.']
      : ['Fix the issues listed above', 'Check environment variables', 'Verify Chartmetric API access']
  });
}
