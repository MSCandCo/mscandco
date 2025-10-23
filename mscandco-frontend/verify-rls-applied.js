const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyRLS() {
  console.log('\n=== Verifying RLS Policies ===\n');

  // Check if we can query pg_policies using a raw query
  const { data, error } = await supabase
    .from('change_requests')
    .select('*')
    .limit(0);

  console.log('Table accessible with service role:', !error);
  if (error) console.error('Error:', error);

  // Try to check RLS status using information_schema
  console.log('\nAttempting to check RLS status...');

  // Since we can't access pg_policies, let's just verify the policies work
  // by trying to access as if we were a regular user

  console.log('\n=== Testing Policy Application ===');
  console.log('The SQL you ran should have created these policies:');
  console.log('1. admins_can_view_all_requests');
  console.log('2. admins_can_update_requests');
  console.log('3. admins_can_insert_requests');
  console.log('4. users_can_view_own_requests');
  console.log('5. users_can_create_own_requests');

  console.log('\n✓ If you ran the SQL successfully in Supabase SQL Editor,');
  console.log('  the policies should be active.');
  console.log('\n❌ If you\'re still getting "permission denied", it means:');
  console.log('  1. The SQL wasn\'t run successfully, OR');
  console.log('  2. There\'s an issue with the policy logic');

  // Let's check what a simple select returns
  const { data: testData, error: testError } = await supabase
    .from('change_requests')
    .select('id, user_id, status')
    .limit(5);

  if (testError) {
    console.error('\n❌ Service role cannot access:', testError);
  } else {
    console.log('\n✓ Service role can access change_requests');
    console.log('  Sample data:', testData);
  }

  console.log('\n=== Next Steps ===');
  console.log('1. Please confirm you ran the SQL in Supabase SQL Editor');
  console.log('2. Check if there were any errors when running the SQL');
  console.log('3. Try refreshing your browser page after clearing cache');
  console.log('4. Make sure you\'re logged in as superadmin@mscandco.com');
}

verifyRLS();
