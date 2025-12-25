/**
 * Grant service_role permissions on lyrics table
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function grantPermissions() {
  console.log('🔐 Granting service_role permissions on lyrics table...\n');

  const sql = `
    -- Grant service_role full permissions on lyrics table
    GRANT ALL ON public.lyrics TO service_role;
    GRANT ALL ON public.lyrics TO postgres;

    -- Also ensure authenticated role has permissions
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.lyrics TO authenticated;

    -- Grant usage on the schema
    GRANT USAGE ON SCHEMA public TO service_role;
    GRANT USAGE ON SCHEMA public TO authenticated;
  `;

  try {
    // Try to execute via RPC if available
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ RPC execution failed:', error.message);
      console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:\n');
      console.log('─'.repeat(80));
      console.log(sql);
      console.log('─'.repeat(80));
      console.log('\nSteps:');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Click "SQL Editor" in the left sidebar');
      console.log('4. Click "New query"');
      console.log('5. Paste the SQL above');
      console.log('6. Click "Run"\n');
      return;
    }

    console.log('✅ Permissions granted successfully!');
    console.log('✅ service_role can now access lyrics table');
    console.log('✅ authenticated role can now access lyrics table\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:\n');
    console.log('─'.repeat(80));
    console.log(sql);
    console.log('─'.repeat(80));
  }
}

grantPermissions();
