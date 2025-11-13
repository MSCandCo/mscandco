const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function splitProfilePermission() {
  console.log('🚀 Splitting profile:access into CRUD permissions...\n');

  try {
    // Step 1: Create new permissions
    console.log('📝 Creating new profile permissions...');

    const newPermissions = [
      { name: 'profile:read', description: 'View own profile', resource: 'profile', action: 'read', scope: 'universal' },
      { name: 'profile:update', description: 'Edit own profile', resource: 'profile', action: 'update', scope: 'universal' }
    ];

    for (const perm of newPermissions) {
      const { data, error } = await supabase
        .from('permissions')
        .upsert(perm, { onConflict: 'name' })
        .select();

      if (error) {
        console.error(`  ❌ Error creating ${perm.name}:`, error);
      } else {
        console.log(`  ✅ Created ${perm.name}`);
      }
    }

    // Step 2: Get the old permission ID
    const { data: oldPermission, error: fetchError } = await supabase
      .from('permissions')
      .select('id')
      .eq('name', 'profile:access')
      .single();

    if (fetchError) {
      console.error('❌ Error fetching old permission:', fetchError);
      process.exit(1);
    }

    console.log('\n📋 Finding roles with profile:access...');

    // Step 3: Get all role_permissions with the old permission
    const { data: rolePerms, error: rolePermsError } = await supabase
      .from('role_permissions')
      .select('role_id')
      .eq('permission_id', oldPermission.id);

    if (rolePermsError) {
      console.error('❌ Error fetching role permissions:', rolePermsError);
      process.exit(1);
    }

    console.log(`  Found ${rolePerms.length} roles with profile:access`);

    // Step 4: Get new permission IDs
    const { data: newPerms, error: newPermsError } = await supabase
      .from('permissions')
      .select('id, name')
      .in('name', ['profile:read', 'profile:update']);

    if (newPermsError) {
      console.error('❌ Error fetching new permissions:', newPermsError);
      process.exit(1);
    }

    // Step 5: Assign new permissions to those roles
    console.log('\n🔄 Assigning new permissions to roles...');
    for (const rolePerm of rolePerms) {
      for (const newPerm of newPerms) {
        const { error: insertError } = await supabase
          .from('role_permissions')
          .upsert({
            role_id: rolePerm.role_id,
            permission_id: newPerm.id
          }, { onConflict: 'role_id,permission_id' });

        if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
          console.error(`  ❌ Error assigning ${newPerm.name}:`, insertError);
        } else {
          console.log(`  ✅ Assigned ${newPerm.name} to role`);
        }
      }
    }

    // Step 6: Remove old role_permissions
    console.log('\n🗑️  Removing old profile:access from roles...');
    const { error: deleteRolePermsError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('permission_id', oldPermission.id);

    if (deleteRolePermsError) {
      console.error('❌ Error deleting role permissions:', deleteRolePermsError);
    } else {
      console.log('  ✅ Removed old role permissions');
    }

    // Step 7: Delete old permission
    console.log('\n🗑️  Deleting old profile:access permission...');
    const { error: deletePermError } = await supabase
      .from('permissions')
      .delete()
      .eq('name', 'profile:access');

    if (deletePermError) {
      console.error('❌ Error deleting old permission:', deletePermError);
    } else {
      console.log('  ✅ Deleted old permission');
    }

    // Step 8: Verify
    console.log('\n🔍 Verifying changes...\n');
    const { data: verifyData, error: verifyError } = await supabase
      .from('permissions')
      .select('name, description, resource')
      .eq('resource', 'profile')
      .order('name');

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
    } else {
      console.log('Profile permissions:');
      verifyData.forEach(p => {
        console.log(`  - ${p.name}: ${p.description}`);
      });
    }

    console.log('\n✨ Migration complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

splitProfilePermission();
