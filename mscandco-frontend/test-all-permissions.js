/**
 * Comprehensive Permission Testing with Playwright
 * Tests all pages across all roles (artist, labeladmin, superadmin, admin)
 */

require('dotenv').config({ path: '.env.local' });
const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3013';
const TEST_EMAIL = 'info@htay.co.uk';

// Define all permissions to test grouped by role
const PERMISSIONS_BY_ROLE = {
  artist: [
    { permission: 'artist:dashboard:access', page: '/dashboard', navLabel: 'Dashboard' },
    { permission: 'artist:release:access', page: '/artist/releases', navLabel: 'Releases' },
    { permission: 'artist:analytics:access', page: '/artist/analytics', navLabel: 'Analytics' },
    { permission: 'artist:earnings:access', page: '/artist/earnings', navLabel: 'Earnings' },
    { permission: 'artist:roster:access', page: '/artist/roster', navLabel: 'Roster' },
    { permission: 'artist:messages:access', page: '/artist/messages', navLabel: 'Messages' },
    { permission: 'artist:settings:access', page: '/artist/settings', navLabel: 'Settings' },
    { permission: 'artist:platform:access', page: '/platform', navLabel: 'Platform' },
  ],
  labeladmin: [
    { permission: 'labeladmin:dashboard:access', page: '/labeladmin/dashboard', navLabel: 'Dashboard' },
    { permission: 'labeladmin:releases:access', page: '/labeladmin/releases', navLabel: 'Releases' },
    { permission: 'labeladmin:analytics:access', page: '/labeladmin/analytics', navLabel: 'Analytics' },
    { permission: 'labeladmin:earnings:access', page: '/labeladmin/earnings', navLabel: 'Earnings' },
    { permission: 'labeladmin:roster:access', page: '/labeladmin/roster', navLabel: 'Roster' },
    { permission: 'labeladmin:artists:access', page: '/labeladmin/artists', navLabel: 'Artists' },
    { permission: 'labeladmin:messages:access', page: '/labeladmin/messages', navLabel: 'Messages' },
    { permission: 'labeladmin:settings:access', page: '/labeladmin/settings', navLabel: 'Settings' },
    { permission: 'labeladmin:profile:access', page: '/labeladmin/profile', navLabel: 'Profile' },
  ],
  superadmin: [
    { permission: 'superadmin:dashboard:access', page: '/superadmin/dashboard', navLabel: 'Dashboard' },
    { permission: 'superadmin:messages:access', page: '/superadmin/messages', navLabel: 'Messages' },
    { permission: 'superadmin:permissionsroles:access', page: '/superadmin/permissionsroles', navLabel: 'Permissions & Roles' },
    { permission: 'superadmin:ghost_login:access', page: '/superadmin/ghost-login', navLabel: 'Ghost Login' },
  ],
  admin: [
    { permission: 'users_access:user_management:read', page: '/admin/usermanagement', navLabel: 'User Management' },
    { permission: 'analytics:requests:read', page: '/admin/requests', navLabel: 'Requests' },
    { permission: 'analytics:platform_analytics:read', page: '/admin/platformanalytics', navLabel: 'Platform Analytics' },
    { permission: 'analytics:analytics_management:read', page: '/admin/analyticsmanagement', navLabel: 'Analytics Management' },
    { permission: 'finance:earnings_management:read', page: '/admin/earningsmanagement', navLabel: 'Earnings Management' },
    { permission: 'finance:wallet_management:read', page: '/admin/walletmanagement', navLabel: 'Wallet Management' },
    { permission: 'finance:split_configuration:read', page: '/admin/splitconfiguration', navLabel: 'Split Configuration' },
    { permission: 'content:asset_library:read', page: '/admin/assetlibrary', navLabel: 'Asset Library' },
    { permission: 'content:master_roster:read', page: '/admin/masterroster', navLabel: 'Master Roster' },
    { permission: 'dropdown:platform_messages:read', page: '/admin/messages', navLabel: 'Platform Messages' },
  ],
};

let browser, page, userId;
const results = {
  passed: 0,
  failed: 0,
  details: []
};

