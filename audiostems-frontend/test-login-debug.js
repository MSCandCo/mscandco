const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Debugging Supabase Login Issue');
console.log('=====================================');
console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthentication() {
  try {
    console.log('\n🔐 Testing Authentication...');
    
    // 1. Check if we can connect to Supabase
    console.log('1. Testing Supabase connection...');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Failed to get session:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
    }

    // 2. Check if user_profiles table exists
    console.log('\n2. Testing user_profiles table...');
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, role')
      .limit(1);
    
    if (profileError) {
      console.error('❌ user_profiles table error:', profileError.message);
      console.log('📝 You may need to run the database schema: supabase-corrected-business-schema-final.sql');
    } else {
      console.log('✅ user_profiles table accessible');
      console.log('📊 Sample profile count:', profiles?.length || 0);
    }

    // 3. List all users in auth.users (if accessible)
    console.log('\n3. Checking auth users...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('⚠️  Cannot access admin users (normal for anon key)');
    } else {
      console.log('✅ Found users:', users.users?.length || 0);
    }

    // 4. Test a login attempt with dummy credentials
    console.log('\n4. Testing login with test credentials...');
    const testEmail = 'info@htay.co.uk';
    const testPassword = 'password123';
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.log('⚠️  Test login failed (expected if user doesn\'t exist):', loginError.message);
      
      // Check if it's "Invalid login credentials"
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('💡 This suggests auth is working but user doesn\'t exist');
        console.log('🔧 You may need to create test users');
      }
    } else {
      console.log('✅ Test login successful!');
      console.log('👤 User ID:', loginData.user?.id);
      
      // Check if user profile exists
      const { data: userProfile, error: profileErr } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', loginData.user.id)
        .single();
      
      if (profileErr) {
        console.log('⚠️  User authenticated but no profile found:', profileErr.message);
      } else {
        console.log('✅ User profile found:', userProfile.email);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testAuthentication().then(() => {
  console.log('\n🎯 Debug Summary:');
  console.log('================');
  console.log('1. If connection fails: Check environment variables');
  console.log('2. If user_profiles table fails: Run the database schema');
  console.log('3. If login fails with "Invalid credentials": Create test users');
  console.log('4. If login works but profile missing: User needs profile setup');
  console.log('\n🚀 Next steps based on the results above...');
});
