require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSplitConfiguration(testNumber) {
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

  // First, GET the current configuration
  const getResponse = await fetch('http://localhost:3013/api/admin/splitconfiguration', {
    headers: {
      'Authorization': `Bearer ${authData.session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!getResponse.ok) {
    const error = await getResponse.text();
    console.error(`❌ TEST #${testNumber} FAILED: GET request failed with status ${getResponse.status}`);
    console.error('Error:', error.substring(0, 200));
    return false;
  }

  const currentConfig = await getResponse.json();

  if (!currentConfig.success) {
    console.error(`❌ TEST #${testNumber} FAILED: GET response not successful`);
    return false;
  }

  // Now try to save the configuration (PUT request)
  const putResponse = await fetch('http://localhost:3013/api/admin/splitconfiguration', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authData.session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      company_percentage: currentConfig.company_percentage,
      artist_percentage: currentConfig.artist_percentage,
      label_percentage: currentConfig.label_percentage,
      super_label_percentage: currentConfig.super_label_percentage
    })
  });

  if (!putResponse.ok) {
    const error = await putResponse.text();
    console.error(`❌ TEST #${testNumber} FAILED: PUT request failed with status ${putResponse.status}`);
    console.error('Error:', error.substring(0, 200));
    return false;
  }

  const saveResult = await putResponse.json();

  if (!saveResult.success) {
    console.error(`❌ TEST #${testNumber} FAILED: Save response not successful`);
    return false;
  }

  console.log(`✅ TEST #${testNumber} PASSED:`);
  console.log(`   - GET config successful`);
  console.log(`   - PUT config successful`);
  console.log(`   - Company: ${currentConfig.company_percentage}%`);
  console.log(`   - Artist: ${currentConfig.artist_percentage}%`);
  console.log(`   - Label: ${currentConfig.label_percentage}%`);

  return true;
}

async function runTests() {
  console.log('🚀 Starting Split Configuration API Test - 10 Iterations\n');

  let passed = 0;
  let failed = 0;

  for (let i = 1; i <= 10; i++) {
    try {
      const result = await testSplitConfiguration(i);
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
    console.log('\n🎉 ALL TESTS PASSED! Split Configuration API is working perfectly!');
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
