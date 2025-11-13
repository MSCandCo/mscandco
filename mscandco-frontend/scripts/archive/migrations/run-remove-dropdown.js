const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeDropdownPrefix() {
  console.log('🚀 Removing dropdown: prefix from permissions...\n');

  try {
    // Fetch all permissions with dropdown: prefix
    const { data: dropdownPerms, error: fetchError } = await supabase
      .from('permissions')
      .select('*')
      .like('name', 'dropdown:%');

    if (fetchError) {
      console.error('❌ Error fetching permissions:', fetchError);
      process.exit(1);
    }

    console.log(`Found ${dropdownPerms.length} permissions with dropdown: prefix\n`);

    if (dropdownPerms.length === 0) {
      console.log('✨ No permissions with dropdown: prefix found. Migration may have already run.');
      return;
    }

    for (const perm of dropdownPerms) {
      const newName = perm.name.replace('dropdown:', '');
      console.log(`  Renaming: ${perm.name} → ${newName}`);

      const { error: updateError } = await supabase
        .from('permissions')
        .update({ name: newName })
        .eq('id', perm.id);

      if (updateError) {
        console.error(`  ❌ Error updating ${perm.name}:`, updateError);
      } else {
        console.log(`  ✅ Updated ${newName}`);
      }
    }

    // Verify the changes
    console.log('\n🔍 Verifying changes...\n');
    const { data: verifyData, error: verifyError } = await supabase
      .from('permissions')
      .select('name, description, resource')
      .in('resource', ['platform_messages', 'settings'])
      .order('resource')
      .order('name');

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
    } else {
      console.log('Updated permissions:');
      verifyData.forEach(p => {
        console.log(`  - ${p.name} (${p.resource})`);
      });
    }

    console.log('\n✨ Migration complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

removeDropdownPrefix();
