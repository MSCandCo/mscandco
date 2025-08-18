const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema after restart...\n');
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase credentials in .env.local');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Check if user_profiles table exists and has the required columns
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error checking user_profiles table:', error.message);
      return;
    }
    
    console.log('✅ user_profiles table exists');
    
    // Try to check the table structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'user_profiles' })
      .single();
    
    if (tableError) {
      console.log('⚠️  Could not get detailed column info, but table exists');
      console.log('🚨 You still need to run the database schema update!');
      console.log('\n📋 Run this SQL in Supabase SQL Editor:');
      console.log(`
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS country_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
      `);
    } else {
      console.log('✅ Database schema check complete');
    }
    
  } catch (err) {
    console.log('❌ Database connection error:', err.message);
  }
}

checkDatabaseSchema();
