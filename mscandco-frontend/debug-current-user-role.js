const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugCurrentUser() {
  try {
    console.log('\n=== Debugging Current User Role ===\n');

    // Get all users to find the one we're testing with
    const { data: { users } } = await supabase.auth.admin.listUsers();

    console.log('Available users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
    });

    // Let's check the first user (likely the one logged in)
    const testUser = users[0];
    console.log(`\n--- Testing with: ${testUser.email} ---`);

    // Check user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, role, first_name, last_name')
      .eq('id', testUser.id)
      .single();

    console.log('\nUser Profile:');
    console.log(profile);
    if (profileError) console.error('Profile Error:', profileError);

    // Test get_user_role() function
    const { data: roleData, error: roleError } = await supabase
      .rpc('get_user_role', { input_user_id: testUser.id });

    console.log('\nget_user_role() result:', roleData);
    if (roleError) console.error('get_user_role Error:', roleError);

    // Try to select from change_requests with this user's credentials
    console.log('\n--- Testing change_requests access ---');

    const { data: requests, error: requestsError } = await supabase
      .from('change_requests')
      .select('*')
      .limit(1);

    if (requestsError) {
      console.error('Error accessing change_requests:', requestsError);
    } else {
      console.log('Successfully accessed change_requests:', requests?.length || 0, 'rows');
    }

    // Check current RLS policies
    console.log('\n--- Checking RLS Policies ---');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'change_requests');

    if (policiesError) {
      console.error('Error fetching policies:', policiesError);
    } else {
      console.log('RLS Policies for change_requests:');
      policies.forEach(policy => {
        console.log(`- ${policy.policyname}: ${policy.cmd} (${policy.permissive})`);
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

debugCurrentUser();
