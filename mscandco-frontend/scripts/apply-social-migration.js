const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Applying social/community tables migration...\n');

  const sqlFile = path.join(__dirname, '../database/migrations/create_social_community_tables.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  // Split by semicolons and filter out comments and empty statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && s !== '');

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';

    // Skip comment-only statements
    if (statement.trim().startsWith('--')) continue;

    // Extract table/view name for logging
    const match = statement.match(/CREATE\s+(TABLE|INDEX|VIEW|TRIGGER|FUNCTION|POLICY)\s+(?:IF NOT EXISTS\s+)?(?:OR REPLACE\s+)?(?:"?(\w+)"?\.)?(?:"?(\w+)"?)/i);
    const objectType = match ? match[1] : 'STATEMENT';
    const objectName = match ? (match[3] || match[2]) : '';

    try {
      const { data, error } = await supabase.rpc('exec_sql', { query: statement });

      if (error) throw error;

      console.log(`✅ [${i + 1}/${statements.length}] ${objectType} ${objectName || ''}`);
      successCount++;
    } catch (error) {
      console.error(`❌ [${i + 1}/${statements.length}] ${objectType} ${objectName || ''}`);
      console.error(`   Error: ${error.message}`);

      // Don't exit on error - some statements might fail if objects already exist
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Migration Summary:`);
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log('='.repeat(60));

  // Verify tables were created
  console.log('\n🔍 Verifying tables...\n');

  const tablesToCheck = [
    'social_connections',
    'social_posts',
    'user_followers',
    'community_posts',
    'community_post_likes',
    'community_post_comments'
  ];

  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table "${tableName}" - Error: ${error.message}`);
      } else {
        console.log(`✅ Table "${tableName}" - Ready`);
      }
    } catch (error) {
      console.log(`❌ Table "${tableName}" - ${error.message}`);
    }
  }

  console.log('\n✨ Migration complete!\n');
}

applyMigration().catch(error => {
  console.error('💥 Migration failed:', error);
  process.exit(1);
});
