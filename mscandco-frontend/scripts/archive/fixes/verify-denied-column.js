/**
 * Verify that the 'denied' column exists in user_permissions table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
  console.log('🔍 Checking if denied column exists in user_permissions table...\n');

  try {
    // Try to select the denied column
    const { data, error } = await supabase
      .from('user_permissions')
      .select('id, user_id, permission_id, denied')
      .limit(5);

    if (error) {
      if (error.message.includes('column "denied" does not exist')) {
        console.log('❌ MIGRATION NOT APPLIED: denied column does not exist\n');
        console.log('Please run this SQL in Supabase SQL Editor:');
        console.log('https://supabase.com/dashboard/project/vzyhwmvmkkmhyxjmmlnf/sql/new\n');
        console.log('ALTER TABLE user_permissions ADD COLUMN IF NOT EXISTS denied BOOLEAN NOT NULL DEFAULT false;');
        console.log('CREATE INDEX IF NOT EXISTS idx_user_permissions_denied ON user_permissions(user_id, denied);');
        return false;
      }

      console.error('❌ Error querying user_permissions:', error);
      return false;
    }

    console.log('✅ SUCCESS: denied column exists!\n');
    console.log(`Found ${data.length} rows in user_permissions table:`);
    data.forEach(row => {
      console.log(`  - User: ${row.user_id.substring(0, 8)}... Permission: ${row.permission_id.substring(0, 8)}... Denied: ${row.denied || false}`);
    });

    return true;

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

verify().then(success => {
  if (success) {
    console.log('\n✅ You can now run the permission tests!');
    console.log('Run: node test-all-permissions-playwright-v2.js');
  } else {
    console.log('\n❌ Please apply the migration first before running tests');
  }
});
