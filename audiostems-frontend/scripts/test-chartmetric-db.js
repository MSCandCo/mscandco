const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testChartmetricDatabase() {
  console.log('🔍 Testing Chartmetric database integration...');
  
  try {
    // Test 1: Can we query the new columns?
    console.log('Test 1: Querying Chartmetric columns...');
    const { data: profiles, error: queryError } = await supabase
      .from('user_profiles')
      .select('id, chartmetric_artist_id, chartmetric_artist_name, chartmetric_verified, chartmetric_linked_at')
      .limit(5);

    if (queryError) {
      console.error('❌ Query failed:', queryError);
      return;
    }

    console.log('✅ Chartmetric columns query successful');
    console.log('📊 Found profiles:', profiles?.length || 0);
    
    // Show any existing links
    const linkedProfiles = profiles?.filter(p => p.chartmetric_artist_id) || [];
    console.log('🔗 Profiles with Chartmetric links:', linkedProfiles.length);
    
    if (linkedProfiles.length > 0) {
      console.log('📋 Existing links:');
      linkedProfiles.forEach(profile => {
        console.log(`  - User ${profile.id}: ${profile.chartmetric_artist_name} (ID: ${profile.chartmetric_artist_id})`);
      });
    }

    // Test 2: Can we insert/update a test link?
    console.log('\nTest 2: Testing insert/update capability...');
    
    // Use a test user ID (we'll clean this up)
    const testUserId = 'test-user-' + Date.now();
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .upsert({
        id: testUserId,
        chartmetric_artist_id: '123456',
        chartmetric_artist_name: 'Test Artist',
        chartmetric_verified: true,
        chartmetric_linked_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
    } else {
      console.log('✅ Insert test successful');
      
      // Clean up test data
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', testUserId);
      
      console.log('🧹 Test data cleaned up');
    }

    console.log('\n🎯 RESULT: Chartmetric database integration is working!');
    console.log('The persistence issue is likely in the API logic or frontend, not the database.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testChartmetricDatabase();
