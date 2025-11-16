/**
 * Debug script to check user permissions issue
 * Run with: node scripts/debug-user-permissions.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugUserPermissions() {
  const userId = '0a060de5-1c94-4060-a1c2-860224fc348d';

  console.log('🔍 Debugging user permissions for:', userId);
  console.log('');

  // 1. Check user profile role
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, email, role')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('❌ Error fetching profile:', profileError);
    return;
  }

  console.log('👤 User Profile:');
  console.log('   Email:', profile.email);
  console.log('   Role:', profile.role);
  console.log('');

  // 2. Get role ID
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('id, name')
    .eq('name', profile.role)
    .single();

  if (roleError) {
    console.error('❌ Error fetching role:', roleError);
    return;
  }

  console.log('🎭 Role Data:');
  console.log('   ID:', roleData.id);
  console.log('   Name:', roleData.name);
  console.log('');

  // 3. Get role permissions
  const { data: rolePermissions, error: rolePermError } = await supabase
    .from('role_permissions')
    .select(`
      permissions (
        name,
        description
      )
    `)
    .eq('role_id', roleData.id);

  console.log('📋 Role Permissions (count:', rolePermissions?.length || 0, '):');
  const accessibilityInRole = rolePermissions?.some(rp => rp.permissions?.name === 'accessibility:use');
  console.log('   Includes accessibility:use?', accessibilityInRole);
  if (accessibilityInRole) {
    const perm = rolePermissions.find(rp => rp.permissions?.name === 'accessibility:use');
    console.log('   Full permission object:', JSON.stringify(perm, null, 2));
  }
  console.log('');

  // 4. Get user-specific permissions
  const { data: userPermissions, error: userPermError } = await supabase
    .from('user_permissions')
    .select(`
      denied,
      permissions (
        name,
        description
      )
    `)
    .eq('user_id', userId);

  console.log('👤 User-Specific Permissions (count:', userPermissions?.length || 0, '):');
  const accessibilityInUser = userPermissions?.some(up => up.permissions?.name === 'accessibility:use');
  console.log('   Includes accessibility:use?', accessibilityInUser);
  if (accessibilityInUser) {
    const perm = userPermissions.find(up => up.permissions?.name === 'accessibility:use');
    console.log('   Full permission object:', JSON.stringify(perm, null, 2));
  }
  console.log('');

  // 5. List all permissions in both arrays
  console.log('📄 All Role Permissions:');
  rolePermissions?.forEach((rp, idx) => {
    console.log(`   ${idx + 1}. ${rp.permissions?.name}`);
  });
  console.log('');

  console.log('📄 All User-Specific Permissions:');
  userPermissions?.forEach((up, idx) => {
    console.log(`   ${idx + 1}. ${up.permissions?.name} (denied: ${up.denied})`);
  });
}

debugUserPermissions().catch(console.error);
