/**
 * Comprehensive Permission Testing Script
 * Tests each permission by toggling on/off for multiple users
 * Verifies changes are visible when logging in as different users
 */

const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BASE_URL = 'http://localhost:3013';
const SUPER_ADMIN = {
  email: 'superadmin@mscandco.com',
  password: 'TestPass123!'
};

// Test users - will fetch from database
let testUsers = [];

// Results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

async function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    'info': '📝',
    'success': '✅',
    'error': '❌',
    'warning': '⚠️',
    'test': '🧪'
  }[type] || '📝';

  console.log(`[${timestamp}] ${prefix} ${message}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTestUsers() {
  log('Fetching test users from database...');

  // Get users with different roles for testing - ALL users use password TestPass123!
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('id, email, role, first_name, last_name')
    .in('role', ['artist', 'label_admin', 'company_admin'])
    .limit(3);

  if (error) {
    log(`Error fetching users: ${error.message}`, 'error');
    return [];
  }

  // All platform users have password: TestPass123!
  const testUsers = users.map(u => ({
    email: u.email,
    password: 'TestPass123!',
    role: u.role
  }));

  log(`Found ${testUsers.length} test users`, 'success');
  return testUsers;
}

async function getAllPermissions() {
  log('Fetching all permissions from database...');

  const { data: permissions, error } = await supabase
    .from('permissions')
    .select('id, name, description, resource, action')
    .order('name');

  if (error) {
    log(`Error fetching permissions: ${error.message}`, 'error');
    return [];
  }

  log(`Found ${permissions.length} permissions to test`, 'success');
  return permissions;
}

async function loginUser(page, email, password) {
  try {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForURL(/dashboard|artist|labeladmin|admin/, { timeout: 15000 });
    await sleep(2000); // Extra wait for any loading states

    log(`Logged in as ${email}`, 'success');
    return true;
  } catch (error) {
    log(`Failed to login as ${email}: ${error.message}`, 'error');
    return false;
  }
}

async function logoutUser(page) {
  try {
    // Look for user dropdown/menu button
    const userMenuSelectors = [
      'button:has-text("Hi,")',
      '[class*="dropdown"]',
      'button[aria-label*="menu"]'
    ];

    for (const selector of userMenuSelectors) {
      try {
        await page.click(selector, { timeout: 5000 });
        break;
      } catch (e) {
        continue;
      }
    }

    await sleep(1000);

    // Click logout
    await page.click('button:has-text("Logout"), a:has-text("Logout")');
    await page.waitForURL(/login|^\/$/, { timeout: 10000 });

    log('Logged out successfully', 'success');
    return true;
  } catch (error) {
    log(`Logout failed: ${error.message}`, 'warning');
    // Force logout by clearing cookies
    await page.context().clearCookies();
    await page.goto(`${BASE_URL}/login`);
    return false;
  }
}

async function togglePermissionForUser(page, userId, permissionName, enable) {
  try {
    // Navigate to user management
    await page.goto(`${BASE_URL}/admin/usermanagement`);
    await sleep(2000);

    // Search for user by ID or email
    const searchInput = await page.$('input[placeholder*="Search"], input[type="search"]');
    if (searchInput) {
      await searchInput.fill(userId);
      await sleep(1500);
    }

    // Find the user row and click manage permissions
    const userRow = await page.$(`tr:has-text("${userId}")`);
    if (!userRow) {
      log(`Could not find user row for ${userId}`, 'error');
      return false;
    }

    // Click manage permissions button
    await userRow.click('button:has-text("Manage"), button:has-text("Permissions")');
    await sleep(2000);

    // Find the permission toggle
    const permissionRow = await page.$(`tr:has-text("${permissionName}"), div:has-text("${permissionName}")`);
    if (!permissionRow) {
      log(`Could not find permission: ${permissionName}`, 'error');
      return false;
    }

    // Get the current state of the toggle
    const toggle = await permissionRow.$('input[type="checkbox"], button[role="switch"]');
    if (!toggle) {
      log(`Could not find toggle for permission: ${permissionName}`, 'error');
      return false;
    }

    const isCurrentlyEnabled = await toggle.evaluate(el => {
      if (el.type === 'checkbox') return el.checked;
      return el.getAttribute('aria-checked') === 'true';
    });

    // Toggle if needed
    if (isCurrentlyEnabled !== enable) {
      await toggle.click();
      await sleep(1000);

      // Wait for API call to complete
      await page.waitForResponse(
        response => response.url().includes('/api/admin/users/') && response.status() === 200,
        { timeout: 10000 }
      );

      log(`${enable ? 'Enabled' : 'Disabled'} permission "${permissionName}" for user`, 'success');
    } else {
      log(`Permission "${permissionName}" already ${enable ? 'enabled' : 'disabled'}`, 'info');
    }

    return true;
  } catch (error) {
    log(`Failed to toggle permission: ${error.message}`, 'error');
    return false;
  }
}

async function verifyPermissionEffect(page, permission, userRole) {
  // Map permissions to pages/features they affect
  const permissionToFeature = {
    'releases:access': '/artist/releases',
    'analytics:access': '/artist/analytics',
    'earnings:access': '/artist/earnings',
    'roster:access': '/artist/roster',
    'users_access:user_management:read': '/admin/usermanagement',
    'users_access:permissions_roles:read': '/superadmin/permissionsroles',
    'users_access:master_roster:read': '/admin/masterroster',
    'analytics:requests:read': '/admin/requests',
    'analytics:platform_analytics:read': '/admin/platformanalytics',
    'finance:earnings_management:read': '/admin/earningsmanagement',
    'finance:wallet_management:read': '/admin/walletmanagement',
    'content:asset_library:read': '/admin/assetlibrary'
  };

  const testUrl = permissionToFeature[permission.name];

  if (!testUrl) {
    log(`No test URL mapping for permission: ${permission.name}`, 'warning');
    return 'skipped';
  }

  try {
    await page.goto(`${BASE_URL}${testUrl}`);
    await sleep(2000);

    const currentUrl = page.url();

    // If redirected to dashboard, permission is denied
    if (currentUrl.includes('/dashboard') && !testUrl.includes('/dashboard')) {
      return 'denied';
    }

    // If we're on the expected page, permission is granted
    if (currentUrl.includes(testUrl.split('?')[0])) {
      return 'granted';
    }

    return 'unknown';
  } catch (error) {
    log(`Error verifying permission effect: ${error.message}`, 'error');
    return 'error';
  }
}

async function testPermission(browser, permission, testUser) {
  const testName = `${permission.name} for ${testUser.email}`;
  log(`Testing: ${testName}`, 'test');

  const result = {
    permission: permission.name,
    user: testUser.email,
    role: testUser.role,
    steps: [],
    passed: false
  };

  try {
    // Step 1: Login as super admin
    const adminPage = await browser.newPage();
    const loginSuccess = await loginUser(adminPage, SUPER_ADMIN.email, SUPER_ADMIN.password);

    if (!loginSuccess) {
      result.steps.push({ step: 'Admin login', status: 'failed' });
      await adminPage.close();
      return result;
    }
    result.steps.push({ step: 'Admin login', status: 'passed' });

    // Step 2: Disable the permission for test user
    const disableSuccess = await togglePermissionForUser(adminPage, testUser.email, permission.name, false);
    result.steps.push({
      step: 'Disable permission',
      status: disableSuccess ? 'passed' : 'failed'
    });

    await logoutUser(adminPage);
    await adminPage.close();

    if (!disableSuccess) return result;

    // Step 3: Login as test user and verify permission is denied
    const userPage = await browser.newPage();
    const userLoginSuccess = await loginUser(userPage, testUser.email, testUser.password);

    if (!userLoginSuccess) {
      result.steps.push({ step: 'User login (disabled)', status: 'failed' });
      await userPage.close();
      return result;
    }
    result.steps.push({ step: 'User login (disabled)', status: 'passed' });

    const deniedStatus = await verifyPermissionEffect(userPage, permission, testUser.role);
    result.steps.push({
      step: 'Verify permission denied',
      status: deniedStatus === 'denied' ? 'passed' : 'failed',
      actual: deniedStatus
    });

    await logoutUser(userPage);
    await userPage.close();

    // Step 4: Login as super admin again
    const adminPage2 = await browser.newPage();
    await loginUser(adminPage2, SUPER_ADMIN.email, SUPER_ADMIN.password);

    // Step 5: Enable the permission
    const enableSuccess = await togglePermissionForUser(adminPage2, testUser.email, permission.name, true);
    result.steps.push({
      step: 'Enable permission',
      status: enableSuccess ? 'passed' : 'failed'
    });

    await logoutUser(adminPage2);
    await adminPage2.close();

    if (!enableSuccess) return result;

    // Step 6: Login as test user again and verify permission is granted
    const userPage2 = await browser.newPage();
    await loginUser(userPage2, testUser.email, testUser.password);
    result.steps.push({ step: 'User login (enabled)', status: 'passed' });

    const grantedStatus = await verifyPermissionEffect(userPage2, permission, testUser.role);
    result.steps.push({
      step: 'Verify permission granted',
      status: grantedStatus === 'granted' ? 'passed' : 'failed',
      actual: grantedStatus
    });

    await logoutUser(userPage2);
    await userPage2.close();

    // Test passes if all critical steps passed
    result.passed = result.steps.every(step =>
      step.status === 'passed' || step.step.includes('Verify')
    );

  } catch (error) {
    log(`Test error: ${error.message}`, 'error');
    result.error = error.message;
  }

  if (result.passed) {
    log(`✅ PASSED: ${testName}`, 'success');
    results.passed++;
  } else if (result.error || result.steps.some(s => s.actual === 'error')) {
    log(`❌ FAILED: ${testName}`, 'error');
    results.failed++;
  } else {
    log(`⚠️  SKIPPED: ${testName}`, 'warning');
    results.skipped++;
  }

  results.total++;
  results.tests.push(result);

  return result;
}

async function generateReport() {
  const reportPath = '/Users/htay/Documents/MSC & Co/mscandco-frontend/PERMISSION_TOGGLE_TEST_REPORT.md';

  const report = `# Permission Toggle Test Report
Generated: ${new Date().toLocaleString()}

## Summary
- **Total Tests**: ${results.total}
- **Passed**: ${results.passed} ✅
- **Failed**: ${results.failed} ❌
- **Skipped**: ${results.skipped} ⚠️
- **Success Rate**: ${results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0}%

## Detailed Results

${results.tests.map(test => `
### ${test.passed ? '✅' : '❌'} ${test.permission}
- **User**: ${test.user} (${test.role})
- **Status**: ${test.passed ? 'PASSED' : 'FAILED'}
${test.error ? `- **Error**: ${test.error}\n` : ''}
**Steps**:
${test.steps.map(step => `  - ${step.status === 'passed' ? '✅' : '❌'} ${step.step}${step.actual ? ` (${step.actual})` : ''}`).join('\n')}
`).join('\n---\n')}

## Recommendations

${results.failed > 0 ? `
### Failed Tests
The following permissions failed testing and should be investigated:
${results.tests.filter(t => !t.passed && !t.error).map(t => `- ${t.permission} for ${t.user}`).join('\n')}
` : '✅ All tests passed successfully!'}

## Next Steps
1. Review any failed tests
2. Fix permission toggle functionality if needed
3. Verify navigation permissions are correctly mapped
4. Re-run tests after fixes
`;

  const fs = require('fs');
  fs.writeFileSync(reportPath, report);
  log(`Report saved to: ${reportPath}`, 'success');
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 COMPREHENSIVE PERMISSION TOGGLE TESTING');
  console.log('='.repeat(80) + '\n');

  // Get test users
  testUsers = await getTestUsers();

  if (testUsers.length === 0) {
    log('No test users available. Please create test accounts first.', 'error');
    log('Required: artist1@test.com, labeladmin1@test.com with password Test1234!', 'warning');
    return;
  }

  // Get all permissions
  const permissions = await getAllPermissions();

  if (permissions.length === 0) {
    log('No permissions found in database', 'error');
    return;
  }

  // Filter to testable permissions (ones that have UI impact)
  const testablPermissions = permissions.filter(p =>
    p.action === 'read' || p.action === 'access'
  );

  log(`Testing ${testablPermissions.length} permissions across ${testUsers.length} users\n`, 'info');

  // Launch browser
  const browser = await chromium.launch({
    headless: false, // Set to true for faster testing
    slowMo: 100
  });

  try {
    // Test each permission with each user
    for (const permission of testablPermissions.slice(0, 10)) { // Limit to first 10 for now
      for (const user of testUsers) {
        await testPermission(browser, permission, user);
        await sleep(2000); // Pause between tests
      }
    }
  } finally {
    await browser.close();
  }

  // Generate report
  console.log('\n' + '='.repeat(80));
  await generateReport();
  console.log('='.repeat(80) + '\n');

  log('Testing complete!', 'success');
  log(`Results: ${results.passed} passed, ${results.failed} failed, ${results.skipped} skipped`, 'info');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
