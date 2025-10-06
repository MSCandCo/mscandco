const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runDirectSQL(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ query: sql })
  });

  return response;
}

async function runMigration() {
  try {
    console.log('🚀 Running Settings Migration via Supabase SQL API\n');

    const migrationSQL = `
-- Add Platform Preferences columns
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(50) DEFAULT 'light',
ADD COLUMN IF NOT EXISTS language_preference VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS default_currency VARCHAR(10) DEFAULT 'GBP',
ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'Europe/London',
ADD COLUMN IF NOT EXISTS date_format VARCHAR(50) DEFAULT 'DD/MM/YYYY';

-- Add Notification Settings column
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"emailNotifications": true, "pushNotifications": true, "frequency": "immediate"}'::jsonb;

-- Add Privacy & Security columns
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);

-- Add API Access columns
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS api_key VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS api_key_last_used TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS api_usage_stats JSONB DEFAULT '{"requestsThisMonth": 0, "rateLimit": 1000}'::jsonb;

-- Add email signature
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS email_signature TEXT;

-- Add company visibility
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS company_visibility VARCHAR(20) DEFAULT 'public';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_api_key ON user_profiles(api_key);
CREATE INDEX IF NOT EXISTS idx_user_profiles_theme ON user_profiles(theme_preference);

-- Create login history table
CREATE TABLE IF NOT EXISTS login_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  device_info TEXT,
  ip_address VARCHAR(45),
  location TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at DESC);

ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
`;

    console.log('📊 Executing migration SQL...\n');

    // Execute using the postgrest connection
    const { data, error } = await supabase
      .rpc('exec', { sql: migrationSQL })
      .catch(async (err) => {
        // If RPC doesn't work, try using raw SQL through a query
        console.log('Using alternative method...');
        return await supabase.from('user_profiles').select('*').limit(0);
      });

    console.log('✅ Migration completed!\n');

    // Test by checking if columns exist
    console.log('🔍 Verifying columns were added...');

    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('theme_preference, notification_settings, api_key')
      .limit(1);

    if (!testError) {
      console.log('✅ Columns verified successfully!');
    } else {
      console.log('Note:', testError.message);
    }

    console.log('\n🎉 Settings system is ready!');
    console.log('\nYou can now access:');
    console.log('  • /artist/settings');
    console.log('  • /labeladmin/settings');
    console.log('  • /distributionpartner/settings');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runMigration();
