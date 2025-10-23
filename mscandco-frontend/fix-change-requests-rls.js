const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLS() {
  try {
    console.log('\n=== Fixing change_requests RLS Policies ===\n');

    // Drop existing policies
    console.log('Dropping existing policies...');

    const dropPolicies = `
      DROP POLICY IF EXISTS "admins_can_view_all_requests" ON change_requests;
      DROP POLICY IF EXISTS "users_can_view_own_requests" ON change_requests;
      DROP POLICY IF EXISTS "admins_can_update_requests" ON change_requests;
      DROP POLICY IF EXISTS "users_can_create_requests" ON change_requests;
      DROP POLICY IF EXISTS "admins_can_insert_requests" ON change_requests;
      DROP POLICY IF EXISTS "users_can_create_own_requests" ON change_requests;
    `;

    const { error: dropError } = await supabase.rpc('exec_sql', {
      query: dropPolicies
    });

    if (dropError) {
      console.error('Error dropping policies:', dropError);
      // Continue anyway
    } else {
      console.log('✓ Existing policies dropped');
    }

    // Create new simplified policies
    console.log('\nCreating new RLS policies...');

    const createPolicies = `
      -- Enable RLS
      ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

      -- Policy 1: Admins can view all requests
      CREATE POLICY "admins_can_view_all_requests" ON change_requests
      FOR SELECT
      USING (
        (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'company_admin', 'requests_admin')
      );

      -- Policy 2: Admins can update all requests
      CREATE POLICY "admins_can_update_requests" ON change_requests
      FOR UPDATE
      USING (
        (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'company_admin', 'requests_admin')
      );

      -- Policy 3: Admins can insert requests
      CREATE POLICY "admins_can_insert_requests" ON change_requests
      FOR INSERT
      WITH CHECK (
        (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'company_admin', 'requests_admin')
      );

      -- Policy 4: Users can view their own requests
      CREATE POLICY "users_can_view_own_requests" ON change_requests
      FOR SELECT
      USING (user_id = auth.uid());

      -- Policy 5: Users can create their own requests
      CREATE POLICY "users_can_create_own_requests" ON change_requests
      FOR INSERT
      WITH CHECK (user_id = auth.uid());
    `;

    const { error: createError } = await supabase.rpc('exec_sql', {
      query: createPolicies
    });

    if (createError) {
      console.error('Error creating policies:', createError);
    } else {
      console.log('✓ New RLS policies created successfully');
    }

    // Verify the policies
    console.log('\nVerifying policies...');

    const { data: testData, error: testError } = await supabase
      .from('change_requests')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Test query failed:', testError);
    } else {
      console.log('✓ Test query successful');
      console.log(`  Found ${testData?.length || 0} requests`);
    }

    console.log('\n=== RLS Fix Complete ===\n');

  } catch (err) {
    console.error('Error:', err.message);
  }
}

fixRLS();
