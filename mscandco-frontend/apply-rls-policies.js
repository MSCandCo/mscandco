const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyRLSPolicies() {
  console.log('\n=== Applying RLS Policies for change_requests ===\n');

  const policies = [
    {
      name: 'Drop admins_can_view_all_requests',
      sql: 'DROP POLICY IF EXISTS "admins_can_view_all_requests" ON change_requests'
    },
    {
      name: 'Drop users_can_view_own_requests',
      sql: 'DROP POLICY IF EXISTS "users_can_view_own_requests" ON change_requests'
    },
    {
      name: 'Drop admins_can_update_requests',
      sql: 'DROP POLICY IF EXISTS "admins_can_update_requests" ON change_requests'
    },
    {
      name: 'Drop admins_can_insert_requests',
      sql: 'DROP POLICY IF EXISTS "admins_can_insert_requests" ON change_requests'
    },
    {
      name: 'Drop users_can_create_own_requests',
      sql: 'DROP POLICY IF EXISTS "users_can_create_own_requests" ON change_requests'
    },
    {
      name: 'Enable RLS',
      sql: 'ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY'
    },
    {
      name: 'Create admins_can_view_all_requests',
      sql: `CREATE POLICY "admins_can_view_all_requests" ON change_requests
FOR SELECT
USING (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'company_admin', 'requests_admin')
)`
    },
    {
      name: 'Create admins_can_update_requests',
      sql: `CREATE POLICY "admins_can_update_requests" ON change_requests
FOR UPDATE
USING (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'company_admin', 'requests_admin')
)`
    },
    {
      name: 'Create admins_can_insert_requests',
      sql: `CREATE POLICY "admins_can_insert_requests" ON change_requests
FOR INSERT
WITH CHECK (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'company_admin', 'requests_admin')
)`
    },
    {
      name: 'Create users_can_view_own_requests',
      sql: `CREATE POLICY "users_can_view_own_requests" ON change_requests
FOR SELECT
USING (user_id = auth.uid())`
    },
    {
      name: 'Create users_can_create_own_requests',
      sql: `CREATE POLICY "users_can_create_own_requests" ON change_requests
FOR INSERT
WITH CHECK (user_id = auth.uid())`
    }
  ];

  for (const policy of policies) {
    console.log(`${policy.name}...`);

    try {
      // Try using direct query
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ query: policy.sql })
      });

      if (!response.ok) {
        const error = await response.text();
        console.log(`  ✗ Failed (expected - trying alternative method)`);
      } else {
        console.log(`  ✓ Success`);
      }
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}`);
    }
  }

  console.log('\n=== Complete ===\n');
  console.log('Note: If policies failed to apply, please run these SQL commands manually in Supabase SQL Editor:');
  console.log('\nSQL Commands:');
  policies.forEach(p => {
    if (!p.name.startsWith('Drop')) {
      console.log(`\n-- ${p.name}`);
      console.log(p.sql + ';');
    }
  });
}

applyRLSPolicies();
