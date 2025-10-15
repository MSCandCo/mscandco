/**
 * Test Wildcard Permission Matching Logic
 */

function checkPermission(userPermissions, requiredPermission) {
  console.log(`\n🔍 Checking if user can access: ${requiredPermission}`);
  console.log(`   User has: ${userPermissions.join(', ')}`);

  // Check wildcard super admin permission
  if (userPermissions.includes('*:*:*')) {
    console.log('   ✅ Granted via wildcard *:*:*');
    return true;
  }

  // Check exact match
  if (userPermissions.includes(requiredPermission)) {
    console.log('   ✅ Granted via exact match');
    return true;
  }

  // Check wildcard patterns
  const [resource, action, scope] = requiredPermission.split(':');

  // Check resource:*:*
  if (userPermissions.includes(`${resource}:*:*`)) {
    console.log(`   ✅ Granted via wildcard ${resource}:*:*`);
    return true;
  }

  // Check resource:action:*
  if (action && userPermissions.includes(`${resource}:${action}:*`)) {
    console.log(`   ✅ Granted via wildcard ${resource}:${action}:*`);
    return true;
  }

  console.log('   ❌ Access DENIED');
  return false;
}

// Test with super_admin permissions
console.log('='.repeat(80));
console.log('TEST 1: Super Admin with *:*:*');
console.log('='.repeat(80));

const superAdminPerms = ['*:*:*', 'admin:ghost_login:access', 'admin:permissionsroles:access'];

// Test admin page permissions
const adminPagePerms = [
  'users_access:user_management:read',
  'finance:wallet_management:read',
  'analytics:analytics_management:read',
  'content:asset_library:read',
  'platform_messages:read'
];

adminPagePerms.forEach(perm => {
  checkPermission(superAdminPerms, perm);
});

// Test with settings page (*:*:* requirement)
checkPermission(superAdminPerms, '*:*:*');

console.log('\n' + '='.repeat(80));
console.log('TEST 2: Company Admin with specific permissions');
console.log('='.repeat(80));

const companyAdminPerms = [
  'analytics:analytics_management:read',
  'analytics:platform_analytics:read',
  'analytics:requests:read',
  'content:asset_library:read',
  'finance:earnings_management:read',
  'finance:split_configuration:read',
  'finance:wallet_management:read',
  'platform_messages:read',
  'settings:read',
  'settings:update',
  'users_access:master_roster:read',
  'users_access:permissions_roles:read',
  'users_access:user_management:read',
  // Plus the 8 new universal permissions
  'messages:access',
  'settings:access',
  'dashboard:access',
  'analytics:access',
  'earnings:access',
  'releases:access',
  'roster:access',
  'platform:access'
];

adminPagePerms.forEach(perm => {
  checkPermission(companyAdminPerms, perm);
});

console.log('\n' + '='.repeat(80));
console.log('TEST 3: Artist with universal :access permissions');
console.log('='.repeat(80));

const artistPerms = [
  'analytics:access',
  'earnings:access',
  'releases:access',
  'roster:access',
  'messages:access',
  'settings:access'
];

const artistPagePerms = [
  'analytics:access',
  'earnings:access',
  'releases:access',
  'roster:access',
  'messages:access',
  'settings:access'
];

artistPagePerms.forEach(perm => {
  checkPermission(artistPerms, perm);
});

console.log('\n✅ All tests complete!');
