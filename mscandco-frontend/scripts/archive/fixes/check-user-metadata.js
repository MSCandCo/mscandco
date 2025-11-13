/**
 * Check what's in the user's auth metadata vs profile
 * Run: node check-user-metadata.js
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

async function checkUserMetadata() {
  console.log('🔍 Checking superadmin user metadata vs profile...\n');

  // Get user from auth
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

  console.log('✅ AUTH USER DATA:');
  console.log('   ID:', superadmin.id);
  console.log('   Email:', superadmin.email);
  console.log('   user_metadata:', JSON.stringify(superadmin.user_metadata, null, 2));
  console.log('   app_metadata:', JSON.stringify(superadmin.app_metadata, null, 2));
  console.log('');

  // Get profile from database
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', superadmin.id)
    .single();

  if (profileError) {
    console.error('❌ Error fetching profile:', profileError);
    return;
  }

  console.log('✅ USER_PROFILES DATA:');
  console.log('   role (column):', profile.role);
  console.log('');

  // Simulate what getUserPermissions does
  console.log('🧪 SIMULATING getUserPermissions() logic:\n');

  // Step 1: Get role from user_metadata (THIS IS WHAT THE CODE DOES)
  const roleNameFromMetadata = superadmin.user_metadata?.role || 'artist';
  console.log(`1. Role from user_metadata: "${roleNameFromMetadata}"`);

  // Step 2: Look up role in roles table
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('id, name')
    .eq('name', roleNameFromMetadata)
    .single();

  if (roleError) {
    console.error('   ❌ Error looking up role:', roleError.message);
    console.log('\n⚠️  THIS IS THE PROBLEM:');
    console.log(`   getUserPermissions() is looking for role "${roleNameFromMetadata}" in roles table`);
    console.log(`   But user_metadata.role is: ${JSON.stringify(superadmin.user_metadata?.role) || 'undefined'}`);
    console.log('');
    console.log('💡 FIX: Update user metadata to have role="super_admin"');
    return;
  }

  console.log(`2. Found role in roles table: ID=${roleData.id}, name="${roleData.name}"`);

  // Step 3: Get role permissions
  const { data: rolePermissions, error: permError } = await supabase
    .from('role_permissions')
    .select('permissions(name)')
    .eq('role_id', roleData.id);

  if (permError) {
    console.error('   ❌ Error fetching permissions:', permError.message);
    return;
  }

  console.log(`3. Role has ${rolePermissions?.length || 0} permissions`);
  
  const hasWildcard = rolePermissions?.some(rp => rp.permissions?.name === '*:*:*');
  if (hasWildcard) {
    console.log('   ⭐ Includes wildcard (*:*:*)\n');
  } else {
    console.log('   First 5:', rolePermissions?.slice(0, 5).map(rp => rp.permissions.name).join(', '));
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════');
  
  if (!superadmin.user_metadata?.role) {
    console.log('\n❌ PROBLEM FOUND:');
    console.log('   user_metadata.role is undefined/missing');
    console.log('   getUserPermissions() defaults to "artist" role');
    console.log('');
    console.log('💡 FIX:');
    console.log('   Update user metadata to include role="super_admin"');
    console.log('   SQL: See output from fix script...');
  } else if (superadmin.user_metadata.role !== profile.role) {
    console.log('\n⚠️  MISMATCH:');
    console.log(`   user_metadata.role: "${superadmin.user_metadata.role}"`);
    console.log(`   user_profiles.role: "${profile.role}"`);
    console.log('');
    console.log('💡 Sync these values');
  } else {
    console.log('\n✅ Everything looks correct!');
    console.log('   The problem must be elsewhere');
  }
}

checkUserMetadata().catch(console.error);


