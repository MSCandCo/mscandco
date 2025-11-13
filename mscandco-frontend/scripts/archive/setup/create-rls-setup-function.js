const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupRLS() {
  console.log('\n=== Setting up RLS for change_requests ===\n');

  // First, let's try to create a temporary function to set up RLS
  console.log('Creating setup function...');

  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION setup_change_requests_rls()
    RETURNS void AS $$
    BEGIN
      -- Drop existing policies
      DROP POLICY IF EXISTS "admins_can_view_all_requests" ON change_requests;
      DROP POLICY IF EXISTS "users_can_view_own_requests" ON change_requests;
      DROP POLICY IF EXISTS "admins_can_update_requests" ON change_requests;
      DROP POLICY IF EXISTS "admins_can_insert_requests" ON change_requests;
      DROP POLICY IF EXISTS "users_can_create_own_requests" ON change_requests;

      -- Enable RLS
      ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

      -- Create policies
      EXECUTE 'CREATE POLICY "admins_can_view_all_requests" ON change_requests FOR SELECT USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN (''super_admin'', ''admin'', ''company_admin'', ''requests_admin''))';

      EXECUTE 'CREATE POLICY "admins_can_update_requests" ON change_requests FOR UPDATE USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN (''super_admin'', ''admin'', ''company_admin'', ''requests_admin''))';

      EXECUTE 'CREATE POLICY "admins_can_insert_requests" ON change_requests FOR INSERT WITH CHECK ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN (''super_admin'', ''admin'', ''company_admin'', ''requests_admin''))';

      EXECUTE 'CREATE POLICY "users_can_view_own_requests" ON change_requests FOR SELECT USING (user_id = auth.uid())';

      EXECUTE 'CREATE POLICY "users_can_create_own_requests" ON change_requests FOR INSERT WITH CHECK (user_id = auth.uid())';
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  // Try to create the function via a REST API call using service role
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/setup_change_requests_rls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({})
    });

    const result = await response.text();
    console.log('Response:', result);
  } catch (err) {
    console.error('Error:', err.message);
  }

  console.log('\n=== Instructions ===');
  console.log('Please run this SQL in Supabase SQL Editor:\n');
  console.log(createFunctionSQL);
  console.log('\nThen call the function:');
  console.log('SELECT setup_change_requests_rls();');
}

setupRLS();
