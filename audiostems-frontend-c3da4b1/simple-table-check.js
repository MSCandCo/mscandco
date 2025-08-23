const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function simpleTableCheck() {
  console.log('🔍 Checking table structure with simple queries...\n');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Try to select from user_profiles with LIMIT 0 to see what columns exist
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(0);
    
    if (error) {
      console.log('❌ user_profiles error:', error.message);
    } else {
      console.log('✅ user_profiles table exists and is accessible');
    }
    
    // Check what the actual error is when trying to access
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('id, email, created_at')
      .limit(1);
    
    if (testError) {
      console.log('❌ Test query error:', testError.message);
    } else {
      console.log('✅ Basic query works');
      console.log('Sample data keys:', testData.length > 0 ? Object.keys(testData[0]) : 'No data');
    }
    
    // Check if we can find the ID column name by trying different possibilities
    const possibleIdColumns = ['id', 'user_id', 'profile_id', 'uuid', 'auth_user_id'];
    
    for (const idCol of possibleIdColumns) {
      try {
        const { data: testId, error: idError } = await supabase
          .from('user_profiles')
          .select(idCol)
          .limit(1);
        
        if (!idError) {
          console.log(`✅ Found ID column: ${idCol}`);
          break;
        }
      } catch (e) {
        // Column doesn't exist, continue
      }
    }
    
  } catch (err) {
    console.log('❌ Connection error:', err.message);
  }
}

simpleTableCheck();
