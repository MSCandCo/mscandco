const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTableStructures() {
  console.log('🔍 Checking table structures and missing columns...\n');
  
  const tables = ['user_profiles', 'artists', 'releases', 'change_requests', 'revenue_distributions', 'wallet_transactions'];
  
  for (const table of tables) {
    try {
      console.log(`📋 Checking ${table}:`);
      
      // Get table structure
      const { data, error } = await supabaseAdmin
        .rpc('get_table_columns', { table_name: table })
        .catch(async () => {
          // Fallback: try to get one row to see structure
          const { data: sampleData, error: sampleError } = await supabaseAdmin
            .from(table)
            .select('*')
            .limit(1);
          
          if (sampleError) {
            return { data: null, error: sampleError };
          }
          
          // If we get data (even empty), the table exists and is accessible
          return { data: sampleData, error: null, accessible: true };
        });
      
      if (error) {
        console.log(`❌ ${table} - ${error.message}`);
      } else if (data && data.accessible !== undefined) {
        console.log(`✅ ${table} - accessible, structure unknown`);
      } else {
        console.log(`✅ ${table} - columns:`, data ? data.map(col => col.column_name).join(', ') : 'structure available');
      }
      
    } catch (err) {
      console.log(`❌ ${table} - ${err.message}`);
    }
    console.log('');
  }
  
  // Check for specific missing columns based on the error
  console.log('🔍 Checking for specific missing columns...\n');
  
  const columnChecks = [
    { table: 'change_requests', column: 'requester_id' },
    { table: 'change_requests', column: 'requested_by' },
    { table: 'releases', column: 'artist_id' },
    { table: 'revenue_distributions', column: 'artist_id' },
    { table: 'revenue_distributions', column: 'label_admin_id' },
    { table: 'revenue_distributions', column: 'company_admin_id' },
    { table: 'wallet_transactions', column: 'user_id' }
  ];
  
  for (const check of columnChecks) {
    try {
      const { data, error } = await supabaseAdmin
        .from(check.table)
        .select(check.column)
        .limit(1);
      
      if (error && error.message.includes('does not exist')) {
        console.log(`❌ Missing: ${check.table}.${check.column}`);
      } else {
        console.log(`✅ Exists: ${check.table}.${check.column}`);
      }
    } catch (err) {
      console.log(`❌ Error checking ${check.table}.${check.column}: ${err.message}`);
    }
  }
}

checkTableStructures();
