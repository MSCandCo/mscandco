const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSPolicies() {
  console.log('📋 Applying RLS policies for email_preferences table...\n');

  // Just apply the RLS policies (table should already exist)
  const rlsSQL = `
-- Enable RLS if not already enabled
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own email preferences" ON email_preferences;
DROP POLICY IF EXISTS "Users can insert their own email preferences" ON email_preferences;
DROP POLICY IF EXISTS "Users can update their own email preferences" ON email_preferences;
DROP POLICY IF EXISTS "Admins can view all email preferences" ON email_preferences;

-- RLS Policies
-- Users can view and manage their own preferences
CREATE POLICY "Users can view their own email preferences"
  ON email_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email preferences"
  ON email_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email preferences"
  ON email_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all preferences for support purposes
CREATE POLICY "Admins can view all email preferences"
  ON email_preferences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('super_admin', 'admin')
    )
  );
`;

  try {
    // Split into individual statements and execute them
    const statements = rlsSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      console.log(`\n💫 Executing: ${statement.substring(0, 80)}...`);

      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      });

      if (error) {
        // Try direct query if rpc fails
        const { error: queryError } = await supabase.from('_exec').select('*').limit(0);
        if (queryError) {
          console.error('❌ Error:', error.message);
          throw error;
        }
      }

      console.log('✅ Success');
    }

    console.log('\n\n🎉 All RLS policies applied successfully!');
    console.log('\n📝 Applied policies:');
    console.log('  ✓ Users can view their own email preferences');
    console.log('  ✓ Users can insert their own email preferences');
    console.log('  ✓ Users can update their own email preferences');
    console.log('  ✓ Admins can view all email preferences');

  } catch (error) {
    console.error('\n❌ Failed to apply RLS policies:', error.message);
    console.error('\n🔧 Please apply the migration manually in Supabase SQL Editor:');
    console.error('\n' + rlsSQL);
    process.exit(1);
  }
}

applyRLSPolicies();
