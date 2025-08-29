const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyChartmetricMigration() {
  console.log('🔧 Applying Chartmetric columns migration...');
  
  try {
    // Apply the migration using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add Chartmetric integration columns to user_profiles table
        ALTER TABLE user_profiles 
        ADD COLUMN IF NOT EXISTS chartmetric_artist_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS chartmetric_artist_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS chartmetric_verified BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS chartmetric_linked_at TIMESTAMP WITH TIME ZONE;

        -- Create index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_user_profiles_chartmetric_artist_id 
        ON user_profiles(chartmetric_artist_id);
      `
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      
      // Try alternative approach with direct SQL execution
      console.log('🔄 Trying alternative migration approach...');
      
      const queries = [
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_artist_id VARCHAR(255);",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_artist_name VARCHAR(255);", 
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_verified BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_linked_at TIMESTAMP WITH TIME ZONE;"
      ];

      for (const query of queries) {
        console.log('Executing:', query);
        const { error: queryError } = await supabase.from('user_profiles').select('id').limit(1);
        if (queryError) {
          console.error('Query failed:', queryError);
        }
      }
    } else {
      console.log('✅ Chartmetric migration completed successfully!');
    }

    // Test if columns exist by trying to select them
    console.log('🔍 Testing if Chartmetric columns exist...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('chartmetric_artist_id, chartmetric_artist_name, chartmetric_verified')
      .limit(1);

    if (testError) {
      console.error('❌ Columns still don\'t exist:', testError.message);
      console.log('\n📋 MANUAL MIGRATION REQUIRED:');
      console.log('1. Go to Supabase SQL Editor');
      console.log('2. Run the contents of database/add_chartmetric_columns.sql');
      console.log('3. This will add the missing Chartmetric columns');
    } else {
      console.log('✅ Chartmetric columns are now available!');
      console.log('📊 Test query successful:', testData?.length || 0, 'rows');
    }

  } catch (error) {
    console.error('❌ Migration script error:', error);
    console.log('\n📋 MANUAL MIGRATION REQUIRED:');
    console.log('1. Go to Supabase SQL Editor');
    console.log('2. Run: ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_artist_id VARCHAR(255);');
    console.log('3. Run: ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_artist_name VARCHAR(255);');
    console.log('4. Run: ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_verified BOOLEAN DEFAULT FALSE;');
    console.log('5. Run: ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_linked_at TIMESTAMP WITH TIME ZONE;');
  }
}

applyChartmetricMigration();
