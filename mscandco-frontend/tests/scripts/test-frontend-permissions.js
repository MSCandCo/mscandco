/**
 * Frontend Permission Testing Script
 * Uses Playwright to verify UI responds to permission changes
 */

require('dotenv').config({ path: '.env.local' });
const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ARTIST_USER_ID = '0a060de5-1c94-4060-a1c2-860224fc348d';
const ARTIST_EMAIL = 'info@htay.co.uk';
const ARTIST_PASSWORD = 'TestPass123!';
const BASE_URL = 'http://localhost:3013';

const PERMISSIONS_TO_TEST = [
  {
    name: 'artist:dashboard:access',
    navText: 'Dashboard',
    navSelector: 'a[href*="/dashboard"]',
    pageUrl: '/dashboard'
  },
  {
    name: 'artist:release:access',
    navText: 'Releases',
    navSelector: 'a[href*="/releases"]',
    pageUrl: '/artist/releases'
  },
  {
    name: 'artist:analytics:access',
    navText: 'Analytics',
    navSelector: 'a[href*="/analytics"]',
    pageUrl: '/artist/analytics'
  },
  {
    name: 'artist:earnings:access',
    navText: 'Earnings',
    navSelector: 'a[href*="/earnings"]',
    pageUrl: '/artist/earnings'
  },
  {
    name: 'artist:messages:access',
    navText: 'Messages',
    navSelector: 'a[href*="/messages"]',
    pageUrl: '/artist/messages'
  },
  {
    name: 'artist:roster:access',
    navText: 'Roster',
    navSelector: 'a[href*="/roster"]',
    pageUrl: '/artist/roster'
  },
  {
    name: 'artist:settings:access',
    navText: 'Settings',
    navSelector: 'a[href*="/settings"]',
    pageUrl: '/artist/settings'
  },
  {
    name: 'artist:platform:access',
    navText: 'Platform',
    navSelector: 'a[href*="/platform"]',
    pageUrl: '/platform'
  }
];

async function getPermissionId(permissionName) {
  const { data, error } = await supabase
    .from('permissions')
    .select('id')
    .eq('name', permissionName)
    .single();

  if (error) return null;
  return data?.id;
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

  return !error || error.code === '23505';
}

async function loginArtist(page) {
  console.log('🔑 Logging in as artist...');

  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"]', ARTIST_EMAIL);
  await page.fill('input[type="password"]', ARTIST_PASSWORD);

  // Click and wait for navigation
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);

  // Wait a bit for any redirects
  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  console.log(`   Current URL after login: ${currentUrl}`);

  // If not on dashboard, navigate there
  if (!currentUrl.includes('/dashboard')) {
    console.log('   Not on dashboard, navigating manually...');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
  }

  console.log('✅ Login successful');
}

async function checkNavLinkExists(page, selector, navText) {
  try {
    const link = await page.locator(selector).first();
    const isVisible = await link.isVisible({ timeout: 2000 });
    return isVisible;
  } catch (error) {
    return false;
  }
}

