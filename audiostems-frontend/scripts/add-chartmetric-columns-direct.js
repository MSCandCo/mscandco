const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addChartmetricColumns() {
  console.log('🔧 Adding Chartmetric columns to user_profiles table...');
  
  try {
    // First, let's check current table structure
    const { data: currentColumns, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking table:', checkError);
      return;
    }

    console.log('✅ user_profiles table exists');
    
    // Try to add columns one by one using raw SQL through supabase-js
    const queries = [
      `ALTER TABLE user_profiles ADD COLUMN chartmetric_artist_id VARCHAR(255);`,
      `ALTER TABLE user_profiles ADD COLUMN chartmetric_artist_name VARCHAR(255);`,
      `ALTER TABLE user_profiles ADD COLUMN chartmetric_verified BOOLEAN DEFAULT FALSE;`,
      `ALTER TABLE user_profiles ADD COLUMN chartmetric_linked_at TIMESTAMP WITH TIME ZONE;`
    ];

    for (const query of queries) {
      console.log(`Executing: ${query}`);
      
      try {
        // Use direct SQL execution
        const { data, error } = await supabase.rpc('exec_sql', { query });
        
        if (error) {
          console.log(`⚠️ Query may have failed (column might already exist): ${error.message}`);
        } else {
          console.log('✅ Query executed successfully');
        }
      } catch (err) {
        console.log(`⚠️ Error executing query (column might already exist): ${err.message}`);
      }
    }

    // Test if we can now select the new columns
    console.log('🔍 Testing new columns...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('id, chartmetric_artist_id, chartmetric_artist_name')
      .limit(1);

    if (testError) {
      console.error('❌ Columns still not available:', testError.message);
      console.log('\n📋 PLEASE RUN THIS SQL MANUALLY IN SUPABASE:');
      console.log(`
-- Add Chartmetric columns to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_artist_id VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_artist_name VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_linked_at TIMESTAMP WITH TIME ZONE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_chartmetric_artist_id ON user_profiles(chartmetric_artist_id);
      `);
    } else {
      console.log('✅ Chartmetric columns are now available!');
      console.log('🎯 You can now link artists and the data will persist on refresh!');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
    console.log('\n📋 MANUAL SQL REQUIRED - Run in Supabase SQL Editor:');
    console.log(`
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_artist_id VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_artist_name VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_linked_at TIMESTAMP WITH TIME ZONE;
    `);
  }
}

addChartmetricColumns();
