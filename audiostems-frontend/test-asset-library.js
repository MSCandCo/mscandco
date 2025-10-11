require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAssetLibrary(testNumber) {
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

  // Test 1: Call the main asset library API
  const response = await fetch('http://localhost:3013/api/admin/assetlibrary?status=active', {
    headers: {
      'Authorization': `Bearer ${authData.session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ TEST #${testNumber} FAILED: Main API failed with status ${response.status}`);
    console.error('Error:', error.substring(0, 200));
    return false;
  }

  const filesData = await response.json();

  if (!filesData.success) {
    console.error(`❌ TEST #${testNumber} FAILED: Response not successful`);
    return false;
  }

  // Test 2: Call the stats API
  const statsResponse = await fetch('http://localhost:3013/api/admin/assetlibrary/stats', {
    headers: {
      'Authorization': `Bearer ${authData.session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!statsResponse.ok) {
    const error = await statsResponse.text();
    console.error(`❌ TEST #${testNumber} FAILED: Stats API failed with status ${statsResponse.status}`);
    console.error('Error:', error.substring(0, 200));
    return false;
  }

  const statsData = await statsResponse.json();

  if (!statsData.success) {
    console.error(`❌ TEST #${testNumber} FAILED: Stats response not successful`);
    return false;
  }

  console.log(`✅ TEST #${testNumber} PASSED:`);
  console.log(`   - Main API successful`);
  console.log(`   - Stats API successful`);
  console.log(`   - Total files: ${filesData.pagination?.total || 0}`);
  console.log(`   - Active files: ${statsData.stats?.active_files || 0}`);
  console.log(`   - Total storage: ${statsData.stats?.total_storage_gb || 0} GB`);

  return true;
}

async function runTests() {
  console.log('🚀 Starting Asset Library API Test - 10 Iterations\n');

  let passed = 0;
  let failed = 0;

  for (let i = 1; i <= 10; i++) {
    try {
      const result = await testAssetLibrary(i);
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
    console.log('\n🎉 ALL TESTS PASSED! Asset Library API is working perfectly!');
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