async function testPermission(page, permission) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 Testing: ${permission.name}`);
  console.log(`${'='.repeat(70)}`);

  const permissionId = await getPermissionId(permission.name);
  if (!permissionId) {
    console.log('❌ Permission not found in database');
    return { permission: permission.name, status: 'not_found' };
  }

  console.log(`✅ Permission ID: ${permissionId}`);

  // Step 1: Check nav link exists WITH permission
  console.log(`\n📍 Step 1: Checking nav link WITH permission...`);
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState('networkidle');

  const hasLinkBefore = await checkNavLinkExists(page, permission.navSelector, permission.navText);
  console.log(`   Nav link "${permission.navText}": ${hasLinkBefore ? '✅ VISIBLE' : '❌ NOT VISIBLE'}`);

  // Step 2: Remove permission
  console.log(`\n📍 Step 2: Removing permission from database...`);
  const removed = await removePermission(ARTIST_USER_ID, permissionId);
  if (!removed) {
    console.log('❌ Failed to remove permission');
    return { permission: permission.name, status: 'remove_failed' };
  }
  console.log('✅ Permission removed from database');

  // Refresh page to pick up permission change
  console.log('   Refreshing page...');
  await page.reload();
  await page.waitForLoadState('networkidle');

  const hasLinkAfterRemove = await checkNavLinkExists(page, permission.navSelector, permission.navText);
  console.log(`   Nav link "${permission.navText}": ${hasLinkAfterRemove ? '❌ STILL VISIBLE (FAIL)' : '✅ HIDDEN (PASS)'}`);

  // Step 3: Try to access page directly
  console.log(`\n📍 Step 3: Testing direct page access WITHOUT permission...`);
  await page.goto(`${BASE_URL}${permission.pageUrl}`);
  await page.waitForLoadState('networkidle');

  const currentUrl = page.url();
  const isBlocked = !currentUrl.includes(permission.pageUrl) || currentUrl.includes('/login') || currentUrl.includes('/dashboard');
  console.log(`   Attempted: ${BASE_URL}${permission.pageUrl}`);
  console.log(`   Current URL: ${currentUrl}`);
  console.log(`   Access blocked: ${isBlocked ? '✅ YES (PASS)' : '❌ NO (FAIL)'}`);

  // Step 4: Restore permission
  console.log(`\n📍 Step 4: Restoring permission...`);
  const added = await addPermission(ARTIST_USER_ID, permissionId);
  if (!added) {
    console.log('❌ Failed to restore permission');
    return { permission: permission.name, status: 'restore_failed' };
  }
  console.log('✅ Permission restored in database');

  // Refresh to pick up restored permission
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState('networkidle');

  const hasLinkAfterRestore = await checkNavLinkExists(page, permission.navSelector, permission.navText);
  console.log(`   Nav link "${permission.navText}": ${hasLinkAfterRestore ? '✅ VISIBLE (PASS)' : '❌ HIDDEN (FAIL)'}`);

  // Step 5: Test page access WITH permission
  console.log(`\n📍 Step 5: Testing direct page access WITH permission...`);
  await page.goto(`${BASE_URL}${permission.pageUrl}`);
  await page.waitForLoadState('networkidle');

  const finalUrl = page.url();
  const canAccess = finalUrl.includes(permission.pageUrl);
  console.log(`   Attempted: ${BASE_URL}${permission.pageUrl}`);
  console.log(`   Current URL: ${finalUrl}`);
  console.log(`   Access granted: ${canAccess ? '✅ YES (PASS)' : '❌ NO (FAIL)'}`);

  // Determine overall result
  const navHiddenWhenRemoved = !hasLinkAfterRemove;
  const pageBlockedWhenRemoved = isBlocked;
  const navVisibleWhenRestored = hasLinkAfterRestore;
  const pageAccessibleWhenRestored = canAccess;

  const allPassed = navHiddenWhenRemoved && pageBlockedWhenRemoved && navVisibleWhenRestored && pageAccessibleWhenRestored;

  console.log(`\n${'='.repeat(70)}`);
  console.log(`Result: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`${'='.repeat(70)}`);

  return {
    permission: permission.name,
    status: allPassed ? 'passed' : 'failed',
    details: {
      navHiddenWhenRemoved,
      pageBlockedWhenRemoved,
      navVisibleWhenRestored,
      pageAccessibleWhenRestored
    }
  };
}

async function main() {
  console.log('\n🚀 Frontend Permission Testing with Playwright');
  console.log(`   Testing user: ${ARTIST_EMAIL}`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Total permissions to test: ${PERMISSIONS_TO_TEST.length}\n`);

  const browser = await chromium.launch({
    headless: false,  // Show browser so you can see what's happening
    slowMo: 100 // Slow down operations for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Login once
    await loginArtist(page);

    const results = [];

    // Test each permission
    for (const permission of PERMISSIONS_TO_TEST) {
      const result = await testPermission(page, permission);
      results.push(result);

      // Small delay between tests
      await page.waitForTimeout(1000);
    }

    // Print summary
    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 FRONTEND TEST SUMMARY');
    console.log(`${'='.repeat(70)}\n`);

    const passed = results.filter(r => r.status === 'passed');
    const failed = results.filter(r => r.status !== 'passed');

    console.log(`✅ Passed: ${passed.length}/${results.length}`);
    if (failed.length > 0) {
      console.log(`❌ Failed: ${failed.length}/${results.length}`);
      console.log(`\nFailed tests:`);
      failed.forEach(r => {
        console.log(`   - ${r.permission}: ${r.status}`);
        if (r.details) {
          console.log(`     Nav hidden when removed: ${r.details.navHiddenWhenRemoved ? '✅' : '❌'}`);
          console.log(`     Page blocked when removed: ${r.details.pageBlockedWhenRemoved ? '✅' : '❌'}`);
          console.log(`     Nav visible when restored: ${r.details.navVisibleWhenRestored ? '✅' : '❌'}`);
          console.log(`     Page accessible when restored: ${r.details.pageAccessibleWhenRestored ? '✅' : '❌'}`);
        }
      });
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(failed.length === 0 ? '🎉 All tests passed!' : '⚠️  Some tests failed - see details above');
    console.log(`${'='.repeat(70)}\n`);

    await browser.close();
    process.exit(failed.length > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Test error:', error);
    await browser.close();
    process.exit(1);
  }
}

main();
