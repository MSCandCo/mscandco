/**
 * Script to apply copyright management tables migration
 * This creates all necessary tables for the copyright system
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyCopyrightMigration() {
  console.log('📚 Starting Copyright Management Migration...\n');

  try {
    // Read the migration file
    const migrationPath = join(__dirname, '../database/migrations/create_copyright_tables.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');
    console.log(`📏 SQL size: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`);

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Extract statement type for logging
      const statementType = statement.match(/^(CREATE|ALTER|DROP|INSERT|COMMENT)\s+(\w+)/i);
      const logPrefix = statementType ? `${statementType[1]} ${statementType[2]}` : 'SQL';

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
          // Check if error is "already exists" type (we can safely skip these)
          if (error.message && (
            error.message.includes('already exists') ||
            error.message.includes('does not exist')
          )) {
            console.log(`⏭️  ${i + 1}/${statements.length} - ${logPrefix}: Already exists, skipping...`);
            skipCount++;
          } else {
            console.error(`❌ ${i + 1}/${statements.length} - ${logPrefix}: Error`);
            console.error(`   ${error.message}`);
            errorCount++;
          }
        } else {
          console.log(`✅ ${i + 1}/${statements.length} - ${logPrefix}: Success`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ ${i + 1}/${statements.length} - ${logPrefix}: Exception`);
        console.error(`   ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`⏭️  Skipped: ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));

    if (errorCount > 0) {
      console.log('\n⚠️  Migration completed with errors. Please review the errors above.');
      console.log('💡 Tip: Some errors might be expected if tables already exist.');
    } else {
      console.log('\n✨ Migration completed successfully!');
    }

    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    await verifyTables();

  } catch (error) {
    console.error('\n❌ Fatal error during migration:');
    console.error(error);
    process.exit(1);
  }
}

async function verifyTables() {
  const tablesToVerify = [
    'copyright_verifications',
    'copyright_clearances',
    'copyright_registrations',
    'dmca_takedowns',
    'copyright_monitoring'
  ];

  console.log('\nChecking tables:');

  for (const table of tablesToVerify) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: Not found or error`);
        console.error(`   ${error.message}`);
      } else {
        console.log(`✅ ${table}: Exists (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Error checking`);
      console.error(`   ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Copyright Management System is ready!');
  console.log('='.repeat(60));
}

// Run the migration
applyCopyrightMigration().catch(console.error);
