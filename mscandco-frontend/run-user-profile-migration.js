const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('Adding missing columns to user_profiles table...\n');

    const columns = [
      {
        name: 'short_bio',
        sql: "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS short_bio TEXT"
      },
      {
        name: 'wallet_enabled',
        sql: "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_enabled BOOLEAN DEFAULT true"
      },
      {
        name: 'wallet_credit_limit',
        sql: "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_credit_limit DECIMAL(10, 2) DEFAULT 0.00"
      },
      {
        name: 'profile_completed',
        sql: "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false"
      },
      {
        name: 'locked_fields',
        sql: "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS locked_fields JSONB DEFAULT '[]'::jsonb"
      },
      {
        name: 'approval_required_fields',
        sql: "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS approval_required_fields JSONB DEFAULT '[]'::jsonb"
      },
      {
        name: 'profile_lock_status',
        sql: "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_lock_status TEXT DEFAULT 'unlocked'"
      }
    ];

    for (const col of columns) {
      console.log(`Adding column: ${col.name}...`);
      const { error } = await supabase.rpc('exec_sql', { sql_query: col.sql });

      if (error) {
        console.error(`  ✗ Error: ${error.message}`);
      } else {
        console.log(`  ✓ Success`);
      }
    }

    // Verify the new columns exist
    console.log('\nVerifying new columns...');
    const { data: profiles, error: verifyError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (!verifyError && profiles && profiles.length > 0) {
      const newColumns = [
        'short_bio',
        'wallet_enabled',
        'wallet_credit_limit',
        'profile_completed',
        'locked_fields',
        'approval_required_fields',
        'profile_lock_status'
      ];

      console.log('\nColumn verification:');
      newColumns.forEach(col => {
        const exists = col in profiles[0];
        console.log(`${exists ? '✓' : '✗'} ${col}: ${exists ? 'EXISTS' : 'MISSING'}`);
      });

      console.log('\n✓ Migration completed!');
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

runMigration();
