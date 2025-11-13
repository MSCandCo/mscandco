/**
 * Fix Admin Role Permissions
 *
 * Add universal :access permissions to super_admin and company_admin roles
 * so they can access pages that check for these permissions.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log('🔧 Fixing admin role permissions...\n');

  // Create Supabase client with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Universal :access permissions that admin roles should have
  const universalPermissions = [
    'analytics:access',
    'earnings:access',
    'releases:access',
    'roster:access',
    'messages:access',
    'settings:access',
    'dashboard:access',
    'profile:access',
    'platform:access'
  ];

  // Get super_admin and company_admin role IDs
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name')
    .in('name', ['super_admin', 'company_admin']);

  if (rolesError) {
    console.error('❌ Error fetching roles:', rolesError);
    return;
  }

  console.log(`✅ Found ${roles.length} admin roles:`, roles.map(r => r.name).join(', '));

  // Get permission IDs for universal :access permissions
  const { data: permissions, error: permsError } = await supabase
    .from('permissions')
    .select('id, name')
    .in('name', universalPermissions);

  if (permsError) {
    console.error('❌ Error fetching permissions:', permsError);
    return;
  }

  console.log(`✅ Found ${permissions.length} universal :access permissions\n`);

  // For each admin role, assign all universal :access permissions
  for (const role of roles) {
    console.log(`📝 Processing role: ${role.name}`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const permission of permissions) {
      // Check if permission is already assigned
      const { data: existing } = await supabase
        .from('role_permissions')
        .select('id')
        .eq('role_id', role.id)
        .eq('permission_id', permission.id)
        .single();

      if (existing) {
        console.log(`  ⏭️  ${permission.name} - already assigned`);
        skippedCount++;
        continue;
      }

      // Assign permission to role
      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert({
          role_id: role.id,
          permission_id: permission.id
        });

      if (insertError) {
        console.log(`  ❌ ${permission.name} - error: ${insertError.message}`);
      } else {
        console.log(`  ✅ ${permission.name} - added`);
        addedCount++;
      }
    }

    console.log(`\n  Summary for ${role.name}:`);
    console.log(`    ✅ Added: ${addedCount}`);
    console.log(`    ⏭️  Skipped: ${skippedCount}\n`);
  }

  // Verify the fix by checking final permission counts
  console.log('🔍 Verifying final permission counts...\n');

  for (const role of roles) {
    const { data: rolePerms, error } = await supabase
      .from('role_permissions')
      .select('id')
      .eq('role_id', role.id);

    if (!error) {
      console.log(`  ${role.name}: ${rolePerms.length} total permissions`);
    }
  }

  console.log('\n✅ Admin role permissions fixed!');
}

main();
