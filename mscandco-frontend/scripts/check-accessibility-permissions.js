/**
 * Script to check accessibility:use permissions
 * Run with: node scripts/check-accessibility-permissions.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAccessibilityPermissions() {
  console.log('🔍 Checking accessibility:use permissions...\n');

  // Get the accessibility:use permission
  const { data: permission, error: permError } = await supabase
    .from('permissions')
    .select('*')
    .eq('name', 'accessibility:use')
    .single();

  if (permError || !permission) {
    console.error('❌ Permission not found:', permError);
    return;
  }

  console.log('✅ Permission record:');
  console.log(JSON.stringify(permission, null, 2));
  console.log('');

  // Get all user_permissions for this permission
  const { data: userPerms, error: userPermsError } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('permission_id', permission.id);

  if (userPermsError) {
    console.error('❌ Error fetching user permissions:', userPermsError);
    return;
  }

  console.log(`📋 Found ${userPerms.length} user_permissions records:\n`);
  userPerms.forEach((up, idx) => {
    console.log(`${idx + 1}. user_id: ${up.user_id}, denied: ${up.denied}`);
  });
}

checkAccessibilityPermissions().catch(console.error);
