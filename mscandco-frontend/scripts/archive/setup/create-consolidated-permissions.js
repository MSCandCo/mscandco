const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define all permissions to create
const UNIVERSAL_PERMISSIONS = [
  { name: 'analytics:access', description: 'Access Analytics page', resource: 'analytics', action: 'access', scope: 'universal' },
  { name: 'earnings:access', description: 'Access Earnings page', resource: 'earnings', action: 'access', scope: 'universal' },
  { name: 'releases:access', description: 'Access Releases page', resource: 'releases', action: 'access', scope: 'universal' },
  { name: 'roster:access', description: 'Access Roster page', resource: 'roster', action: 'access', scope: 'universal' },
  { name: 'profile:access', description: 'Access and edit own profile', resource: 'profile', action: 'access', scope: 'universal' },
  { name: 'platform:access', description: 'Access platform features', resource: 'platform', action: 'access', scope: 'universal' },
  { name: 'messages:access', description: 'Access Messages page', resource: 'messages', action: 'access', scope: 'universal' },
  { name: 'settings:access', description: 'Access Settings page', resource: 'settings', action: 'access', scope: 'universal' },
  { name: 'dashboard:access', description: 'Access Dashboard page', resource: 'dashboard', action: 'access', scope: 'universal' }
];

const MESSAGE_PERMISSIONS = [
  { name: 'messages:invitations:view', description: 'View invitation messages (for artists)', resource: 'messages', action: 'view', scope: 'messages' },
  { name: 'messages:invitation_responses:view', description: 'View invitation response messages (for label admins)', resource: 'messages', action: 'view', scope: 'messages' },
  { name: 'messages:earnings:view', description: 'View earning notifications', resource: 'messages', action: 'view', scope: 'messages' },
  { name: 'messages:payouts:view', description: 'View payout notifications', resource: 'messages', action: 'view', scope: 'messages' },
  { name: 'messages:system:view', description: 'View system/platform messages', resource: 'messages', action: 'view', scope: 'messages' },
  { name: 'messages:releases:view', description: 'View release notifications', resource: 'messages', action: 'view', scope: 'messages' },
  { name: 'messages:all:view', description: 'View all message types (super admin master permission)', resource: 'messages', action: 'view', scope: 'messages' }
];

const SETTINGS_PERMISSIONS = [
  { name: 'settings:preferences:edit', description: 'Edit preferences tab (language, timezone, etc.)', resource: 'settings', action: 'edit', scope: 'settings' },
  { name: 'settings:security:edit', description: 'Edit security settings (password, 2FA, sessions)', resource: 'settings', action: 'edit', scope: 'settings' },
  { name: 'settings:notifications:edit', description: 'Edit notification preferences', resource: 'settings', action: 'edit', scope: 'settings' },
  { name: 'settings:billing:view', description: 'View billing information', resource: 'settings', action: 'view', scope: 'settings' },
  { name: 'settings:billing:edit', description: 'Edit billing information', resource: 'settings', action: 'edit', scope: 'settings' },
  { name: 'settings:api_keys:view', description: 'View API keys', resource: 'settings', action: 'view', scope: 'settings' },
  { name: 'settings:api_keys:manage', description: 'Create and revoke API keys', resource: 'settings', action: 'manage', scope: 'settings' }
];

const ANALYTICS_PERMISSIONS = [
  { name: 'analytics:basic:view', description: 'View basic analytics tab', resource: 'analytics', action: 'view', scope: 'analytics' },
  { name: 'analytics:advanced:view', description: 'View advanced analytics tab (Pro feature)', resource: 'analytics', action: 'view', scope: 'analytics' }
];

// Role permission assignments
const ARTIST_PERMISSIONS = [
  // Page Access
  'analytics:access', 'earnings:access', 'releases:access', 'roster:access',
  'profile:access', 'platform:access', 'messages:access', 'settings:access', 'dashboard:access',
  // Message Tabs
  'messages:invitations:view', 'messages:earnings:view', 'messages:payouts:view',
  // Settings Tabs
  'settings:preferences:edit', 'settings:security:edit', 'settings:notifications:edit',
  'settings:billing:view', 'settings:billing:edit', 'settings:api_keys:view', 'settings:api_keys:manage',
  // Analytics Tabs
  'analytics:basic:view', 'analytics:advanced:view'
];

