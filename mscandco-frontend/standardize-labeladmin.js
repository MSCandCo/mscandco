const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function standardizeLabelAdmin() {
  console.log('🚀 Standardizing label_admin to labeladmin...\n');

  try {
    // Step 1: Update the role name
    console.log('📝 Step 1: Updating role name...');
    const { data: roleUpdate, error: roleError } = await supabase
      .from('roles')
      .update({
        name: 'labeladmin'
      })
      .eq('name', 'label_admin')
      .select();

    if (roleError) {
      console.error('❌ Error updating role:', roleError);
      return;
    }
    console.log('✅ Role updated: label_admin → labeladmin');

    // Step 2: Get all label_admin permissions
    console.log('\n📝 Step 2: Updating permission names...');
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('*')
      .eq('scope', 'label_admin');

    if (permError) {
      console.error('❌ Error fetching permissions:', permError);
      return;
    }

    console.log(`Found ${permissions.length} permissions to update`);

    // Update each permission
    for (const perm of permissions) {
      const newName = perm.name.replace('label_admin:', 'labeladmin:');

      const { error: updateError } = await supabase
        .from('permissions')
        .update({
          name: newName,
          scope: 'labeladmin'
        })
        .eq('id', perm.id);

      if (updateError) {
        console.error(`❌ Error updating ${perm.name}:`, updateError);
      } else {
        console.log(`✅ ${perm.name} → ${newName}`);
      }
    }

    // Step 3: Verify the changes
    console.log('\n🔍 Verifying changes...');

    const { data: verifyRole, error: verifyRoleError } = await supabase
      .from('roles')
      .select('name')
      .eq('name', 'labeladmin')
      .single();

    if (verifyRoleError) {
      console.error('❌ Error verifying role:', verifyRoleError);
    } else {
      console.log(`\n✅ Role verified:`);
      console.log(`   Name: ${verifyRole.name}`);
      console.log(`   Display: Label Admin`);
    }

    const { data: verifyPerms, error: verifyPermsError } = await supabase
      .from('permissions')
      .select('name, description, scope')
      .eq('scope', 'labeladmin');

    if (verifyPermsError) {
      console.error('❌ Error verifying permissions:', verifyPermsError);
    } else {
      console.log(`\n✅ ${verifyPerms.length} labeladmin permissions:`);
      verifyPerms.forEach(p => {
        console.log(`   ✓ ${p.name}`);
      });
    }

    console.log('\n✨ Migration complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

standardizeLabelAdmin();
