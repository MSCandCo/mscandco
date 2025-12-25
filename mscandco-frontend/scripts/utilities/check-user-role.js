/**
 * Script to check user role and permissions
 * Run with: node scripts/check-user-role.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserRole() {
  const userEmail = 'info@htay.co.uk';

  console.log(`🔍 Checking role and permissions for: ${userEmail}\n`);

  // Get user
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  const user = userData.users.find(u => u.email === userEmail);

  if (!user) {
    console.error(`❌ User not found: ${userEmail}`);
    return;
  }

  console.log(`✅ User ID: ${user.id}\n`);

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('❌ Error fetching profile:', profileError);
    return;
  }

  console.log(`📋 User Role: ${profile.role}\n`);

  // Get role ID
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('id, name')
    .eq('name', profile.role)
    .single();

  if (roleError || !roleData) {
    console.error('❌ Error fetching role:', roleError);
    return;
  }

  console.log(`🔑 Role ID: ${roleData.id} (${roleData.name})\n`);

  // Get role permissions
  const { data: rolePermissions, error: rolePermError } = await supabase
    .from('role_permissions')
    .select(`
      permissions (
        name,
        description
      )
    `)
    .eq('role_id', roleData.id);

  console.log(`📊 Role Permissions (${rolePermissions?.length || 0} total):`);
  rolePermissions?.forEach(rp => {
    console.log(`  - ${rp.permissions.name}`);
  });

  // Check if accessibility:use is in role permissions
  const hasAccessibilityInRole = rolePermissions?.some(rp => rp.permissions.name === 'accessibility:use');
  console.log(`\n❓ accessibility:use in role permissions: ${hasAccessibilityInRole ? 'YES ✅' : 'NO ❌'}\n`);

  // Get user-specific permissions
  const { data: userPermissions, error: userPermError } = await supabase
    .from('user_permissions')
    .select(`
      denied,
      permissions (
        name,
        description
      )
    `)
    .eq('user_id', user.id);

  console.log(`📊 User-Specific Permissions (${userPermissions?.length || 0} total):`);
  userPermissions?.forEach(up => {
    console.log(`  - ${up.permissions.name} (denied: ${up.denied})`);
  });

  // Check if accessibility:use is in user permissions
  const accessibilityUserPerm = userPermissions?.find(up => up.permissions.name === 'accessibility:use');
  console.log(`\n❓ accessibility:use in user permissions: ${accessibilityUserPerm ? `YES ✅ (denied: ${accessibilityUserPerm.denied})` : 'NO ❌'}`);
}

checkUserRole().catch(console.error);
