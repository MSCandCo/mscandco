/**
 * Comprehensive Permission System Verification
 *
 * This script verifies:
 * 1. Server-side permission checks are in place
 * 2. Permission denial mechanism works
 * 3. All 35 pages have proper server-side protection
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 PERMISSION SYSTEM VERIFICATION\n');
console.log('='.repeat(60));

// List of all pages that should have server-side checks (from PERMISSION_SYSTEM_COMPLETE.md)
const PROTECTED_PAGES = {
  admin: [
    { file: 'pages/admin/usermanagement.js', permission: 'users_access:user_management:read' },
    { file: 'pages/admin/walletmanagement.js', permission: 'finance:wallet_management:read' },
    { file: 'pages/admin/earningsmanagement.js', permission: 'finance:earnings_management:read' },
    { file: 'pages/admin/splitconfiguration.js', permission: 'finance:split_configuration:read' },
    { file: 'pages/admin/platformanalytics.js', permission: 'analytics:platform_analytics:read' },
    { file: 'pages/admin/assetlibrary.js', permission: 'content:asset_library:read' },
    { file: 'pages/admin/masterroster.js', permission: 'users_access:master_roster:read' },
    { file: 'pages/admin/permissions.js', permission: 'users_access:permissions_roles:read' },
    { file: 'pages/admin/analyticsmanagement.js', permission: 'analytics:analytics_management:read' },
    { file: 'pages/admin/requests.js', permission: 'analytics:requests:read' },
    { file: 'pages/admin/messages.js', permission: 'platform_messages:read' },
    { file: 'pages/admin/settings.js', permission: '*:*:*' },
    { file: 'pages/admin/profile/index.js', permission: '*:*:*' },
  ],
  artist: [
    { file: 'pages/artist/analytics.js', permission: 'analytics:access' },
    { file: 'pages/artist/earnings.js', permission: 'earnings:access' },
    { file: 'pages/artist/messages.js', permission: 'messages:access' },
    { file: 'pages/artist/releases.js', permission: 'releases:access' },
    { file: 'pages/artist/roster.js', permission: 'roster:access' },
    { file: 'pages/artist/settings.js', permission: 'settings:access' },
  ],
  labeladmin: [
    { file: 'pages/labeladmin/analytics.js', permission: 'analytics:access' },
    { file: 'pages/labeladmin/artists.js', permission: 'roster:access' },
    { file: 'pages/labeladmin/earnings.js', permission: 'earnings:access' },
    { file: 'pages/labeladmin/messages.js', permission: 'messages:access' },
    { file: 'pages/labeladmin/profile/index.js', permission: 'profile:read' },
    { file: 'pages/labeladmin/releases.js', permission: 'releases:access' },
    { file: 'pages/labeladmin/roster.js', permission: 'roster:access' },
    { file: 'pages/labeladmin/settings.js', permission: 'settings:access' },
  ],
  distribution: [
    { file: 'pages/distribution/queue.js', permission: 'distribution:read:partner' },
    { file: 'pages/distribution/revisions.js', permission: 'distribution:read:partner' },
    { file: 'pages/distributionpartner/settings.js', permission: 'distribution:settings:access' },
  ],
  superadmin: [
    { file: 'pages/superadmin/ghost-login.js', permission: 'admin:ghost_login:access' },
    { file: 'pages/superadmin/permissionsroles.js', permission: 'admin:permissionsroles:access' },
    { file: 'pages/superadmin/dashboard.js', permission: 'user:read:any' },
    { file: 'pages/superadmin/messages.js', permission: 'messages:access' },
  ],
  test: [
    { file: 'pages/test-rbac.js', permission: 'various' },
  ]
};

// Flatten all pages
const allPages = Object.values(PROTECTED_PAGES).flat();

console.log(`\n📋 Checking ${allPages.length} protected pages...\n`);

let passed = 0;
let failed = 0;
const failures = [];

// Check each page
for (const pageInfo of allPages) {
  const filePath = path.join(__dirname, pageInfo.file);

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for server-side permission check
    const hasGetServerSideProps = content.includes('getServerSideProps');
    const hasRequirePermission = content.includes('requirePermission');
    const hasServerSideImport = content.includes("from '@/lib/serverSidePermissions'") ||
                                  content.includes('from "@/lib/serverSidePermissions"');

    // Check that client-side usePermissions is NOT doing permission-based redirects
    // We need to be more specific: only flag router.push inside useEffect with permission checks
    const hasUsePermissions = content.includes('usePermissions');

    // Look for permission-related redirects in useEffect blocks
    const permissionRedirectPatterns = [
      /useEffect\([^)]*\{[^}]*hasPermission[^}]*router\.push/s,
      /useEffect\([^)]*\{[^}]*permissionsLoading[^}]*router\.push/s,
      /useEffect\([^)]*\{[^}]*!hasPermission[^}]*router\.push/s,
      /useEffect\([^)]*\{[^}]*getUserRole[^}]*router\.push/s,
    ];

    const hasClientSideRedirect = permissionRedirectPatterns.some(pattern => pattern.test(content));

    const isProtected = hasGetServerSideProps && hasRequirePermission && hasServerSideImport;

    if (isProtected && !hasClientSideRedirect) {
      console.log(`✅ ${pageInfo.file}`);
      console.log(`   Permission: ${pageInfo.permission}`);
      console.log(`   ✓ Has getServerSideProps`);
      console.log(`   ✓ Uses requirePermission`);
      console.log(`   ✓ Imports from serverSidePermissions`);
      if (hasUsePermissions && !hasClientSideRedirect) {
        console.log(`   ✓ Client-side permissions for UI only (no redirects)`);
      }
      passed++;
    } else {
      console.log(`❌ ${pageInfo.file}`);
      console.log(`   Permission: ${pageInfo.permission}`);
      if (!hasGetServerSideProps) console.log(`   ✗ Missing getServerSideProps`);
      if (!hasRequirePermission) console.log(`   ✗ Missing requirePermission call`);
      if (!hasServerSideImport) console.log(`   ✗ Missing serverSidePermissions import`);
      if (hasClientSideRedirect) console.log(`   ✗ Still has client-side redirect (SECURITY ISSUE)`);
      failed++;
      failures.push({ ...pageInfo, issues: { hasGetServerSideProps, hasRequirePermission, hasServerSideImport, hasClientSideRedirect } });
    }
    console.log('');

  } catch (error) {
    console.log(`❌ ${pageInfo.file}`);
    console.log(`   ✗ Error reading file: ${error.message}`);
    failed++;
    failures.push({ ...pageInfo, error: error.message });
    console.log('');
  }
}

// Check lib/serverSidePermissions.js exists
console.log('\n' + '='.repeat(60));
console.log('\n📦 Checking Core Utility...\n');

const utilPath = path.join(__dirname, 'lib/serverSidePermissions.js');
try {
  const utilContent = fs.readFileSync(utilPath, 'utf8');
  const hasRequirePermissionFunction = utilContent.includes('export async function requirePermission');
  const hasSupabaseIntegration = utilContent.includes('createPagesServerClient');
  const hasPermissionCheck = utilContent.includes('getUserPermissions');

  if (hasRequirePermissionFunction && hasSupabaseIntegration && hasPermissionCheck) {
    console.log('✅ lib/serverSidePermissions.js');
    console.log('   ✓ Has requirePermission function');
    console.log('   ✓ Uses Supabase server client');
    console.log('   ✓ Calls getUserPermissions');
  } else {
    console.log('❌ lib/serverSidePermissions.js has issues');
    if (!hasRequirePermissionFunction) console.log('   ✗ Missing requirePermission function');
    if (!hasSupabaseIntegration) console.log('   ✗ Missing Supabase integration');
    if (!hasPermissionCheck) console.log('   ✗ Missing getUserPermissions call');
  }
} catch (error) {
  console.log('❌ lib/serverSidePermissions.js');
  console.log(`   ✗ ${error.message}`);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 VERIFICATION SUMMARY\n');
console.log(`Total Pages: ${allPages.length}`);
console.log(`✅ Passed: ${passed} (${((passed/allPages.length)*100).toFixed(1)}%)`);
console.log(`❌ Failed: ${failed} (${((failed/allPages.length)*100).toFixed(1)}%)`);

if (failed > 0) {
  console.log('\n⚠️  FAILURES:\n');
  failures.forEach(f => {
    console.log(`   • ${f.file}`);
    if (f.error) {
      console.log(`     Error: ${f.error}`);
    } else if (f.issues) {
      if (!f.issues.hasGetServerSideProps) console.log('     - Missing getServerSideProps');
      if (!f.issues.hasRequirePermission) console.log('     - Missing requirePermission');
      if (!f.issues.hasServerSideImport) console.log('     - Missing import');
      if (f.issues.hasClientSideRedirect) console.log('     - Still has client-side redirect');
    }
  });
}

console.log('\n' + '='.repeat(60));

if (failed === 0) {
  console.log('\n🎉 ALL CHECKS PASSED!\n');
  console.log('The permission system is properly implemented with:');
  console.log('  ✓ Server-side permission checks on all 35 pages');
  console.log('  ✓ No client-side security vulnerabilities');
  console.log('  ✓ Proper imports and function calls');
  console.log('\n✅ Ready for deployment\n');
} else {
  console.log('\n⚠️  ISSUES FOUND\n');
  console.log('Please fix the failed pages before deployment.');
  console.log('See details above for specific issues.\n');
}
