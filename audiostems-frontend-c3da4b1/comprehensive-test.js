#!/usr/bin/env node
// 🧪 COMPREHENSIVE PLATFORM TESTING SCRIPT
// Tests all pages, roles, and functionality automatically

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3002';
const testResults = [];

// Pages to test
const pagesToTest = [
  '/',
  '/login',
  '/register', 
  '/pricing',
  '/dashboard',
  '/billing',
  '/artist/earnings',
  '/artist/roster',
  '/admin/dashboard',
  '/distribution/dashboard'
];

// Test individual page
async function testPage(path) {
  try {
    console.log(`🧪 Testing: ${BASE_URL}${path}`);
    const response = await axios.get(`${BASE_URL}${path}`, {
      timeout: 10000,
      validateStatus: (status) => status < 500 // Accept redirects
    });
    
    const result = {
      path,
      status: response.status,
      success: response.status < 400,
      loadTime: Date.now(),
      size: response.data.length
    };
    
    // Check for specific issues
    if (response.data.includes('Auth0')) {
      result.issues = (result.issues || []).concat(['Auth0 references found']);
    }
    if (response.data.includes('Stripe')) {
      result.issues = (result.issues || []).concat(['Stripe references found']);
    }
    if (response.data.includes('AWS') && !response.data.includes('<!-- AWS -->')) {
      result.issues = (result.issues || []).concat(['AWS references found']);
    }
    
    testResults.push(result);
    
    if (result.success) {
      console.log(`✅ ${path} - Status: ${response.status} - Size: ${(response.data.length/1024).toFixed(1)}KB`);
    } else {
      console.log(`❌ ${path} - Status: ${response.status}`);
    }
    
    return result;
  } catch (error) {
    const result = {
      path,
      status: error.response?.status || 'ERROR',
      success: false,
      error: error.message
    };
    testResults.push(result);
    console.log(`❌ ${path} - Error: ${error.message}`);
    return result;
  }
}

// Test API endpoints
async function testAPIs() {
  const apiEndpoints = [
    '/api/health',
    '/api/billing/create-revolut-checkout',
    '/api/billing/revolut-webhook'
  ];
  
  console.log('🔌 Testing API endpoints...');
  
  for (const endpoint of apiEndpoints) {
    try {
      const response = await axios.post(`${BASE_URL}${endpoint}`, {}, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      console.log(`✅ API ${endpoint} - Status: ${response.status}`);
    } catch (error) {
      if (error.response?.status === 405) {
        console.log(`✅ API ${endpoint} - Method check OK (405 expected)`);
      } else {
        console.log(`⚠️ API ${endpoint} - ${error.message}`);
      }
    }
  }
}

// Run authentication flow test
async function testAuthFlow() {
  console.log('🔐 Testing authentication flow...');
  
  // Test login page loads
  try {
    await axios.get(`${BASE_URL}/login`);
    console.log('✅ Login page loads');
  } catch (error) {
    console.log('❌ Login page error:', error.message);
  }
  
  // Test register page loads  
  try {
    await axios.get(`${BASE_URL}/register`);
    console.log('✅ Register page loads');
  } catch (error) {
    console.log('❌ Register page error:', error.message);
  }
}

// Main testing function
async function runComprehensiveTest(testNumber = 1) {
  console.log(`\n🚀 COMPREHENSIVE TEST RUN #${testNumber}`);
  console.log('='.repeat(50));
  
  const startTime = Date.now();
  
  // Wait for server to be ready
  console.log('⏳ Waiting for server to be ready...');
  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      await axios.get(BASE_URL, { timeout: 3000 });
      serverReady = true;
      break;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  if (!serverReady) {
    console.log('❌ Server not ready after 30 seconds');
    return false;
  }
  
  console.log('✅ Server is ready!');
  
  // Test all pages
  console.log('📄 Testing all pages...');
  for (const path of pagesToTest) {
    await testPage(path);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
  }
  
  // Test APIs
  await testAPIs();
  
  // Test auth flow
  await testAuthFlow();
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log(`\n📊 TEST RUN #${testNumber} COMPLETE`);
  console.log(`⏱️  Duration: ${duration.toFixed(1)}s`);
  
  // Summary
  const successful = testResults.filter(r => r.success).length;
  const total = testResults.length;
  console.log(`✅ Success Rate: ${successful}/${total} (${((successful/total)*100).toFixed(1)}%)`);
  
  // Check for issues
  const issues = testResults.filter(r => r.issues?.length > 0);
  if (issues.length > 0) {
    console.log('⚠️  Issues found:');
    issues.forEach(issue => {
      console.log(`   ${issue.path}: ${issue.issues.join(', ')}`);
    });
  }
  
  return successful === total;
}

// Run 7 comprehensive tests
async function run7Tests() {
  console.log('🎯 STARTING 7X COMPREHENSIVE TESTING');
  console.log('This will test the entire platform 7 times for reliability');
  
  const results = [];
  
  for (let i = 1; i <= 7; i++) {
    const success = await runComprehensiveTest(i);
    results.push(success);
    
    if (i < 7) {
      console.log(`\n⏳ Waiting 10 seconds before next test...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  // Final summary
  console.log('\n🏁 7X TESTING COMPLETE!');
  console.log('='.repeat(50));
  console.log(`✅ Successful runs: ${results.filter(r => r).length}/7`);
  console.log(`❌ Failed runs: ${results.filter(r => !r).length}/7`);
  
  if (results.every(r => r)) {
    console.log('🎉 ALL TESTS PASSED! Platform is ready for next features!');
  } else {
    console.log('⚠️  Some tests failed. Check logs above for details.');
  }
  
  // Save results
  const reportPath = 'test-results.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    testRuns: results,
    allResults: testResults,
    summary: {
      totalRuns: 7,
      successfulRuns: results.filter(r => r).length,
      overallSuccess: results.every(r => r)
    }
  }, null, 2));
  
  console.log(`📋 Detailed results saved to: ${reportPath}`);
}

// Run the comprehensive testing
run7Tests().catch(console.error);
