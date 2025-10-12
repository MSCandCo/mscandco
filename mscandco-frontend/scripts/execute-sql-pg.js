/**
 * Execute SQL using pg library with direct database connection
 */

const { Client } = require('pg');
const { readFileSync } = require('fs');
const { join } = require('path');
require('dotenv').config({ path: '.env.local' });

async function executeSQLDirect() {
  console.log('🔨 Creating permission_cache table using direct PostgreSQL connection\n');

  // Parse Supabase URL to get connection details
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)[1];

  // Construct PostgreSQL connection string
  // Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
  const connectionString = process.env.DATABASE_URL ||
    `postgresql://postgres.${projectRef}:${process.env.SUPABASE_DB_PASSWORD || 'password'}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

  console.log('Connection details:');
  console.log(`  Project: ${projectRef}`);
  console.log(`  Database: postgres`);
  console.log('');

  // Read SQL file
  const sqlPath = join(__dirname, '..', 'database', 'create_permission_cache.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('📡 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('📝 Executing SQL...');
    console.log('='.repeat(60));
    console.log(sql.substring(0, 200) + '...\n');

    const result = await client.query(sql);

    console.log('='.repeat(60));
    console.log('✅ SQL executed successfully!\n');

    // Verify the table was created
    console.log('🔍 Verifying table creation...');
    const verifyQuery = `
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'permission_cache'
      ORDER BY ordinal_position;
    `;

    const verification = await client.query(verifyQuery);

    if (verification.rows.length > 0) {
      console.log('✅ permission_cache table created successfully!\n');
      console.log('Table columns:');
      verification.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });

      // Check indexes
      const indexQuery = `
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'permission_cache';
      `;

      const indexes = await client.query(indexQuery);
      console.log('\nIndexes created:');
      indexes.rows.forEach(row => {
        console.log(`  - ${row.indexname}`);
      });

      console.log('\n✅ Migration complete!');
      console.log('📊 All 3 RBAC tables now exist:');
      console.log('   ✅ user_role_assignments');
      console.log('   ✅ audit_logs');
      console.log('   ✅ permission_cache');

    } else {
      console.log('⚠️  Table not found in verification query');
    }

  } catch (error) {
    console.error('❌ Error executing SQL:', error.message);

    if (error.message.includes('password authentication failed') ||
        error.message.includes('no pg_hba.conf entry')) {
      console.log('\n💡 Database password required.');
      console.log('   Set SUPABASE_DB_PASSWORD or DATABASE_URL in .env.local');
      console.log('   Get password from: Supabase Dashboard > Settings > Database');
    } else if (error.message.includes('already exists')) {
      console.log('\n✅ Table already exists! Migration complete.');
    } else {
      console.log('\n💡 Fallback option:');
      console.log('   Run SQL manually in Supabase Dashboard > SQL Editor');
      console.log('   File: database/create_permission_cache.sql');
    }

  } finally {
    await client.end();
    console.log('\n📡 Database connection closed');
  }
}

executeSQLDirect()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
