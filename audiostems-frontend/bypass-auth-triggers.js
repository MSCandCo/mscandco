const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDirectUserCreation() {
  console.log('🔍 Testing direct user creation without profile triggers...\n');
  
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`Attempting to create user: ${testEmail}`);
    
    // Try creating user with minimal data to avoid trigger issues
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        skip_profile_creation: true // Flag to potentially skip triggers
      }
    });
    
    if (error) {
      console.log('❌ User creation failed:', error.message);
      console.log('Error details:', error);
      
      // Try alternative approach - create user without auto-confirm
      console.log('\n🔄 Trying without auto-confirm...');
      
      const { data: data2, error: error2 } = await supabaseAdmin.auth.admin.createUser({
        email: `alt-${testEmail}`,
        password: testPassword,
        email_confirm: false
      });
      
      if (error2) {
        console.log('❌ Alternative approach also failed:', error2.message);
      } else {
        console.log('✅ Alternative approach worked!');
        console.log('User ID:', data2.user.id);
        
        // Clean up
        await supabaseAdmin.auth.admin.deleteUser(data2.user.id);
        console.log('🧹 Test user cleaned up');
      }
      
      return false;
    }
    
    console.log('✅ User creation successful!');
    console.log('User ID:', data.user.id);
    
    // Clean up
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    console.log('🧹 Test user cleaned up');
    
    return true;
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
    return false;
  }
}

async function checkAuthConfiguration() {
  console.log('🔍 Checking Auth configuration...\n');
  
  try {
    // Check if we can list users (tests service role)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (error) {
      console.log('❌ Cannot list users:', error.message);
      return false;
    }
    
    console.log('✅ Service role working');
    console.log(`📊 Current users: ${data.users.length}`);
    
    return true;
    
  } catch (err) {
    console.log('❌ Auth configuration error:', err.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Running comprehensive auth tests...\n');
  
  const configOk = await checkAuthConfiguration();
  const creationOk = await testDirectUserCreation();
  
  console.log('\n📊 Test Results:');
  console.log('Auth Configuration:', configOk ? '✅' : '❌');
  console.log('User Creation:', creationOk ? '✅' : '❌');
  
  if (!creationOk) {
    console.log('\n💡 Possible solutions:');
    console.log('1. Check Supabase Auth settings for automatic profile creation');
    console.log('2. Disable Auth triggers temporarily');
    console.log('3. Check database logs in Supabase dashboard');
    console.log('4. Try creating users manually in Supabase Auth dashboard');
  }
}

runTests().catch(console.error);