const LABELADMIN_PERMISSIONS = [
  // Page Access
  'analytics:access', 'earnings:access', 'releases:access', 'roster:access',
  'profile:access', 'platform:access', 'messages:access', 'settings:access', 'dashboard:access',
  // Message Tabs
  'messages:invitation_responses:view', 'messages:earnings:view', 'messages:payouts:view',
  // Settings Tabs
  'settings:preferences:edit', 'settings:security:edit', 'settings:notifications:edit',
  'settings:billing:view', 'settings:billing:edit', 'settings:api_keys:view', 'settings:api_keys:manage',
  // Analytics Tabs
  'analytics:basic:view', 'analytics:advanced:view'
];

const DISTRIBUTION_PARTNER_PERMISSIONS = [
  // Page Access
  'messages:access', 'settings:access', 'profile:access', 'dashboard:access',
  // Message Tabs
  'messages:system:view', 'messages:earnings:view', 'messages:payouts:view',
  // Settings Tabs
  'settings:preferences:edit', 'settings:security:edit', 'settings:notifications:edit',
  'settings:api_keys:view', 'settings:api_keys:manage'
];

async function createPermissions() {
  console.log('🚀 Creating consolidated permissions...\n');

  try {
    // Create all permissions
    const allPermissions = [
      ...UNIVERSAL_PERMISSIONS,
      ...MESSAGE_PERMISSIONS,
      ...SETTINGS_PERMISSIONS,
      ...ANALYTICS_PERMISSIONS
    ];

    console.log(`📝 Creating ${allPermissions.length} permissions...\n`);

    for (const perm of allPermissions) {
      const { error } = await supabase
        .from('permissions')
        .upsert(perm, { onConflict: 'name' });

      if (error && error.code !== '23505') {
        console.error(`  ❌ ${perm.name}:`, error.message);
      } else {
        console.log(`  ✅ ${perm.name}`);
      }
    }

    console.log('\n✅ All permissions created!\n');

    // Assign to roles
    await assignPermissionsToRole('artist', ARTIST_PERMISSIONS);
    await assignPermissionsToRole('labeladmin', LABELADMIN_PERMISSIONS);
    await assignPermissionsToRole('distribution_partner', DISTRIBUTION_PARTNER_PERMISSIONS);

    // Verify
    await verifyResults();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function assignPermissionsToRole(roleName, permissionNames) {
  console.log(`\n📌 Assigning ${permissionNames.length} permissions to ${roleName}...`);

  // Get role ID
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single();

  if (roleError) {
    console.error(`  ❌ Role not found: ${roleName}`);
    return;
  }

  // Get permission IDs
  const { data: permissions, error: permError } = await supabase
    .from('permissions')
    .select('id, name')
    .in('name', permissionNames);

  if (permError) {
    console.error(`  ❌ Error fetching permissions:`, permError.message);
    return;
  }

  console.log(`  Found ${permissions.length}/${permissionNames.length} permissions`);

  // Assign each
  for (const perm of permissions) {
    const { error: assignError } = await supabase
      .from('role_permissions')
      .upsert({
        role_id: role.id,
        permission_id: perm.id
      }, {
        onConflict: 'role_id,permission_id'
      });

    if (assignError && assignError.code !== '23505') {
      console.error(`    ❌ ${perm.name}`);
    } else {
      console.log(`    ✅ ${perm.name}`);
    }
  }
}

async function verifyResults() {
  console.log('\n\n🔍 VERIFICATION RESULTS\n');
  console.log('='.repeat(50));

  // Count by scope
  const scopes = ['universal', 'messages', 'settings', 'analytics'];

  for (const scope of scopes) {
    const { data } = await supabase
      .from('permissions')
      .select('name')
      .eq('scope', scope);

    console.log(`\n✅ ${scope.toUpperCase()}: ${data?.length || 0} permissions`);
    if (data && data.length > 0) {
      data.forEach(p => console.log(`   • ${p.name}`));
    }
  }

  // Role counts
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 ROLE PERMISSION COUNTS:\n');

  const roles = ['artist', 'labeladmin', 'distribution_partner'];

  for (const roleName of roles) {
    const { data: role } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (role) {
      const { data: perms } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', role.id);

      console.log(`  ${roleName}: ${perms?.length || 0} permissions`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✨ Consolidation complete!\n');
}

createPermissions();
