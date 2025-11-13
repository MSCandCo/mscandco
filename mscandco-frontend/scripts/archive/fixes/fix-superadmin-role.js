/**
 * Fix superadmin role assignment
 * Run: node fix-superadmin-role.js
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

async function fixSuperadminRole() {
  console.log('🔧 Fixing superadmin role assignment...\n');

  // 1. Find the superadmin user
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('❌ Error fetching users:', userError);
    return;
  }

  const superadmin = users.users.find(u => u.email === 'superadmin@mscandco.com');
  
  if (!superadmin) {
    console.error('❌ superadmin@mscandco.com not found');
    return;
  }

  console.log(`✅ Found user: ${superadmin.email} (ID: ${superadmin.id})\n`);

  // 2. Find the super_admin role
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('*')
    .eq('name', 'super_admin')
    .single();

  if (rolesError) {
    console.error('❌ Error fetching super_admin role:', rolesError);
    return;
  }

  if (!roles) {
    console.error('❌ super_admin role not found in roles table');
    return;
  }

  console.log(`✅ Found super_admin role (ID: ${roles.id})\n`);

  // 3. Update user_profiles to set the correct role_id
  const { data: updateResult, error: updateError } = await supabase
    .from('user_profiles')
    .update({ role_id: roles.id })
    .eq('id', superadmin.id)
    .select();

  if (updateError) {
    console.error('❌ Error updating user profile:', updateError);
    return;
  }

  console.log('✅ Updated user_profiles:\n');
  console.log('   Before: role_id = NULL');
  console.log(`   After:  role_id = ${roles.id} (super_admin)\n`);

  // 4. Verify the fix
  const { data: profile, error: verifyError } = await supabase
    .from('user_profiles')
    .select('*, roles(name)')
    .eq('id', superadmin.id)
    .single();

  if (verifyError) {
    console.error('❌ Error verifying fix:', verifyError);
    return;
  }

  console.log('✅ VERIFICATION:');
  console.log(`   User: ${superadmin.email}`);
  console.log(`   Role: ${profile.roles?.name}`);
  console.log(`   Role ID: ${profile.role_id}\n`);

  // 5. Check permissions count
  const { data: rolePermissions, error: permError } = await supabase
    .from('role_permissions')
    .select('permissions(name)')
    .eq('role_id', roles.id);

  if (permError) {
    console.error('❌ Error fetching permissions:', permError);
    return;
  }

  const hasWildcard = rolePermissions?.some(rp => rp.permissions?.name === '*:*:*');

  console.log(`✅ Role has ${rolePermissions?.length || 0} permissions`);
  if (hasWildcard) {
    console.log('   ⭐ Includes wildcard (*:*:*) - FULL ACCESS\n');
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ FIX COMPLETE!\n');
  console.log('Next steps:');
  console.log('1. Clear your browser cookies (or use incognito mode)');
  console.log('2. Log in again as superadmin@mscandco.com');
  console.log('3. Try accessing admin pages - should work now!');
  console.log('');
  console.log('If still having issues, run: node debug-superadmin-permissions.js');
}

fixSuperadminRole().catch(console.error);


