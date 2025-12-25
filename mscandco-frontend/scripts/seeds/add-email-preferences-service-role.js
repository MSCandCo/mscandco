const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addServiceRolePolicy() {
  console.log('📋 Adding service role policy for email_preferences...\n');

  const sql = `
-- Drop existing service role policy if it exists
DROP POLICY IF EXISTS "Service role can access email preferences" ON email_preferences;

-- Create service role policy
CREATE POLICY "Service role can access email preferences"
  ON email_preferences
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON email_preferences TO service_role;
  `;

  try {
    // Execute via RPC if available, otherwise provide manual instructions
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.log('⚠️  RPC not available. Please run this SQL manually in Supabase SQL Editor:\n');
      console.log(sql);
      console.log('\n📝 Steps:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Paste the SQL above');
      console.log('3. Run it');
      return;
    }

    console.log('✅ Service role policy added successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:\n');
    console.log(sql);
  }
}

addServiceRolePolicy();

