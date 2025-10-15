/**
 * Automated Permission Testing Script
 * Tests each artist permission by toggling it on/off automatically
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ARTIST_USER_ID = '0a060de5-1c94-4060-a1c2-860224fc348d';
const ARTIST_EMAIL = 'info@htay.co.uk';

const PERMISSIONS_TO_TEST = [
  { name: 'artist:dashboard:access', page: '/dashboard', nav: 'Dashboard' },
  { name: 'artist:release:access', page: '/artist/releases', nav: 'Releases' },
  { name: 'artist:analytics:access', page: '/artist/analytics', nav: 'Analytics' },
  { name: 'artist:earnings:access', page: '/artist/earnings', nav: 'Earnings' },
  { name: 'artist:messages:access', page: '/artist/messages', nav: 'Messages' },
  { name: 'artist:roster:access', page: '/artist/roster', nav: 'Roster' },
  { name: 'artist:settings:access', page: '/artist/settings', nav: 'Settings' },
  { name: 'artist:platform:access', page: '/platform', nav: 'Platform' }
];

async function getPermissionId(permissionName) {
  const { data, error } = await supabase
    .from('permissions')
    .select('id')
    .eq('name', permissionName)
    .single();

  if (error) {
    return null;
  }

  return data?.id;
}

async function hasUserPermission(userId, permissionId) {
  const { data, error } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('user_id', userId)
    .eq('permission_id', permissionId)
    .single();

  return !!data && !error;
}

async function removePermission(userId, permissionId) {
  const { error } = await supabase
    .from('user_permissions')
    .delete()
    .eq('user_id', userId)
    .eq('permission_id', permissionId);

  return !error;
}

async function addPermission(userId, permissionId) {
  const { error } = await supabase
    .from('user_permissions')
    .insert({
      user_id: userId,
      permission_id: permissionId
    });

  return !error || error.code === '23505'; // Success or already exists
}

async function testPermission(permission) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 Testing: ${permission.name}`);
  console.log(`${'='.repeat(70)}`);

  // Get permission ID
  const permissionId = await getPermissionId(permission.name);
  if (!permissionId) {
    console.log('❌ Permission not found in database. Skipping.\n');
    return { permission: permission.name, status: 'not_found' };
  }

  console.log(`✅ Permission ID: ${permissionId}`);

  // Check initial state
  const hasPermissionBefore = await hasUserPermission(ARTIST_USER_ID, permissionId);
  console.log(`📊 Initial state: User ${hasPermissionBefore ? 'HAS' : 'DOES NOT HAVE'} permission`);

  // Test removing permission
  console.log(`\n📍 Test 1: Removing permission...`);
  const removed = await removePermission(ARTIST_USER_ID, permissionId);
  if (removed) {
    console.log(`✅ Permission removed`);
    const hasAfterRemove = await hasUserPermission(ARTIST_USER_ID, permissionId);
    if (!hasAfterRemove) {
      console.log(`✓ Verified: User no longer has permission`);
      console.log(`   Expected behavior:`);
      console.log(`   - Nav link "${permission.nav}" should disappear`);
      console.log(`   - Page ${permission.page} should return 403 or redirect`);
    } else {
      console.log(`❌ ERROR: Permission still exists after removal!`);
      return { permission: permission.name, status: 'remove_failed' };
    }
  } else {
    console.log(`❌ Failed to remove permission`);
    return { permission: permission.name, status: 'remove_error' };
  }

  // Wait a moment for database replication
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test adding permission back
  console.log(`\n📍 Test 2: Restoring permission...`);
  const added = await addPermission(ARTIST_USER_ID, permissionId);
  if (added) {
    console.log(`✅ Permission restored`);
    const hasAfterAdd = await hasUserPermission(ARTIST_USER_ID, permissionId);
    if (hasAfterAdd) {
      console.log(`✓ Verified: User now has permission`);
      console.log(`   Expected behavior:`);
      console.log(`   - Nav link "${permission.nav}" should reappear`);
      console.log(`   - Page ${permission.page} should load successfully`);
    } else {
      console.log(`❌ ERROR: Permission doesn't exist after adding!`);
      return { permission: permission.name, status: 'add_failed' };
    }
  } else {
    console.log(`❌ Failed to restore permission`);
    return { permission: permission.name, status: 'add_error' };
  }

  console.log(`\n✅ Test passed for ${permission.name}`);
  return { permission: permission.name, status: 'passed' };
}

async function main() {
  console.log('\n🚀 Automated Permission Testing Script');
  console.log(`   Testing user: ${ARTIST_EMAIL}`);
  console.log(`   User ID: ${ARTIST_USER_ID}`);
  console.log(`   Total permissions to test: ${PERMISSIONS_TO_TEST.length}\n`);

  const results = [];

  // Test each permission
  for (const permission of PERMISSIONS_TO_TEST) {
    const result = await testPermission(permission);
    results.push(result);

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Print summary
  console.log(`\n${'='.repeat(70)}`);
  console.log('📊 TEST SUMMARY');
  console.log(`${'='.repeat(70)}\n`);

  const passed = results.filter(r => r.status === 'passed');
  const failed = results.filter(r => r.status !== 'passed');

  console.log(`✅ Passed: ${passed.length}/${results.length}`);
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}/${results.length}`);
    console.log(`\nFailed tests:`);
    failed.forEach(r => {
      console.log(`   - ${r.permission}: ${r.status}`);
    });
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log('🎉 Testing complete!\n');

  process.exit(failed.length > 0 ? 1 : 0);
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught exception:', error);
  process.exit(1);
});

// Run the script
main();
