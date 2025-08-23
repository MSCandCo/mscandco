const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkTableStructure() {
  console.log('🔍 Checking actual table structure...\n');
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase credentials');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Get table structure from information_schema
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'user_profiles')
      .eq('table_schema', 'public');
    
    if (error) {
      console.log('❌ Error checking table structure:', error);
      return;
    }
    
    console.log('📋 user_profiles table columns:');
    console.log('=====================================');
    columns.forEach(col => {
      console.log(`${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Also check artists table
    const { data: artistColumns, error: artistError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'artists')
      .eq('table_schema', 'public');
    
    if (!artistError && artistColumns) {
      console.log('\n📋 artists table columns:');
      console.log('=====================================');
      artistColumns.forEach(col => {
        console.log(`${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

checkTableStructure();
