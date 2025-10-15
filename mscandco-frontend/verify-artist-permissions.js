/**
 * Verify what permissions an artist user actually has
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyArtistPermissions() {
  console.log('\n🔍 Verifying Artist Permissions\n');
  console.log('='.repeat(70));

  // Get artist user
  const { data: artistUser } = await supabase
    .from('user_profiles')
    .select('id, email, role')
    .eq('email', 'info@htay.co.uk')
    .single();

  if (!artistUser) {
    console.log('❌ Artist user not found');
    return;
  }

  console.log(`\n👤 User: ${artistUser.email}`);
  console.log(`📝 Role: ${artistUser.role}`);

  // Get artist role
  const { data: artistRole } = await supabase
    .from('roles')
    .select('id, name')
    .eq('name', 'artist')
    .single();

  console.log(`\n🎭 Role Details:`);
  console.log(`   Name: ${artistRole.name}`);
  console.log(`   ID: ${artistRole.id}`);

  // Get role permissions (what the role provides by default)
  const { data: rolePerms } = await supabase
    .from('role_permissions')
    .select(`
      permissions (
        name,
        description
      )
    `)
    .eq('role_id', artistRole.id);

  console.log(`\n📋 ROLE DEFAULT PERMISSIONS (from role_permissions table): ${rolePerms?.length}`);
  rolePerms?.forEach((rp, index) => {
    console.log(`   ${index + 1}. ${rp.permissions.name}`);
  });

  // Get user-specific permission overrides
  const { data: userPerms } = await supabase
    .from('user_permissions')
    .select(`
      permissions (
        name,
        description
      )
    `)
    .eq('user_id', artistUser.id);

  console.log(`\n🔧 USER-SPECIFIC OVERRIDES (from user_permissions table): ${userPerms?.length || 0}`);
  if (userPerms && userPerms.length > 0) {
    userPerms.forEach((up, index) => {
      console.log(`   ${index + 1}. ${up.permissions.name}`);
    });
  } else {
    console.log(`   (none - user inherits role defaults)`);
  }

  // Calculate total effective permissions
  const rolePermNames = rolePerms?.map(rp => rp.permissions.name) || [];
  const userPermNames = userPerms?.map(up => up.permissions.name) || [];
  const allPerms = [...new Set([...rolePermNames, ...userPermNames])];

  console.log(`\n✅ TOTAL EFFECTIVE PERMISSIONS: ${allPerms.length}`);
  allPerms.sort().forEach((perm, index) => {
    const source = rolePermNames.includes(perm) && userPermNames.includes(perm)
      ? '(role + user override)'
      : rolePermNames.includes(perm)
        ? '(from role)'
        : '(user override only)';
    console.log(`   ${index + 1}. ${perm} ${source}`);
  });

  console.log(`\n${'='.repeat(70)}`);
  console.log('\n💡 EXPLANATION:');
  console.log('   - Role permissions are the DEFAULT permissions for all users with this role');
  console.log('   - User overrides are ADDITIONAL or CUSTOM permissions for specific users');
  console.log('   - "Reset to Default" removes user overrides, keeping only role permissions');
  console.log('   - After reset, user will have EXACTLY the role default permissions\n');
}

verifyArtistPermissions().catch(console.error);
