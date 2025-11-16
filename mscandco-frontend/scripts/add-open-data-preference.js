/**
 * Apply open data preference migration
 * Run with: node scripts/add-open-data-preference.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('🚀 Applying Open Data preference migration...\n');

  try {
    // Read the SQL file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', 'add_open_data_preference.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      const { error: directError } = await supabase.from('user_profiles').select('show_open_data_features').limit(1);

      if (directError && directError.code === '42703') {
        // Column doesn't exist, we need to add it manually
        console.log('⚠️  Column does not exist. Please run this SQL manually in your database:');
        console.log('\n' + sql + '\n');
        console.log('Or use the Supabase dashboard SQL editor.');
        return;
      } else if (!directError) {
        console.log('✅ Column already exists!');
        return;
      }

      throw error;
    }

    console.log('✅ Migration applied successfully!');
    console.log('🎉 Users can now toggle Open Data visibility in their settings.');

  } catch (error) {
    console.error('❌ Error applying migration:', error);
  }
}

applyMigration();
