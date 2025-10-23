const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRLSPolicies() {
  try {
    console.log('\n=== Checking RLS Policies for change_requests ===\n');

    // Direct SQL query to check policies
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          schemaname,
          tablename,
          policyname,
          permissive,
          roles::text[],
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE tablename = 'change_requests'
        ORDER BY policyname;
      `
    });

    if (error) {
      console.error('Error:', error);

      // Try alternative method
      console.log('\nTrying alternative query method...\n');

      const { data: altData, error: altError } = await supabase
        .from('change_requests')
        .select('*')
        .limit(0);

      console.log('Table exists:', !altError);
      if (altError) console.error('Table error:', altError);

      // Check if RLS is enabled
      const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', {
        query: `
          SELECT
            schemaname,
            tablename,
            rowsecurity
          FROM pg_tables
          WHERE tablename = 'change_requests';
        `
      });

      if (!rlsError && rlsData) {
        console.log('\nRLS Status:', rlsData);
      }
    } else {
      console.log('Policies found:', data);
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkRLSPolicies();
