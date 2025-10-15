const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Admin-specific permissions (features only available to super_admin)
const ADMIN_PERMISSIONS = [
  {
    name: 'admin:ghost_login:access',
    description: 'Access Ghost Login feature (log in as other users)',
    resource: 'admin',
    action: 'access',
    scope: 'admin'
  },
  {
    name: 'admin:permissionsroles:access',
    description: 'Access Permissions & Roles management page',
    resource: 'admin',
    action: 'access',
    scope: 'admin'
  }
];

async function addAdminPermissions() {
  console.log('🚀 Adding admin-specific permissions...\n');

  try {
    // Create permissions
    console.log(`📝 Creating ${ADMIN_PERMISSIONS.length} admin permissions...\n`);

    for (const perm of ADMIN_PERMISSIONS) {
      const { error } = await supabase
        .from('permissions')
        .upsert(perm, { onConflict: 'name' });

      if (error && error.code !== '23505') {
        console.error(`  ❌ ${perm.name}:`, error.message);
      } else {
        console.log(`  ✅ ${perm.name}`);
      }
    }

    console.log('\n✅ Admin permissions created!\n');

    // Assign to super_admin role
    console.log('📌 Assigning admin permissions to super_admin role...\n');

    // Get super_admin role ID
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'super_admin')
      .single();

    if (roleError) {
      console.error('  ❌ super_admin role not found');
      return;
    }

    // Get permission IDs
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('id, name')
      .in('name', ADMIN_PERMISSIONS.map(p => p.name));

    if (permError) {
      console.error('  ❌ Error fetching permissions:', permError.message);
      return;
    }

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
        console.error(`    ❌ ${perm.name}:`, assignError.message);
      } else {
        console.log(`    ✅ ${perm.name}`);
      }
    }

    console.log('\n✨ Admin permissions setup complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addAdminPermissions();
