/**
 * Setup all permissions for labeladmin, admin, and superadmin roles
 * This ensures all pages have corresponding permissions in the database
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Define all permissions needed for each role and page
const permissions = [
  // Label Admin permissions
  { name: 'labeladmin:dashboard:access', description: 'Access to label admin dashboard', resource: 'labeladmin', action: 'dashboard', scope: 'access' },
  { name: 'labeladmin:releases:access', description: 'Access to label admin releases page', resource: 'labeladmin', action: 'releases', scope: 'access' },
  { name: 'labeladmin:analytics:access', description: 'Access to label admin analytics page', resource: 'labeladmin', action: 'analytics', scope: 'access' },
  { name: 'labeladmin:earnings:access', description: 'Access to label admin earnings page', resource: 'labeladmin', action: 'earnings', scope: 'access' },
  { name: 'labeladmin:roster:access', description: 'Access to label admin roster page', resource: 'labeladmin', action: 'roster', scope: 'access' },
  { name: 'labeladmin:artists:access', description: 'Access to label admin artists page', resource: 'labeladmin', action: 'artists', scope: 'access' },
  { name: 'labeladmin:messages:access', description: 'Access to label admin messages page', resource: 'labeladmin', action: 'messages', scope: 'access' },
  { name: 'labeladmin:settings:access', description: 'Access to label admin settings page', resource: 'labeladmin', action: 'settings', scope: 'access' },
  { name: 'labeladmin:profile:access', description: 'Access to label admin profile page', resource: 'labeladmin', action: 'profile', scope: 'access' },

  // Super Admin permissions
  { name: 'superadmin:dashboard:access', description: 'Access to superadmin dashboard', resource: 'superadmin', action: 'dashboard', scope: 'access' },
  { name: 'superadmin:messages:access', description: 'Access to superadmin messages page', resource: 'superadmin', action: 'messages', scope: 'access' },
  { name: 'superadmin:permissionsroles:access', description: 'Access to permissions & roles management', resource: 'superadmin', action: 'permissionsroles', scope: 'access' },
  // Note: superadmin:ghost_login:access already exists
];

async function setupPermissions() {
  console.log('🔧 Setting up permissions...\n');

  for (const perm of permissions) {
    try {
      // Check if permission already exists
      const { data: existing } = await supabase
        .from('permissions')
        .select('id, name')
        .eq('name', perm.name)
        .single();

      if (existing) {
        console.log(`✅ Permission already exists: ${perm.name}`);
        continue;
      }

      // Insert new permission
      const { data, error } = await supabase
        .from('permissions')
        .insert([perm])
        .select();

      if (error) {
        console.error(`❌ Error creating permission ${perm.name}:`, error);
      } else {
        console.log(`✅ Created permission: ${perm.name}`);
      }
    } catch (error) {
      console.error(`❌ Error processing permission ${perm.name}:`, error);
    }
  }

  console.log('\n📊 Getting role IDs...');

  // Get role IDs
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name')
    .in('name', ['label_admin', 'super_admin']);

  if (rolesError) {
    console.error('❌ Error fetching roles:', rolesError);
    return;
  }

  const labelAdminRole = roles.find(r => r.name === 'label_admin');
  const superAdminRole = roles.find(r => r.name === 'super_admin');

  console.log(`✅ Label Admin Role ID: ${labelAdminRole?.id}`);
  console.log(`✅ Super Admin Role ID: ${superAdminRole?.id}`);

  // Assign labeladmin permissions to label_admin role
  if (labelAdminRole) {
    console.log('\n📝 Assigning labeladmin permissions to label_admin role...');

    const labelAdminPerms = permissions.filter(p => p.name.startsWith('labeladmin:'));

    for (const perm of labelAdminPerms) {
      try {
        // Get permission ID
        const { data: permData } = await supabase
          .from('permissions')
          .select('id')
          .eq('name', perm.name)
          .single();

        if (!permData) continue;

        // Check if role permission already exists
        const { data: existing } = await supabase
          .from('role_permissions')
          .select('id')
          .eq('role_id', labelAdminRole.id)
          .eq('permission_id', permData.id)
          .single();

        if (existing) {
          console.log(`  ✅ Already assigned: ${perm.name}`);
          continue;
        }

        // Assign permission to role
        const { error } = await supabase
          .from('role_permissions')
          .insert([{
            role_id: labelAdminRole.id,
            permission_id: permData.id
          }]);

        if (error) {
          console.error(`  ❌ Error assigning ${perm.name}:`, error);
        } else {
          console.log(`  ✅ Assigned: ${perm.name}`);
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${perm.name}:`, error);
      }
    }
  }

  // Assign superadmin permissions to super_admin role
  if (superAdminRole) {
    console.log('\n📝 Assigning superadmin permissions to super_admin role...');

    const superAdminPerms = permissions.filter(p => p.name.startsWith('superadmin:'));

    for (const perm of superAdminPerms) {
      try {
        // Get permission ID
        const { data: permData } = await supabase
          .from('permissions')
          .select('id')
          .eq('name', perm.name)
          .single();

        if (!permData) continue;

        // Check if role permission already exists
        const { data: existing } = await supabase
          .from('role_permissions')
          .select('id')
          .eq('role_id', superAdminRole.id)
          .eq('permission_id', permData.id)
          .single();

        if (existing) {
          console.log(`  ✅ Already assigned: ${perm.name}`);
          continue;
        }

        // Assign permission to role
        const { error } = await supabase
          .from('role_permissions')
          .insert([{
            role_id: superAdminRole.id,
            permission_id: permData.id
          }]);

        if (error) {
          console.error(`  ❌ Error assigning ${perm.name}:`, error);
        } else {
          console.log(`  ✅ Assigned: ${perm.name}`);
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${perm.name}:`, error);
      }
    }
  }

  console.log('\n✅ Permission setup complete!');
}

setupPermissions().catch(console.error);
