const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addDistributionPermissions() {
  console.log('🚀 Adding distribution :access permissions...\n');

  try {
    // Step 1: Create the permissions
    console.log('📝 Creating new permissions...');

    const permissionsToAdd = [
      {
        name: 'distribution:distribution_hub:access',
        description: 'Access Distribution Hub page',
        resource: 'distribution_hub',
        action: 'access',
        scope: 'distribution',
        resource_type: 'Distribution'
      },
      {
        name: 'distribution:revenue_reporting:access',
        description: 'Access Revenue Reporting page',
        resource: 'revenue_reporting',
        action: 'access',
        scope: 'distribution',
        resource_type: 'Distribution'
      },
      {
        name: 'distribution:releases:access',
        description: 'Access Distribution Releases',
        resource: 'releases',
        action: 'access',
        scope: 'distribution',
        resource_type: 'Distribution'
      },
      {
        name: 'distribution:settings:access',
        description: 'Access Distribution Settings',
        resource: 'settings',
        action: 'access',
        scope: 'distribution',
        resource_type: 'Distribution'
      }
    ];

    for (const perm of permissionsToAdd) {
      const { data, error } = await supabase
        .from('permissions')
        .upsert(perm, { onConflict: 'name' })
        .select();

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error(`❌ Error creating ${perm.name}:`, error);
      } else {
        console.log(`✅ ${perm.name}`);
      }
    }

    // Step 2: Get the distribution_partner role ID
    console.log('\n🔍 Finding distribution_partner role...');
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('name', 'distribution_partner')
      .single();

    if (roleError) {
      console.error('❌ Error finding distribution_partner role:', roleError);
      return;
    }

    console.log(`✅ Found role: ${role.name} (${role.id})`);

    // Step 3: Get the permission IDs
    console.log('\n🔍 Getting permission IDs...');
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('id, name')
      .in('name', permissionsToAdd.map(p => p.name));

    if (permError) {
      console.error('❌ Error getting permissions:', permError);
      return;
    }

    console.log(`✅ Found ${permissions.length} permissions`);

    // Step 4: Assign permissions to role
    console.log('\n📌 Assigning permissions to distribution_partner role...');

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
        console.error(`❌ Error assigning ${perm.name}:`, assignError);
      } else {
        console.log(`✅ Assigned: ${perm.name}`);
      }
    }

    // Step 5: Verify
    console.log('\n✅ Migration complete! Verifying...\n');

    const { data: rolePerms, error: verifyError } = await supabase
      .from('role_permissions')
      .select(`
        permissions (name, description)
      `)
      .eq('role_id', role.id);

    if (!verifyError) {
      const distPerms = rolePerms
        .map(rp => rp.permissions)
        .filter(p => p.name.startsWith('distribution:') && p.name.includes(':access'));

      console.log(`📋 Distribution Partner has ${distPerms.length} distribution :access permissions:`);
      distPerms.forEach(p => {
        console.log(`   ✓ ${p.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addDistributionPermissions();
