/**
 * Apply Migration and Run Tests
 * 1. Apply the denied column migration
 * 2. Run comprehensive permission toggle tests
 */

const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('🚀 Applying Permission Denial Mechanism Migration...\n');

  try {
    // Try to check if column already exists
    const { data, error } = await supabase
      .from('user_permissions')
      .select('denied')
      .limit(1);

    if (!error) {
      console.log('✅ Migration already applied - denied column exists\n');
      return true;
    }

    if (error && error.message.includes('column "denied" does not exist')) {
      console.log('❌ Migration NOT applied - denied column missing');
      console.log('\n⚠️  MANUAL ACTION REQUIRED:');
      console.log('Please run this SQL in Supabase SQL Editor:');
      console.log('https://supabase.com/dashboard/project/vzyhwmvmkkmhyxjmmlnf/sql/new\n');
      console.log('ALTER TABLE user_permissions ADD COLUMN IF NOT EXISTS denied BOOLEAN NOT NULL DEFAULT false;');
      console.log('CREATE INDEX IF NOT EXISTS idx_user_permissions_denied ON user_permissions(user_id, denied);\n');

      console.log('After running the migration, run this script again or run:');
      console.log('node test-all-permissions-playwright-v2.js\n');
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error checking migration:', err);
    return false;
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('🧪 PERMISSION SYSTEM TEST SETUP');
  console.log('='.repeat(80) + '\n');

  // Check migration
  const migrationApplied = await applyMigration();

  if (!migrationApplied) {
    console.log('❌ Cannot run tests without migration');
    console.log('Please apply the migration first (instructions above)\n');
    process.exit(1);
  }

  // Run tests
  console.log('✅ Migration verified - starting comprehensive tests...\n');
  console.log('='.repeat(80));
  console.log('Running: node test-all-permissions-playwright-v2.js');
  console.log('='.repeat(80) + '\n');

  try {
    execSync('node test-all-permissions-playwright-v2.js', {
      stdio: 'inherit',
      cwd: __dirname
    });
  } catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  }
}

main();
