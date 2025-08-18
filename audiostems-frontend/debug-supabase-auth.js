const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Debugging Supabase Auth Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('\n❌ Missing required environment variables');
  process.exit(1);
}

// Create admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSupabaseConnection() {
  try {
    console.log('\n🔗 Testing Supabase Connection...');
    
    // Test basic connection
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
    
  } catch (err) {
    console.log('❌ Connection test failed:', err.message);
    return false;
  }
}

async function testAuthService() {
  try {
    console.log('\n🔐 Testing Auth Service...');
    
    // Try to list users (this tests if service role key works)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (error) {
      console.log('❌ Auth service failed:', error.message);
      console.log('Error details:', error);
      return false;
    }
    
    console.log('✅ Auth service working');
    console.log(`📊 Current users in database: ${data.users.length}`);
    return true;
    
  } catch (err) {
    console.log('❌ Auth service test failed:', err.message);
    return false;
  }
}

async function testUserCreation() {
  try {
    console.log('\n👤 Testing User Creation...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`Attempting to create user: ${testEmail}`);
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });
    
    if (error) {
      console.log('❌ User creation failed:', error.message);
      console.log('Error code:', error.status);
      console.log('Error details:', error);
      return false;
    }
    
    console.log('✅ User creation successful!');
    console.log('User ID:', data.user.id);
    
    // Clean up - delete the test user
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    console.log('🧹 Test user cleaned up');
    
    return true;
    
  } catch (err) {
    console.log('❌ User creation test failed:', err.message);
    return false;
  }
}

async function runDiagnostics() {
  console.log('🚀 Starting Supabase Auth Diagnostics...\n');
  
  const connectionOk = await testSupabaseConnection();
  const authOk = await testAuthService();
  const creationOk = await testUserCreation();
  
  console.log('\n📊 Diagnostic Results:');
  console.log('Database Connection:', connectionOk ? '✅' : '❌');
  console.log('Auth Service:', authOk ? '✅' : '❌');
  console.log('User Creation:', creationOk ? '✅' : '❌');
  
  if (connectionOk && authOk && creationOk) {
    console.log('\n🎉 All tests passed! Registration should work.');
  } else {
    console.log('\n🚨 Some tests failed. Check the errors above.');
  }
}

runDiagnostics().catch(console.error);
