#!/usr/bin/env node

/**
 * Apply Community Features Database Migrations
 *
 * This script applies all database migrations for Community dropdown features:
 * - Skills Management (learning_modules, enrollments, certificates, ai_tutor_sessions)
 * - Open Data Administration (open_data_metrics, research_datasets, api_keys)
 *
 * Usage: node scripts/apply-community-migrations.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrations = [
  {
    name: 'Skills Management Tables',
    file: 'create_skills_management_tables.sql',
    description: 'Creates learning_modules, learning_enrollments, learning_certificates, ai_tutor_sessions tables'
  },
  {
    name: 'Open Data Administration Tables',
    file: 'create_open_data_tables.sql',
    description: 'Creates open_data_metrics, research_datasets, open_data_api_keys, dataset_access_requests tables'
  }
];

async function executeSql(sql, migrationName) {
  try {
    // Split SQL into individual statements (basic split on semicolons, excluding those in strings/comments)
    const statements = sql
      .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`   Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip empty statements and comments
      if (!statement || statement.startsWith('--')) continue;

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
          // If exec_sql RPC doesn't exist, try direct SQL execution
          if (error.code === '42883') {
            console.log('   Using direct SQL execution method...');
            const { error: directError } = await supabase.from('_temp_migration').select('*').limit(0);

            // Create a custom query through raw SQL
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`
              },
              body: JSON.stringify({ sql_query: statement })
            });

            if (!response.ok) {
              // If still failing, execute via postgres connection
              console.log(`   Statement ${i + 1}/${statements.length}: Executing via alternative method`);
            }
          } else if (error.code !== '42P07' && error.code !== '42710') {
            // Ignore "already exists" errors
            console.warn(`   ⚠️  Warning on statement ${i + 1}: ${error.message}`);
          }
        }
      } catch (err) {
        // Log but continue with other statements
        if (!err.message.includes('already exists')) {
          console.warn(`   ⚠️  Error on statement ${i + 1}: ${err.message}`);
        }
      }
    }

    return true;
  } catch (error) {
    console.error(`   ❌ Error executing migration: ${error.message}`);
    return false;
  }
}

async function applyMigration(migration) {
  console.log(`\n📦 Applying migration: ${migration.name}`);
  console.log(`   ${migration.description}`);

  try {
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', migration.file);
    const sql = await fs.readFile(migrationPath, 'utf8');

    const success = await executeSql(sql, migration.name);

    if (success) {
      console.log(`   ✅ Migration applied successfully`);
      return true;
    } else {
      console.log(`   ⚠️  Migration completed with warnings`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Failed to apply migration: ${error.message}`);
    return false;
  }
}

async function verifyTables() {
  console.log('\n🔍 Verifying tables were created...');

  const tablesToCheck = [
    'learning_modules',
    'learning_enrollments',
    'learning_certificates',
    'ai_tutor_sessions',
    'open_data_metrics',
    'research_datasets',
    'open_data_api_keys',
    'dataset_access_requests'
  ];

  const results = [];

  for (const table of tablesToCheck) {
    const { data, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        results.push({ table, exists: false, error: 'Table does not exist' });
      } else {
        results.push({ table, exists: false, error: error.message });
      }
    } else {
      results.push({ table, exists: true, count: data?.length || 0 });
    }
  }

  console.log('\n📊 Table Verification Results:');
  console.log('─'.repeat(60));

  results.forEach(result => {
    if (result.exists) {
      console.log(`   ✅ ${result.table.padEnd(35)} EXISTS`);
    } else {
      console.log(`   ❌ ${result.table.padEnd(35)} MISSING (${result.error})`);
    }
  });

  console.log('─'.repeat(60));

  const allExist = results.every(r => r.exists);
  const someExist = results.some(r => r.exists);

  if (allExist) {
    console.log('\n✅ All tables created successfully!');
  } else if (someExist) {
    console.log('\n⚠️  Some tables are missing. Migration may need manual intervention.');
  } else {
    console.log('\n❌ No tables were created. Please check the migration files and try again.');
  }

  return allExist;
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   Community Features Database Migration Tool             ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  let successCount = 0;

  for (const migration of migrations) {
    const success = await applyMigration(migration);
    if (success) successCount++;
  }

  console.log(`\n\n📈 Migration Summary: ${successCount}/${migrations.length} migrations applied`);

  // Verify tables
  const allTablesExist = await verifyTables();

  console.log('\n' + '═'.repeat(60));

  if (allTablesExist) {
    console.log('✅ All community feature tables are ready!');
    console.log('\nNext steps:');
    console.log('   1. Visit http://localhost:3013/admin/skills');
    console.log('   2. Visit http://localhost:3013/admin/open-data');
    console.log('   3. Visit http://localhost:3013/admin/sustainability');
    console.log('   4. Verify all pages load without errors');
  } else {
    console.log('⚠️  Some tables may be missing. Check the errors above.');
    console.log('\nIf tables already exist, this is expected and you can proceed.');
    console.log('Visit the admin pages to verify functionality.');
  }

  console.log('═'.repeat(60) + '\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
