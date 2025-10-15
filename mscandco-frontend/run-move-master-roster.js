const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function moveMasterRosterToUsersAccess() {
  console.log('🚀 Moving Master Roster from Content to Users & Access...\n');

  try {
    // Update all master_roster permissions from content: to users_access:
    const updates = [
      { old: 'content:master_roster:read', new: 'users_access:master_roster:read' },
      { old: 'content:master_roster:create', new: 'users_access:master_roster:create' },
      { old: 'content:master_roster:update', new: 'users_access:master_roster:update' },
      { old: 'content:master_roster:delete', new: 'users_access:master_roster:delete' }
    ];

    for (const { old: oldName, new: newName } of updates) {
      console.log(`📝 Renaming: ${oldName} → ${newName}`);

      const { error } = await supabase
        .from('permissions')
        .update({ name: newName })
        .eq('name', oldName);

      if (error) {
        console.error(`  ❌ Error updating ${oldName}:`, error);
      } else {
        console.log(`  ✅ Updated ${newName}`);
      }
    }

    // Verify the changes
    console.log('\n🔍 Verifying changes...\n');
    const { data: verifyData, error: verifyError } = await supabase
      .from('permissions')
      .select('name, description, resource')
      .eq('resource', 'master_roster')
      .order('name');

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
    } else {
      console.log('Master Roster permissions:');
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

moveMasterRosterToUsersAccess();
