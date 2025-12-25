const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🔧 Running Chartmetric columns migration...');
  
  try {
    // Execute each SQL statement individually
    const migrations = [
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_artist_id VARCHAR(255);",
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_artist_name VARCHAR(255);",
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_verified BOOLEAN DEFAULT FALSE;",
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS chartmetric_linked_at TIMESTAMP WITH TIME ZONE;"
    ];

    for (const sql of migrations) {
      console.log('Executing:', sql);
      const { error } = await supabase.rpc('exec', { sql });
      if (error) {
        console.error('Error:', error);
      }
    }

    // Test if columns exist
    const { data, error } = await supabase
      .from('user_profiles')
      .select('chartmetric_artist_id')
      .limit(1);

    if (error) {
      console.error('❌ Migration verification failed:', error);
      console.log('\n📋 PLEASE RUN THIS SQL IN SUPABASE MANUALLY:');
      console.log(`
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS chartmetric_artist_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS chartmetric_artist_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS chartmetric_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS chartmetric_linked_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_user_profiles_chartmetric_artist_id 
ON user_profiles(chartmetric_artist_id);
      `);
    } else {
      console.log('✅ Chartmetric columns are available!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n📋 PLEASE RUN THIS SQL IN SUPABASE MANUALLY:');
    console.log(`
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS chartmetric_artist_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS chartmetric_artist_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS chartmetric_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS chartmetric_linked_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_user_profiles_chartmetric_artist_id 
ON user_profiles(chartmetric_artist_id);
    `);
  }
}

runMigration();
