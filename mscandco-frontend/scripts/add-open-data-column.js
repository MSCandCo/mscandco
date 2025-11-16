/**
 * Add show_open_data_features column to user_profiles table
 * Run with: node scripts/add-open-data-column.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addColumn() {
  console.log('🚀 Adding show_open_data_features column...\n');

  try {
    // Read the SQL file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', 'add_open_data_preference.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('SQL to execute:');
    console.log(sql);
    console.log('');

    // Execute the migration using raw SQL via the REST API
    const { data, error } = await supabase.rpc('exec', { sql });

    if (error) {
      // Check if column already exists
      const { data: testData, error: testError } = await supabase
        .from('user_profiles')
        .select('show_open_data_features')
        .limit(1);

      if (!testError) {
        console.log('✅ Column already exists!');
        return;
      }

      console.error('❌ Error:', error);
      console.log('\n⚠️  Please run this SQL manually in your Supabase SQL Editor:');
      console.log('\n' + sql + '\n');
      return;
    }

    console.log('✅ Migration applied successfully!');
    console.log('🎉 Users can now toggle Open Data visibility in their settings.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Please run the SQL manually in your Supabase SQL Editor.');
  }
}

addColumn();
