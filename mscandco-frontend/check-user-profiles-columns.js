const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  try {
    // Get table schema
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('Available columns in user_profiles:');
      console.log(Object.keys(data[0]));
    } else {
      console.log('No data in user_profiles table');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkColumns();
