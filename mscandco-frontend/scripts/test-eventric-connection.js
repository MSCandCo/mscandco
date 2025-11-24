/**
 * Test Eventric API Connection
 *
 * This script verifies that:
 * 1. Eventric credentials are loaded correctly
 * 2. OAuth authentication works
 * 3. We can fetch tour data
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { eventricClient } = require('../lib/eventric/client.js');

async function testEventricConnection() {
  console.log('🎸 Testing Eventric API Connection...\n');

  try {
    // Test 1: Check credentials
    console.log('✓ Credentials loaded from .env.local:');
    console.log(`  Base URL: ${eventricClient.baseUrl}`);
    console.log(`  Username: ${eventricClient.username || 'N/A'}`);
    console.log(`  Consumer Key: ${eventricClient.consumerKey?.substring(0, 10)}...`);
    console.log(`  Access Token: ${eventricClient.accessToken?.substring(0, 10)}... ${eventricClient.accessToken ? '(pre-loaded)' : '(will fetch)'}`);
    console.log();

    // Test 2: Fetch tours (authentication happens automatically if needed)
    console.log('📋 Fetching tours...');
    const tours = await eventricClient.getTours();
    console.log('✓ Tours fetched successfully!');
    console.log(`  Found ${tours?.length || 0} tours`);

    if (tours && tours.length > 0) {
      console.log('\n📅 First tour:');
      const tour = tours[0];
      console.log(`  Name: ${tour.name || 'N/A'}`);
      console.log(`  ID: ${tour.id || 'N/A'}`);
      console.log(`  Status: ${tour.status || 'N/A'}`);
      console.log(`  Start Date: ${tour.start_date || 'N/A'}`);
    }

    console.log('\n✅ ALL TESTS PASSED! Eventric integration is working!');
    console.log('\n🚀 You can now use Apollo to manage tours:');
    console.log('   - "Show me my tours"');
    console.log('   - "What\'s on my schedule for tomorrow?"');
    console.log('   - "Create a guest list for tonight\'s show"');
    console.log('   - "Find me a hotel near the next venue"');

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error:', error.message);

    if (error.message.includes('Authentication failed')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Check your Eventric credentials in .env.local');
      console.error('   2. Verify username and password are correct');
      console.error('   3. Ensure OAuth consumer keys are valid');
      console.error('   4. Visit https://my.eventric.com/portal to verify account');
    }

    process.exit(1);
  }
}

// Run the test
testEventricConnection();
