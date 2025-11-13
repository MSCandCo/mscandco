const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('Adding missing columns to user_profiles table...\n');

    const statements = [
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS short_bio TEXT",
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_enabled BOOLEAN DEFAULT true",
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_credit_limit DECIMAL(10, 2) DEFAULT 0.00",
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false",
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS locked_fields JSONB DEFAULT '[]'::jsonb",
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS approval_required_fields JSONB DEFAULT '[]'::jsonb",
      "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_lock_status TEXT DEFAULT 'unlocked'"
    ];

    for (const sql of statements) {
      const columnName = sql.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
      console.log(`Adding column: ${columnName}...`);
      
      const { data, error } = await supabase.rpc('exec', { sql });

      if (error) {
        // Column might already exist, let's check
        const { data: checkData } = await supabase
          .from('user_profiles')
          .select(columnName)
          .limit(1);
        
        if (checkData !== null) {
          console.log(`  ✓ Column already exists`);
        } else {
          console.error(`  ✗ Error: ${error.message}`);
        }
      } else {
        console.log(`  ✓ Success`);
      }
    }

    // Verify the new columns exist
    console.log('\nVerifying columns...');
    const { data: profiles, error: verifyError } = await supabase
      .from('user_profiles')
      .select('short_bio, wallet_enabled, wallet_credit_limit, profile_completed, locked_fields, approval_required_fields, profile_lock_status')
      .limit(1);

    if (!verifyError) {
      console.log('✓ All columns verified successfully!');
      console.log('\nSample data structure:', profiles && profiles.length > 0 ? Object.keys(profiles[0]) : 'No data');
    } else {
      console.log('Verification result:', verifyError.message);
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

runMigration();
