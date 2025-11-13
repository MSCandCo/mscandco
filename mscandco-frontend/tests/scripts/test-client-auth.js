const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Create a client like the browser would (using anon key)
const browserClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testClientAuth() {
  try {
    console.log('\n=== Testing Client-Side Authentication ===\n');

    // Try to sign in as superadmin
    console.log('Signing in as superadmin@mscandco.com...');

    const { data: authData, error: signInError } = await browserClient.auth.signInWithPassword({
      email: 'superadmin@mscandco.com',
      password: 'SuperAdminPassword' // You may need to update this
    });

    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      console.log('\nPlease provide the correct password for superadmin@mscandco.com');
      return;
    }

    console.log('✓ Signed in successfully');
    console.log('User ID:', authData.user.id);

    // Try to access change_requests with the authenticated user
    console.log('\nTrying to access change_requests...');

    const { data: requests, error: requestsError } = await browserClient
      .from('change_requests')
      .select('*')
      .limit(5);

    if (requestsError) {
      console.error('❌ Error accessing change_requests:', requestsError);
      console.log('\nThis is the same error the browser would see!');

      // Check the user's role
      console.log('\nChecking user role...');
      const { data: profile } = await browserClient
        .from('user_profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      console.log('User role from profile:', profile?.role);

      // Try calling get_user_role
      const { data: roleData, error: roleError } = await browserClient
        .rpc('get_user_role', { input_user_id: authData.user.id });

      if (roleError) {
        console.error('Error calling get_user_role:', roleError);
      } else {
        console.log('get_user_role() result:', roleData);
      }

    } else {
      console.log('✓ Successfully accessed change_requests');
      console.log(`  Found ${requests.length} requests`);
      console.log('\nThe RLS policies are working correctly!');
    }

    // Sign out
    await browserClient.auth.signOut();

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testClientAuth();
