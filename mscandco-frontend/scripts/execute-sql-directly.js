/**
 * Execute SQL directly using pg library
 */

const { readFileSync } = require('fs');
const { join } = require('path');
require('dotenv').config({ path: '.env.local' });

async function executeSQL() {
  console.log('🔨 Executing permission_cache table creation SQL\n');

  // Read the SQL file
  const sqlPath = join(__dirname, '..', 'database', 'create_permission_cache.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  console.log('SQL to execute:');
  console.log('='.repeat(60));
  console.log(sql);
  console.log('='.repeat(60));

  // Parse connection string from Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)[1];

  // Try using psql command if available
  const { execSync } = require('child_process');

  try {
    console.log('\n💡 Attempting to execute via psql...\n');

    // Write SQL to temp file
    const { writeFileSync } = require('fs');
    const tmpFile = '/tmp/create_permission_cache.sql';
    writeFileSync(tmpFile, sql);

    // Note: This requires database password which we don't have
    console.log('❌ Cannot execute SQL automatically - database credentials required');
    console.log('\n📋 Please run this SQL manually in Supabase Dashboard:');
    console.log('   1. Go to https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
    console.log('   2. Copy the SQL from: database/create_permission_cache.sql');
    console.log('   3. Click "Run"');
    console.log('\nOr use the Supabase CLI:');
    console.log('   supabase db execute --file database/create_permission_cache.sql');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

executeSQL()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
