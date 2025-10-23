/**
 * Debug script to check superadmin permissions
 * Run: node debug-superadmin-permissions.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSuperadminPermissions() {
  console.log('🔍 Checking superadmin@mscandco.com permissions...\n');

  // 1. Find the user
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('❌ Error fetching users:', userError);
    return;
  }

  const superadmin = users.users.find(u => u.email === 'superadmin@mscandco.com');
  
  if (!superadmin) {
    console.error('❌ superadmin@mscandco.com not found in auth.users');
    return;
  }

  console.log('✅ Found user:');
  console.log(`   ID: ${superadmin.id}`);
  console.log(`   Email: ${superadmin.email}\n`);

  // 2. Check user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*, roles(name)')
    .eq('id', superadmin.id)
    .single();

  if (profileError) {
    console.error('❌ Error fetching user profile:', profileError);
    return;
  }

  if (!profile) {
    console.error('❌ No profile found for superadmin');
    return;
  }

  console.log('✅ User Profile:');
  console.log(`   Role: ${profile.roles?.name || 'NO ROLE ASSIGNED!'}`);
  console.log(`   Role ID: ${profile.role_id || 'NULL'}\n`);

  if (!profile.role_id) {
    console.error('⚠️  WARNING: User has NO role assigned! This is the problem.');
    console.error('   Fix: Assign the super_admin role to this user\n');
    return;
  }

  // 3. Check role permissions
  const { data: rolePermissions, error: rolePermError } = await supabase
    .from('role_permissions')
    .select(`
      permissions (
        name,
        description
      )
    `)
    .eq('role_id', profile.role_id);

  if (rolePermError) {
    console.error('❌ Error fetching role permissions:', rolePermError);
    return;
  }

  console.log(`✅ Role Permissions (${rolePermissions?.length || 0} total):`);
  
  if (rolePermissions && rolePermissions.length > 0) {
    const hasWildcard = rolePermissions.some(rp => rp.permissions?.name === '*:*:*');
    if (hasWildcard) {
      console.log('   ⭐ HAS WILDCARD (*:*:*) - Should have access to everything!\n');
    } else {
      console.log('   First 5 permissions:');
      rolePermissions.slice(0, 5).forEach(rp => {
        console.log(`   - ${rp.permissions?.name}`);
      });
      console.log(`   ... and ${rolePermissions.length - 5} more\n`);
    }
  } else {
    console.error('   ⚠️  WARNING: Role has NO permissions assigned!\n');
  }

  // 4. Check user-specific permissions
  const { data: userPermissions, error: userPermError } = await supabase
    .from('user_permissions')
    .select(`
      denied,
      permissions (
        name,
        description
      )
    `)
    .eq('user_id', superadmin.id);

  if (userPermError) {
    console.error('❌ Error fetching user permissions:', userPermError);
    return;
  }

  if (userPermissions && userPermissions.length > 0) {
    console.log('✅ User-Specific Permissions:');
    userPermissions.forEach(up => {
      const status = up.denied ? '❌ DENIED' : '✅ GRANTED';
      console.log(`   ${status}: ${up.permissions?.name}`);
    });
    console.log('');
  } else {
    console.log('ℹ️  No user-specific permissions (relying on role permissions)\n');
  }

  // 5. Test specific admin permissions
  const testPermissions = [
    'finance:wallet_management:read',
    'finance:earnings_management:read',
    'analytics:platform_analytics:read',
    'users_access:user_management:read',
    'admin:ghost_login:access',
    'admin:permissionsroles:access'
  ];

  console.log('🧪 Testing specific admin permissions:\n');

  for (const perm of testPermissions) {
    // Check if in role permissions
    const hasFromRole = rolePermissions?.some(rp => 
      rp.permissions?.name === perm || rp.permissions?.name === '*:*:*'
    );

    // Check if denied by user permissions
    const deniedByUser = userPermissions?.some(up => 
      up.denied && up.permissions?.name === perm
    );

    const status = hasFromRole && !deniedByUser ? '✅ GRANTED' : '❌ DENIED';
    console.log(`   ${status}: ${perm}`);
    
    if (!hasFromRole) {
      console.log(`      ⚠️  Not in role permissions`);
    }
    if (deniedByUser) {
      console.log(`      ⚠️  Explicitly denied for this user`);
    }
  }

  console.log('\n📝 Summary:');
  console.log('═══════════════════════════════════════════════════════════');
  
  const issues = [];
  if (!profile.role_id) issues.push('No role assigned');
  if (!rolePermissions || rolePermissions.length === 0) issues.push('Role has no permissions');
  
  const deniedPermissions = userPermissions?.filter(up => up.denied) || [];
  if (deniedPermissions.length > 0) {
    issues.push(`${deniedPermissions.length} permissions explicitly denied`);
  }

  if (issues.length > 0) {
    console.log('\n❌ PROBLEMS FOUND:');
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    console.log('\n💡 FIX:');
    if (!profile.role_id) {
      console.log('   1. Go to Supabase dashboard');
      console.log('   2. Find super_admin role ID');
      console.log('   3. Update user_profiles table:');
      console.log(`      UPDATE user_profiles SET role_id = <super_admin_role_id> WHERE id = '${superadmin.id}'`);
    }
    if (deniedPermissions.length > 0) {
      console.log('   Remove denied permissions from user_permissions table');
    }
  } else {
    console.log('\n✅ NO ISSUES FOUND - Permissions look correct!');
    console.log('   The problem might be elsewhere (check server logs)');
  }
}

checkSuperadminPermissions().catch(console.error);


