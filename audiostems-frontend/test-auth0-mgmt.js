const { ManagementClient } = require('auth0');
require('dotenv').config({ path: '.env.local' });

async function testAuth0ManagementAPI() {
  console.log('=== Auth0 Management API Test ===');
  
  // Log environment variables (without revealing secrets)
  console.log('AUTH0_DOMAIN:', process.env.AUTH0_DOMAIN);
  console.log('AUTH0_MGMT_CLIENT_ID:', process.env.AUTH0_MGMT_CLIENT_ID ? 'SET' : 'NOT SET');
  console.log('AUTH0_MGMT_CLIENT_SECRET:', process.env.AUTH0_MGMT_CLIENT_SECRET ? 'SET' : 'NOT SET');
  
  if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_MGMT_CLIENT_ID || !process.env.AUTH0_MGMT_CLIENT_SECRET) {
    console.error('❌ Missing required environment variables');
    return;
  }

  try {
    // Create Management Client
    const management = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_MGMT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET,
      scope: 'read:users create:users update:users delete:users read:roles assign:roles'
    });

    console.log('\n🔍 Testing Management API connection...');
    
    // Test 1: Try to get users (this should work if credentials are valid)
    console.log('\n📋 Test 1: Getting users list...');
    const users = await management.users.getAll({ per_page: 1 });
    console.log('✅ Successfully connected to Management API');
    console.log('📊 Found users:', users.length);
    
    // Test 2: Try to get applications
    console.log('\n📋 Test 2: Getting applications...');
    const apps = await management.clients.getAll({ per_page: 5 });
    console.log('✅ Successfully retrieved applications');
    console.log('📊 Found applications:', apps.length);
    
    // Test 3: Check if we can create users (this will fail if missing create:users scope)
    console.log('\n📋 Test 3: Testing user creation permissions...');
    try {
      // This will fail, but we want to see the specific error
      await management.users.create({
        email: 'test@example.com',
        password: 'TestPassword123!',
        connection: 'Username-Password-Authentication'
      });
    } catch (error) {
      if (error.message.includes('Unauthorized') || error.message.includes('access_denied')) {
        console.log('❌ User creation failed - likely missing create:users scope');
        console.log('🔧 Error:', error.message);
      } else {
        console.log('✅ User creation test passed (expected to fail with different error)');
      }
    }
    
    console.log('\n✅ Management API connection test completed successfully!');
    console.log('💡 If you see "missing create:users scope" error, you need to enable that scope in Auth0 dashboard.');
    
  } catch (error) {
    console.error('\n❌ Management API connection failed:');
    console.error('Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Body:', error.body);
    
    if (error.message.includes('Unauthorized')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check that your AUTH0_MGMT_CLIENT_ID and AUTH0_MGMT_CLIENT_SECRET are correct');
      console.log('2. Verify the Machine-to-Machine application is authorized for "Auth0 Management API"');
      console.log('3. Ensure the required scopes are enabled in Auth0 dashboard');
    }
  }
}

testAuth0ManagementAPI().catch(console.error); 