async function setupBrowser() {
  browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  page = await context.newPage();

  // Increase timeout for slower operations
  page.setDefaultTimeout(10000);
}

async function login() {
  console.log(`\n🔑 Logging in as ${TEST_EMAIL}...`);

  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForURL(/dashboard/, { timeout: 10000 });

  // Get user ID from session
  const session = await page.evaluate(async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      window.location.origin.includes('localhost')
        ? 'https://szzpivppnlonbsuxtcjf.supabase.co'
        : window.location.origin,
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6enBpdnBwbmxvbmJzdXh0Y2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgxNDcwMzMsImV4cCI6MjA0MzcyMzAzM30.JtCiKi_0uV_EHFqzjnL7cIkDLjm5pQrQGbRGhp47blw'
    );
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  });

  userId = session?.user?.id;
  console.log(`✅ Logged in successfully. User ID: ${userId}`);
}

async function getPermissionId(permissionName) {
  const { data, error } = await supabase
    .from('permissions')
    .select('id')
    .eq('name', permissionName)
    .single();

  if (error) {
    console.error(`Error getting permission ${permissionName}:`, error);
    return null;
  }

  return data?.id;
}

async function removePermission(permissionName) {
  const permissionId = await getPermissionId(permissionName);
  if (!permissionId) return false;

  const { error } = await supabase
    .from('user_permissions')
    .delete()
    .eq('user_id', userId)
    .eq('permission_id', permissionId);

  return !error;
}

async function addPermission(permissionName) {
  const permissionId = await getPermissionId(permissionName);
  if (!permissionId) return false;

  // Check if already exists
  const { data: existing } = await supabase
    .from('user_permissions')
    .select('id')
    .eq('user_id', userId)
    .eq('permission_id', permissionId)
    .single();

  if (existing) return true;

  const { error } = await supabase
    .from('user_permissions')
    .insert([{ user_id: userId, permission_id: permissionId }]);

  return !error;
}

