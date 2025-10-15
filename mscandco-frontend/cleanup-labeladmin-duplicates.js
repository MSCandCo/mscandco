const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupDuplicates() {
  console.log('🧹 Cleaning up label_admin duplicate permissions...\n');

  try {
    // Step 1: Find all label_admin: permissions
    const { data: oldPerms, error: oldError } = await supabase
      .from('permissions')
      .select('*')
      .like('name', 'label\_admin:%');

    if (oldError) {
      console.error('❌ Error fetching old permissions:', oldError);
      return;
    }

    console.log(`Found ${oldPerms.length} label_admin:* permissions to remove\n`);

    // Step 2: For each one, delete it
    for (const perm of oldPerms) {
      console.log(`🗑️  Deleting: ${perm.name}`);

      const { error: delError } = await supabase
        .from('permissions')
        .delete()
        .eq('id', perm.id);

      if (delError) {
        console.error(`❌ Error deleting ${perm.name}:`, delError);
      } else {
        console.log(`✅ Deleted ${perm.name}`);
      }
    }

    // Step 3: Verify only labeladmin: permissions remain
    console.log('\n🔍 Verifying cleanup...');

    const { data: remainingOld, error: checkError } = await supabase
      .from('permissions')
      .select('name')
      .like('name', 'label\_admin:%');

    if (checkError) {
      console.error('❌ Error checking:', checkError);
    } else {
      console.log(`\n${remainingOld.length} label_admin:* permissions remaining (should be 0)`);
      if (remainingOld.length > 0) {
        remainingOld.forEach(p => console.log(`   ⚠️  ${p.name}`));
      }
    }

    const { data: newPerms, error: newError } = await supabase
      .from('permissions')
      .select('name')
      .like('name', 'labeladmin:%');

    if (newError) {
      console.error('❌ Error checking:', newError);
    } else {
      console.log(`\n✅ ${newPerms.length} labeladmin:* permissions exist:`);
      newPerms.forEach(p => console.log(`   ✓ ${p.name}`));
    }

    console.log('\n✨ Cleanup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupDuplicates();
