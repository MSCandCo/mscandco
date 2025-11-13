/**
 * Permission Testing Script
 * Tests each artist permission by toggling it on/off and checking navigation
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
    console.error(`❌ Error getting permission ${permissionName}:`, error.message);
    return null;
  }

  return data?.id;
}

async function removePermission(userId, permissionId) {
  const { error } = await supabase
    .from('user_permissions')
    .delete()
    .eq('user_id', userId)
    .eq('permission_id', permissionId);

  if (error) {
    console.error('❌ Error removing permission:', error.message);
    return false;
  }

  return true;
}

async function addPermission(userId, permissionId) {
  const { error } = await supabase
    .from('user_permissions')
    .insert({
      user_id: userId,
      permission_id: permissionId
    });

  if (error && error.code !== '23505') { // Ignore duplicate key error
    console.error('❌ Error adding permission:', error.message);
    return false;
  }

  return true;
}

async function testPermission(permission) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testing: ${permission.name}`);
  console.log(`   Page: ${permission.page}`);
  console.log(`   Nav Link: ${permission.nav}`);
  console.log(`${'='.repeat(60)}`);

  // Get permission ID
  const permissionId = await getPermissionId(permission.name);
  if (!permissionId) {
    console.log('❌ Permission not found in database. Skipping.');
    return;
  }

  console.log(`✅ Permission ID: ${permissionId}`);

  // Step 1: Remove the permission
  console.log('\n📍 Step 1: Removing permission...');
  const removed = await removePermission(ARTIST_USER_ID, permissionId);
  if (removed) {
    console.log('✅ Permission removed successfully');
    console.log(`   👉 NOW: Navigate to ${permission.page} - should show 403 or redirect`);
    console.log(`   👉 NOW: Check nav bar - "${permission.nav}" link should be hidden`);
    console.log('\n⏸️  Press Enter when ready to restore permission...');
  } else {
    console.log('❌ Failed to remove permission');
  }

  // Wait for user confirmation
  await new Promise(resolve => {
    process.stdin.once('data', () => resolve());
  });

  // Step 2: Add the permission back
  console.log('\n📍 Step 2: Restoring permission...');
  const added = await addPermission(ARTIST_USER_ID, permissionId);
  if (added) {
    console.log('✅ Permission restored successfully');
    console.log(`   👉 NOW: Refresh ${permission.page} - should load successfully`);
    console.log(`   👉 NOW: Check nav bar - "${permission.nav}" link should be visible`);
    console.log('\n✓ Test complete for this permission');
  } else {
    console.log('❌ Failed to restore permission');
  }

  console.log('\n⏸️  Press Enter to continue to next permission...');
  await new Promise(resolve => {
    process.stdin.once('data', () => resolve());
  });
}

async function main() {
  console.log('\n🚀 Permission Testing Script');
  console.log(`   Testing user: ${ARTIST_EMAIL}`);
  console.log(`   User ID: ${ARTIST_USER_ID}`);
  console.log(`   Total permissions to test: ${PERMISSIONS_TO_TEST.length}\n`);

  console.log('📋 Instructions:');
  console.log('   1. Make sure you are logged in as the artist user in your browser');
  console.log('   2. Have the browser window visible next to this terminal');
  console.log('   3. This script will toggle each permission OFF then ON');
  console.log('   4. You will manually verify the nav link appears/disappears');
  console.log('   5. Press Enter after each verification to continue\n');

  console.log('⏸️  Press Enter to start testing...');
  await new Promise(resolve => {
    process.stdin.once('data', () => resolve());
  });

  // Test each permission
  for (const permission of PERMISSIONS_TO_TEST) {
    await testPermission(permission);
  }

  console.log('\n✅ All permissions tested!');
  console.log('🎉 Testing complete.\n');
  process.exit(0);
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught exception:', error);
  process.exit(1);
});

// Run the script
main();
