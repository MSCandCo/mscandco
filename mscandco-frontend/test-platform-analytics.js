require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPlatformAnalytics(testNumber) {
  console.log(`\n========== TEST #${testNumber} ==========`);

  // Sign in as superadmin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'superadmin@mscandco.com',
    password: 'TestPass123!'
  });

  if (authError) {
    console.error(`❌ TEST #${testNumber} FAILED: Auth error:`, authError.message);
    return false;
  }

  // Call the platform analytics API
  const response = await fetch('http://localhost:3013/api/admin/platform-analytics?timeRange=30', {
    headers: {
      'Authorization': `Bearer ${authData.session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ TEST #${testNumber} FAILED: Response status ${response.status}`);
    console.error('Error:', error.substring(0, 200));
    return false;
  }

  const data = await response.json();

  if (!data.success) {
    console.error(`❌ TEST #${testNumber} FAILED: Response not successful`);
    return false;
  }

  if (!data.summary || !data.revenue || !data.users || !data.releases) {
    console.error(`❌ TEST #${testNumber} FAILED: Missing data sections`);
    return false;
  }

  console.log(`✅ TEST #${testNumber} PASSED:`);
  console.log(`   - Total revenue: £${data.summary.totalRevenue.toFixed(2)}`);
  console.log(`   - Total users: ${data.summary.totalUsers}`);
  console.log(`   - Active users: ${data.summary.activeUsers}`);
  console.log(`   - Total releases: ${data.summary.totalReleases}`);
  console.log(`   - Top artists: ${data.topArtists.length}`);

  return true;
}

async function runTests() {
  console.log('🚀 Starting Platform Analytics API Test - 10 Iterations\n');

  let passed = 0;
  let failed = 0;

  for (let i = 1; i <= 10; i++) {
    try {
      const result = await testPlatformAnalytics(i);
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ TEST #${i} EXCEPTION:`, error.message);
      failed++;
    }

    // Wait 1 second between tests
    if (i < 10) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n========== FINAL RESULTS ==========');
  console.log(`✅ Passed: ${passed}/10`);
  console.log(`❌ Failed: ${failed}/10`);
  console.log(`📊 Success Rate: ${(passed/10*100).toFixed(1)}%`);

  if (passed === 10) {
    console.log('\n🎉 ALL TESTS PASSED! Platform Analytics API is working perfectly!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Review the errors above.');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('💥 Test suite crashed:', err);
  process.exit(1);
});
