/**
 * Apply Permission Denial Mechanism Migration
 * Adds 'denied' column to user_permissions table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🚀 Running Permission Denial Mechanism Migration...\n');

  try {
    // Step 1: Add denied column
    console.log('📝 Adding denied column to user_permissions table...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE user_permissions ADD COLUMN IF NOT EXISTS denied BOOLEAN NOT NULL DEFAULT false;'
    });

    if (alterError) {
      // Try direct query if RPC fails
      const { error: directError } = await supabase
        .from('user_permissions')
        .select('denied')
        .limit(1);

      if (directError && directError.message.includes('column "denied" does not exist')) {
        console.error('❌ Failed to add denied column. Please run this SQL manually in Supabase SQL Editor:');
        console.log('\nALTER TABLE user_permissions ADD COLUMN IF NOT EXISTS denied BOOLEAN NOT NULL DEFAULT false;\n');
        console.log('COMMENT ON COLUMN user_permissions.denied IS \'When true, this permission is explicitly denied for the user, even if granted by their role\';\n');
        console.log('CREATE INDEX IF NOT EXISTS idx_user_permissions_denied ON user_permissions(user_id, denied);\n');
        return;
      }
    }

    console.log('✅ Successfully added denied column\n');

    // Step 2: Verify column exists
    console.log('🔍 Verifying column...');
    const { data, error: verifyError } = await supabase
      .from('user_permissions')
      .select('id, denied')
      .limit(1);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
      return;
    }

    console.log('✅ Column verified successfully\n');

    // Step 3: Count existing permissions
    const { count, error: countError } = await supabase
      .from('user_permissions')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`📊 Total user_permissions records: ${count}`);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. The denied column has been added to user_permissions table');
    console.log('2. All existing records have denied = false by default');
    console.log('3. When toggling permissions off, the system will now set denied = true');
    console.log('4. The getUserPermissions function will filter out denied permissions');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n⚠️  If you see permission errors, please run this SQL manually in Supabase:');
    console.log('\nALTER TABLE user_permissions ADD COLUMN IF NOT EXISTS denied BOOLEAN NOT NULL DEFAULT false;');
    console.log('\nCOMMENT ON COLUMN user_permissions.denied IS \'When true, this permission is explicitly denied for the user, even if granted by their role\';');
    console.log('\nCREATE INDEX IF NOT EXISTS idx_user_permissions_denied ON user_permissions(user_id, denied);');
  }
}

runMigration();
