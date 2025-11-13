/**
 * Permission Testing Script
 * Copy and paste this into browser console to test permission logic
 *
 * Usage:
 * 1. Open http://localhost:3013
 * 2. Open DevTools (F12)
 * 3. Paste this entire script
 * 4. Press Enter
 */

// Test data - different user scenarios
const testUsers = {
  artist: ['release:read:own', 'analytics:read:own', 'earnings:read:own', 'notification:read:own'],
  company_admin: ['user:read:any', 'role:read:any', 'analytics:read:any', 'release:read:any', 'support:read:any'],
  requests_admin: ['user:read:any', 'user:update:any'],
  financial_admin: ['earnings:read:any', 'payout:read:any', 'analytics:read:any'],
  super_admin: ['*:*:*']  // Wildcard - has everything
};

// Simulate hasPermission function (same logic as usePermissions hook)
function hasPermission(userPermissions, permission) {
  if (!permission) return false;

  // Check wildcard first (super admin)
  if (userPermissions.includes('*:*:*')) return true;

  // Check exact match
  if (userPermissions.includes(permission)) return true;

  // Check wildcard patterns
  const [resource, action, scope] = permission.split(':');

  // Check resource:*:*
  if (userPermissions.includes(`${resource}:*:*`)) return true;

  // Check resource:action:*
  if (userPermissions.includes(`${resource}:${action}:*`)) return true;

  return false;
}

// Test navigation items for each role
console.log('🧪 PERMISSION-BASED NAVIGATION TEST\n');
console.log('=' .repeat(60));

Object.entries(testUsers).forEach(([role, permissions]) => {
  console.log(`\n📋 ${role.toUpperCase()}`);
  console.log(`Permissions: [${permissions.join(', ')}]`);
  console.log('-'.repeat(60));

  // Test regular navigation items
  console.log('\n  📱 REGULAR NAVIGATION:');
  const regularNav = [
    { name: 'My Releases', perm: 'release:read:own' },
    { name: 'Analytics', perm: 'analytics:read:own' },
    { name: 'Earnings', perm: 'earnings:read:own' },
    { name: 'Roster', perm: 'user:read:label' },
  ];

  regularNav.forEach(({ name, perm }) => {
    const result = hasPermission(permissions, perm);
    console.log(`    ${result ? '✅' : '❌'} ${name.padEnd(20)} (${perm})`);
  });

  // Test admin navigation items
  console.log('\n  🔐 ADMIN NAVIGATION:');
  const adminNav = [
    { name: 'User Management', perm: 'user:read:any' },
    { name: 'Profile Requests', perm: 'user:read:any' },
    { name: 'Roles & Permissions', perm: 'role:read:any' },
    { name: 'Platform Analytics', perm: 'analytics:read:any' },
    { name: 'All Releases', perm: 'release:read:any' },
  ];

  const hasAnyAdmin = adminNav.some(({ perm }) => hasPermission(permissions, perm));

  if (hasAnyAdmin) {
    console.log(`    ✅ Admin Dropdown VISIBLE`);
    adminNav.forEach(({ name, perm }) => {
      const result = hasPermission(permissions, perm);
      console.log(`    ${result ? '  ✅' : '  ❌'} ${name.padEnd(20)} (${perm})`);
    });
  } else {
    console.log(`    ❌ Admin Dropdown HIDDEN (no admin permissions)`);
  }

  // Test features
  console.log('\n  ✨ FEATURES:');
  const features = [
    { name: 'Notification Bell', perm: 'notification:read:own', alt: 'user:read:any' },
    { name: 'Wallet Balance', perm: 'earnings:read:own' },
  ];

  features.forEach(({ name, perm, alt }) => {
    const result = hasPermission(permissions, perm) || (alt && hasPermission(permissions, alt));
    console.log(`    ${result ? '✅' : '❌'} ${name.padEnd(20)} (${perm}${alt ? ` OR ${alt}` : ''})`);
  });
});

console.log('\n' + '='.repeat(60));
console.log('✅ Test complete! Compare with actual navigation in your app.');
console.log('\nTo test with YOUR user permissions:');
console.log('1. Check Network tab for getUserPermissions response');
console.log('2. Copy your permissions array');
console.log('3. Run: hasPermission(yourPermissions, "permission:name:here")');
