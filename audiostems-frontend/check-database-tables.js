const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('🔍 Checking database tables...\n');
  
  const tables = ['user_profiles', 'artists', 'releases', 'wallets', 'change_requests'];
  
  console.log('📋 Checking specific tables...');
  
  for (const table of tables) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table} - ${error.message}`);
      } else {
        console.log(`✅ ${table} - exists and accessible`);
      }
    } catch (err) {
      console.log(`❌ ${table} - ${err.message}`);
    }
  }
}

checkTables();
