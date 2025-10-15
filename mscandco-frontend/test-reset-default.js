/**
 * Playwright Test: Reset to Default Functionality
 * Tests the actual UI behavior of clicking "Reset to Default" button
 */

require('dotenv').config({ path: '.env.local' });
const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testResetDefault() {
  console.log('\n🧪 Testing Reset to Default UI Functionality\n');
  console.log('='.repeat(70));

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to console logs
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`   [Browser ${type}]:`, msg.text());
    }
  });

  // Listen to page errors
  page.on('pageerror', error => {
    console.log(`   [Browser error]:`, error.message);
  });

  try {
    // Step 1: Get artist role info from database
    console.log('\n📊 Step 1: Checking artist role in database...');
    const { data: artistRole } = await supabase
      .from('roles')
      .select('id, name')
      .eq('name', 'artist')
      .single();

    const { data: rolePermsBefore } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', artistRole.id);

    console.log(`   ✅ Artist role has ${rolePermsBefore?.length} default permissions in database`);

    // Step 2: Get superadmin credentials
    console.log('\n🔐 Step 2: Getting superadmin credentials...');
    const { data: superAdmin } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('role', 'super_admin')
      .single();

    if (!superAdmin) {
      console.error('   ❌ No superadmin user found');
      return;
    }

    // Get auth user to get the actual email
    const { data: authUser } = await supabase.auth.admin.listUsers();
    const superAdminAuth = authUser.users.find(u => u.email === superAdmin.email);

    console.log(`   ✅ Found superadmin: ${superAdmin.email}`);

    // Step 3: Navigate to login page
    console.log('\n🌐 Step 3: Navigating to login page...');
    await page.goto('http://localhost:3013/login');
    await page.waitForLoadState('networkidle');
    console.log('   ✅ Login page loaded');

    // Step 4: Login as superadmin
    console.log('\n🔑 Step 4: Logging in as superadmin...');
    await page.fill('input[type="email"]', superAdmin.email);
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('   ✅ Logged in successfully');

    // Step 5: Navigate to Permissions & Roles page
    console.log('\n📋 Step 5: Navigating to Permissions & Roles page...');
    await page.goto('http://localhost:3013/superadmin/permissionsroles', { waitUntil: 'networkidle' });

    // Force a hard reload to bypass cache and get the latest JavaScript
    console.log('   Performing hard reload to get latest code...');
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for the loading spinner to disappear
    console.log('   Waiting for page to finish loading...');
    await page.waitForSelector('text=Loading permissions...', { state: 'hidden', timeout: 15000 });
    await page.waitForTimeout(2000);
    console.log('   ✅ Permissions & Roles page loaded');

    // Take screenshot of initial state
    await page.screenshot({ path: 'test-screenshots/before-select-role.png', fullPage: true });
    console.log('   📸 Screenshot saved: before-select-role.png');

    // Step 6: Select artist role by clicking its button
    console.log('\n🎭 Step 6: Selecting artist role...');

    // Wait for roles section to load
    await page.waitForSelector('text=System Roles', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Get page content to see what's available
    const pageHTML = await page.content();

    // Try to find and click the ARTIST button - the text includes "permissions" count
    const artistButton = await page.$('button:has-text("ARTIST")');

    if (!artistButton) {
      console.log('   ⚠️  Could not find ARTIST button directly, searching in HTML...');
      // List all buttons on the page
      const allButtons = await page.$$('button');
      console.log(`   Found ${allButtons.length} total buttons`);

      for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
        const buttonText = await allButtons[i].textContent();
        console.log(`   Button ${i}: ${buttonText?.trim()}`);
      }

      throw new Error('ARTIST button not found');
    }

    await artistButton.click();
    await page.waitForTimeout(2000);
    console.log('   ✅ Artist role selected');

    // Take screenshot after selecting role
    await page.screenshot({ path: 'test-screenshots/after-select-artist.png', fullPage: true });
    console.log('   📸 Screenshot saved: after-select-artist.png');

    // Step 7: Check permission count displayed in UI
    console.log('\n🔍 Step 7: Checking permission count in UI...');

    // Get the permission count from the role header
    const permissionCountText = await page.textContent('text=/\\d+ permissions assigned/');
    console.log(`   Permission count text: ${permissionCountText}`);

    const permissionCount = parseInt(permissionCountText.match(/(\d+) permissions/)[1]);
    console.log(`   ✅ UI shows ${permissionCount} permissions assigned`);

    // Step 8: Click "Reset to Default" button
    console.log('\n🔄 Step 8: Clicking "Reset to Default" button...');

    // Find the reset button - try multiple selectors
    let resetButton = await page.$('button:has-text("Reset to Default")');
    if (!resetButton) {
      resetButton = await page.$('button:has-text("Reset")');
    }
    if (!resetButton) {
      resetButton = await page.$('[class*="reset"]');
    }

    if (!resetButton) {
      console.error('   ❌ Could not find Reset to Default button');
      await page.screenshot({ path: 'test-screenshots/no-reset-button.png', fullPage: true });
      console.log('   📸 Screenshot saved: no-reset-button.png');
      return;
    }

    // Take screenshot before clicking
    await page.screenshot({ path: 'test-screenshots/before-reset.png', fullPage: true });
    console.log('   📸 Screenshot saved: before-reset.png');

    // Click the reset button
    await resetButton.click();
    console.log('   ✅ Clicked Reset to Default button');

    // Wait for any API calls to complete
    await page.waitForTimeout(3000);

    // Step 9: Check permission count after reset
    console.log('\n📊 Step 9: Checking permission count after reset...');

    // Wait for the UI to update
    await page.waitForTimeout(2000);

    const permissionCountTextAfter = await page.textContent('text=/\\d+ permissions assigned/');
    console.log(`   Permission count text after reset: ${permissionCountTextAfter}`);

    const permissionCountAfter = parseInt(permissionCountTextAfter.match(/(\d+) permissions/)[1]);
    console.log(`   UI shows ${permissionCountAfter} permissions assigned after reset`);

    // Take screenshot after reset
    await page.screenshot({ path: 'test-screenshots/after-reset.png', fullPage: true });
    console.log('   📸 Screenshot saved: after-reset.png');

    // Step 10: Verify database state after reset
    console.log('\n🗄️  Step 10: Verifying database state after reset...');

    const { data: rolePermsAfter } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', artistRole.id);

    console.log(`   Database shows ${rolePermsAfter?.length} role permissions`);

    const { data: artistUsers } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', 'artist');

    if (artistUsers && artistUsers.length > 0) {
      const { data: userPerms } = await supabase
        .from('user_permissions')
        .select('permission_id')
        .eq('user_id', artistUsers[0].id);

      console.log(`   Database shows ${userPerms?.length || 0} user-specific overrides`);
    }

    // Step 11: Analysis
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESULTS ANALYSIS:');
    console.log('='.repeat(70));
    console.log(`Database role permissions BEFORE reset: ${rolePermsBefore?.length}`);
    console.log(`Database role permissions AFTER reset: ${rolePermsAfter?.length}`);
    console.log(`UI permissions BEFORE reset: ${permissionCount}`);
    console.log(`UI permissions AFTER reset: ${permissionCountAfter}`);
    console.log(`Expected after reset: 9 permissions`);

    if (permissionCountAfter === 9) {
      console.log('\n✅ SUCCESS: Reset to Default is working correctly!');
    } else if (permissionCountAfter === 0) {
      console.log('\n❌ BUG FOUND: Reset to Default is clearing all permissions in UI');
      console.log('   The database has the correct permissions, but the UI is not displaying them');
      console.log('   Root cause: Frontend is not properly refetching role permissions after reset');
    } else {
      console.log(`\n⚠️  UNEXPECTED: UI shows ${permissionCountAfter} permissions (expected 9)`);
      console.log(`   Database shows ${rolePermsAfter?.length} permissions`);
      if (rolePermsAfter?.length === 9 && permissionCountAfter !== 9) {
        console.log('   ❌ BUG: Database is correct but UI is not reflecting the correct count');
      }
    }

    console.log('\n📸 Screenshots saved to test-screenshots/ directory');
    console.log('   - before-select-role.png');
    console.log('   - after-select-artist.png');
    console.log('   - before-reset.png');
    console.log('   - after-reset.png');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await page.screenshot({ path: 'test-screenshots/error.png', fullPage: true });
    console.log('   📸 Error screenshot saved: error.png');
  } finally {
    console.log('\n⏸️  Pausing for 5 seconds before closing browser...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('test-screenshots')) {
  fs.mkdirSync('test-screenshots');
}

testResetDefault().catch(console.error);
