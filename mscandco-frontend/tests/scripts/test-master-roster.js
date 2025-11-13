require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMasterRoster() {
  console.log('🔐 Signing in as superadmin...');

  // Sign in as superadmin
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'superadmin@mscandco.com',
    password: 'TestPass123!'
  });

  if (authError) {
    console.error('❌ Auth error:', authError);
    return;
  }

  console.log('✅ Signed in successfully');
  console.log('📋 Access token:', authData.session.access_token.substring(0, 50) + '...');

  // Call the master roster API
  console.log('\n📋 Fetching master roster...');
  const response = await fetch('http://localhost:3013/api/admin/master-roster', {
    headers: {
      'Authorization': `Bearer ${authData.session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  console.log('📊 Response status:', response.status);

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Error response:', error);
    return;
  }

  const data = await response.json();
  console.log('✅ Master roster loaded successfully!');
  console.log('📊 Total contributors:', data.summary?.total_contributors || 0);
  console.log('📊 Sample contributor:', data.contributors?.[0] || 'None');

  return data;
}

testMasterRoster()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('💥 Test failed:', err);
    process.exit(1);
  });