async function testPermission(role, permissionConfig) {
  const { permission, page: pagePath, navLabel } = permissionConfig;

  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 Testing: ${permission}`);
  console.log(`   Role: ${role}`);
  console.log(`   Page: ${pagePath}`);
  console.log(`${'='.repeat(70)}`);

  const testResult = {
    role,
    permission,
    page: pagePath,
    navVisible: false,
    navHiddenWhenRemoved: false,
    pageBlockedWhenRemoved: false,
    navVisibleWhenRestored: false,
    pageAccessibleWhenRestored: false,
    passed: false
  };

  try {
    // Step 1: Check nav link with permission
    console.log(`\n📍 Step 1: Checking nav link WITH permission...`);
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(1000);

    const navLinkVisible = await page.locator(`text="${navLabel}"`).first().isVisible().catch(() => false);
    testResult.navVisible = navLinkVisible;
    console.log(`   Nav link "${navLabel}": ${navLinkVisible ? '✅ VISIBLE' : '❌ NOT VISIBLE'}`);

    // Step 2: Remove permission
    console.log(`\n📍 Step 2: Removing permission from database...`);
    const removed = await removePermission(permission);
    if (!removed) {
      console.log(`   ❌ Failed to remove permission`);
      testResult.error = 'Failed to remove permission';
      results.failed++;
      results.details.push(testResult);
      return;
    }
    console.log(`   ✅ Permission removed`);

    // Trigger permission refresh
    await page.reload();
    await page.waitForTimeout(2000); // Wait for permissions to reload

    const navHidden = !(await page.locator(`text="${navLabel}"`).first().isVisible().catch(() => false));
    testResult.navHiddenWhenRemoved = navHidden;
    console.log(`   Nav link "${navLabel}": ${navHidden ? '✅ HIDDEN (PASS)' : '❌ STILL VISIBLE (FAIL)'}`);

    // Step 3: Test page access WITHOUT permission
    console.log(`\n📍 Step 3: Testing direct page access WITHOUT permission...`);
    await page.goto(`${BASE_URL}${pagePath}`);
    await page.waitForTimeout(1500);

    const currentUrl = page.url();
    console.log(`   Attempted: ${BASE_URL}${pagePath}`);
    console.log(`   Current URL: ${currentUrl}`);

    const blocked = !currentUrl.includes(pagePath);
    testResult.pageBlockedWhenRemoved = blocked;
    console.log(`   Access blocked: ${blocked ? '✅ YES (PASS)' : '❌ NO (FAIL)'}`);

    // Step 4: Restore permission
    console.log(`\n📍 Step 4: Restoring permission...`);
    const restored = await addPermission(permission);
    if (!restored) {
      console.log(`   ❌ Failed to restore permission`);
      testResult.error = 'Failed to restore permission';
      results.failed++;
      results.details.push(testResult);
      return;
    }
    console.log(`   ✅ Permission restored`);

    // Trigger permission refresh
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(2000);

    const navRestored = await page.locator(`text="${navLabel}"`).first().isVisible().catch(() => false);
    testResult.navVisibleWhenRestored = navRestored;
    console.log(`   Nav link "${navLabel}": ${navRestored ? '✅ VISIBLE (PASS)' : '❌ HIDDEN (FAIL)'}`);

    // Step 5: Test page access WITH permission
    console.log(`\n📍 Step 5: Testing direct page access WITH permission...`);
    await page.goto(`${BASE_URL}${pagePath}`);
    await page.waitForTimeout(1500);

    const finalUrl = page.url();
    console.log(`   Attempted: ${BASE_URL}${pagePath}`);
    console.log(`   Current URL: ${finalUrl}`);

    const accessible = finalUrl.includes(pagePath);
    testResult.pageAccessibleWhenRestored = accessible;
    console.log(`   Access granted: ${accessible ? '✅ YES (PASS)' : '❌ NO (FAIL)'}`);

    // Determine if test passed
    testResult.passed = navHidden && blocked && navRestored && accessible;

    console.log(`\n${'='.repeat(70)}`);
    console.log(`Result: ${testResult.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`${'='.repeat(70)}`);

    if (testResult.passed) {
      results.passed++;
    } else {
      results.failed++;
    }

  } catch (error) {
    console.error(`\n❌ Error testing ${permission}:`, error.message);
    testResult.error = error.message;
    results.failed++;
  }

  results.details.push(testResult);
}

async function printSummary() {
  const total = results.passed + results.failed;

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 COMPREHENSIVE PERMISSION TEST SUMMARY`);
  console.log(`${'='.repeat(70)}\n`);

  console.log(`✅ Passed: ${results.passed}/${total}`);
  console.log(`❌ Failed: ${results.failed}/${total}\n`);

  if (results.failed > 0) {
    console.log(`Failed tests:`);
    results.details.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.permission}: ${r.error || 'failed'}`);
      console.log(`     Nav hidden when removed: ${r.navHiddenWhenRemoved ? '✅' : '❌'}`);
      console.log(`     Page blocked when removed: ${r.pageBlockedWhenRemoved ? '✅' : '❌'}`);
      console.log(`     Nav visible when restored: ${r.navVisibleWhenRestored ? '✅' : '❌'}`);
      console.log(`     Page accessible when restored: ${r.pageAccessibleWhenRestored ? '✅' : '❌'}`);
    });
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(results.failed === 0 ? '✅ All tests passed!' : '⚠️  Some tests failed - see details above');
  console.log(`${'='.repeat(70)}\n`);
}

async function runTests() {
  console.log(`\n🚀 Comprehensive Permission Testing with Playwright`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Test Email: ${TEST_EMAIL}\n`);

  await setupBrowser();
  await login();

  // Test each role
  for (const [role, permissions] of Object.entries(PERMISSIONS_BY_ROLE)) {
    console.log(`\n\n${'█'.repeat(70)}`);
    console.log(`Testing ${role.toUpperCase()} permissions (${permissions.length} tests)`);
    console.log(`${'█'.repeat(70)}`);

    for (const permConfig of permissions) {
      await testPermission(role, permConfig);
    }
  }

  await printSummary();
  await browser.close();
}

runTests().catch(console.error);
