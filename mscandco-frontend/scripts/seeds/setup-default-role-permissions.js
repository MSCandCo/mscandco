/**
 * Setup Default Permissions for All System Roles
 * This script defines and applies the default permissions that should be
 * assigned to each role when a user is created or when "Reset to Default" is clicked
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Default permissions for each role
 * These are the permissions that should be restored when "Reset to Default" is clicked
 */
const ROLE_DEFAULTS = {
  // Artist - Full access to artist features
  artist: [
    'artist:dashboard:access',
    'artist:release:access',
    'artist:analytics:access',
    'artist:earnings:access',
    'artist:roster:access',
    'artist:messages:access',
    'artist:settings:access',
    'artist:platform:access',
  ],

  // Label Admin - Full access to label admin features
  label_admin: [
    'labeladmin:dashboard:access',
    'labeladmin:releases:access',
    'labeladmin:analytics:access',
    'labeladmin:earnings:access',
    'labeladmin:roster:access',
    'labeladmin:artists:access',
    'labeladmin:messages:access',
    'labeladmin:settings:access',
    'labeladmin:profile:access',
  ],

  // Super Admin - Full system access (wildcard)
  super_admin: [
    '*:*:*', // Wildcard = full access to everything
  ],

  // Company Admin - Full admin access to all admin features
  company_admin: [
    // Users & Access
    'users_access:user_management:read',
    'users_access:permissions_roles:read',
    'analytics:requests:read',

    // Analytics & Insights
    'analytics:platform_analytics:read',
    'analytics:analytics_management:read',

    // Finance
    'finance:earnings_management:read',
    'finance:wallet_management:read',
    'finance:split_configuration:read',

    // Content & Assets
    'content:asset_library:read',
    'content:master_roster:read',

    // Dropdown/Platform
    'dropdown:platform_messages:read',
  ],

  // Analytics Admin - Analytics and reporting access
  analytics_admin: [
    'analytics:requests:read',
    'analytics:platform_analytics:read',
    'analytics:analytics_management:read',
  ],

  // Financial Admin - Finance and earnings management
  financial_admin: [
    'finance:earnings_management:read',
    'finance:wallet_management:read',
    'finance:split_configuration:read',
  ],

  // Content Moderator - Content and asset management
  content_moderator: [
    'content:asset_library:read',
    'content:master_roster:read',
  ],

  // Roster Admin - Roster and contributor management
  roster_admin: [
    'content:master_roster:read',
  ],

  // Requests Admin - Request and approval management
  requests_admin: [
    'analytics:requests:read',
  ],

  // Marketing Admin - Marketing and platform analytics
  marketing_admin: [
    'analytics:platform_analytics:read',
    'content:asset_library:read',
  ],

  // Support Admin - Support and user management
  support_admin: [
    'users_access:user_management:read',
    'analytics:requests:read',
    'dropdown:platform_messages:read',
  ],

  // Distribution Partner - Distribution features
  distribution_partner: [
    'distribution:read:partner',
  ],

  // Custom Admin - Minimal admin access (can be customized)
  custom_admin: [],

  // Test Admin - Testing purposes only
  test_admin: [],
};

async function getPermissionId(permissionName) {
  const { data, error } = await supabase
    .from('permissions')
    .select('id')
    .eq('name', permissionName)
    .single();

  if (error) {
    console.warn(`⚠️  Permission not found: ${permissionName}`);
    return null;
  }

  return data?.id;
}

async function getRoleId(roleName) {
  const { data, error } = await supabase
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single();

  if (error) {
    console.error(`❌ Role not found: ${roleName}`);
    return null;
  }

  return data?.id;
}

async function setRolePermissions(roleName, permissionNames) {
  console.log(`\n📝 Setting default permissions for: ${roleName}`);
  console.log(`   Permissions: ${permissionNames.length}`);

  const roleId = await getRoleId(roleName);
  if (!roleId) {
    console.error(`   ❌ Failed to get role ID`);
    return false;
  }

  // Clear existing role permissions
  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId);

  if (deleteError) {
    console.error(`   ❌ Error clearing existing permissions:`, deleteError);
    return false;
  }

  console.log(`   ✅ Cleared existing permissions`);

  // Add new permissions
  let added = 0;
  let skipped = 0;

  for (const permName of permissionNames) {
    const permId = await getPermissionId(permName);

    if (!permId) {
      skipped++;
      continue;
    }

    const { error } = await supabase
      .from('role_permissions')
      .insert([{ role_id: roleId, permission_id: permId }]);

    if (error) {
      console.error(`   ❌ Error adding ${permName}:`, error.message);
      skipped++;
    } else {
      added++;
    }
  }

  console.log(`   ✅ Added ${added} permissions`);
  if (skipped > 0) {
    console.log(`   ⚠️  Skipped ${skipped} permissions (not found in database)`);
  }

  return true;
}

async function setupAllRoleDefaults() {
  console.log('🔧 Setting up default permissions for all roles...\n');

  for (const [roleName, permissions] of Object.entries(ROLE_DEFAULTS)) {
    await setRolePermissions(roleName, permissions);
  }

  console.log('\n✅ All role defaults have been configured!');

  // Print summary
  console.log('\n📊 Summary:');
  for (const [roleName, permissions] of Object.entries(ROLE_DEFAULTS)) {
    console.log(`   ${roleName}: ${permissions.length} permissions`);
  }
}

async function fixAllUsersPermissions() {
  console.log('\n\n🔄 Fixing all existing users to have default role permissions...\n');

  // Get all users with their roles
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('id, role, email');

  if (error) {
    console.error('❌ Error fetching users:', error);
    return;
  }

  console.log(`Found ${users.length} users\n`);

  let fixed = 0;
  let skipped = 0;

  for (const user of users) {
    if (!user.role || !ROLE_DEFAULTS[user.role]) {
      console.log(`⚠️  Skipping ${user.email}: No role or no defaults defined for role ${user.role}`);
      skipped++;
      continue;
    }

    console.log(`📝 Fixing ${user.email} (${user.role})...`);

    const defaultPermissions = ROLE_DEFAULTS[user.role];
    const roleId = await getRoleId(user.role);

    if (!roleId) {
      console.log(`   ❌ Could not find role ID`);
      skipped++;
      continue;
    }

    // Clear existing user-specific permissions
    await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', user.id);

    console.log(`   ✅ User will use role defaults (${defaultPermissions.length} permissions)`);
    fixed++;
  }

  console.log(`\n✅ Fixed ${fixed} users`);
  if (skipped > 0) {
    console.log(`⚠️  Skipped ${skipped} users`);
  }
}

async function run() {
  try {
    // Step 1: Setup role defaults in role_permissions table
    await setupAllRoleDefaults();

    // Step 2: Fix all existing users to use role defaults
    await fixAllUsersPermissions();

    console.log('\n🎉 Complete! All roles have proper defaults and all users have been fixed.\n');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

run();
