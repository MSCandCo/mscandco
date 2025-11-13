/**
 * Check user_profiles table schema
 * Run: node check-user-profiles-schema.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('🔍 Checking user_profiles table schema...\n');

  // Get a sample row to see what columns exist
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('❌ Error fetching user profile:', error);
    return;
  }

  if (data) {
    console.log('✅ user_profiles table columns:');
    Object.keys(data).forEach(col => {
      console.log(`   - ${col}: ${typeof data[col]} = ${JSON.stringify(data[col]).slice(0, 50)}`);
    });
    console.log('');
  }

  // Check if there's a relationship to roles
  const { data: withRole, error: roleError } = await supabase
    .from('user_profiles')
    .select('*, roles(*)')
    .limit(1)
    .single();

  if (roleError) {
    console.log('⚠️  No roles relationship:', roleError.message);
  } else if (withRole && withRole.roles) {
    console.log('✅ Roles relationship exists!');
    console.log(`   Role data: ${JSON.stringify(withRole.roles, null, 2)}`);
  }

  // Find superadmin specifically
  const { data: users } = await supabase.auth.admin.listUsers();
  const superadmin = users?.users.find(u => u.email === 'superadmin@mscandco.com');
  
  if (superadmin) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', superadmin.id)
      .single();

    console.log('\n📊 Superadmin profile data:');
    console.log(JSON.stringify(profile, null, 2));
  }
}

checkSchema().catch(console.error);


