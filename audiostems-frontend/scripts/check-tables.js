/**
 * Check if RBAC tables exist
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('🔍 Checking if RBAC tables exist...\n');

  const tablesToCheck = [
    'user_role_assignments',
    'audit_logs',
    'permission_cache'
  ];

  const results = {};

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          results[table] = { exists: false, error: 'Table does not exist' };
        } else if (error.code === '42501' || error.message.includes('permission denied')) {
          results[table] = { exists: true, accessible: false, error: 'Permission denied (table exists but RLS blocking)' };
        } else {
          results[table] = { exists: false, error: error.message };
        }
      } else {
        results[table] = { exists: true, accessible: true, recordCount: data?.length || 0 };
      }
    } catch (err) {
      results[table] = { exists: false, error: err.message };
    }
  }

  // Display results
  console.log('Table Status:');
  console.log('='.repeat(60));
  for (const [table, status] of Object.entries(results)) {
    if (status.exists && status.accessible) {
      console.log(`✅ ${table}: EXISTS (accessible)`);
    } else if (status.exists && !status.accessible) {
      console.log(`⚠️  ${table}: EXISTS (not accessible - RLS enabled)`);
    } else {
      console.log(`❌ ${table}: DOES NOT EXIST`);
    }
  }
  console.log('='.repeat(60));

  // Summary
  const existingTables = Object.values(results).filter(r => r.exists).length;
  const needsMigration = existingTables < tablesToCheck.length;

  console.log(`\n📊 Summary:`);
  console.log(`   Tables found: ${existingTables}/${tablesToCheck.length}`);
  console.log(`   Migration needed: ${needsMigration ? 'YES' : 'NO'}`);

  return { results, needsMigration };
}

checkTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Error checking tables:', error);
    process.exit(1);
  });
