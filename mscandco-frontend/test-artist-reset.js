/**
 * Test artist role reset functionality
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testArtistReset() {
  console.log('🧪 Testing Artist Role Reset Functionality\n');

  // 1. Get artist role
  const { data: artistRole, error: roleError } = await supabase
    .from('roles')
    .select('id, name')
    .eq('name', 'artist')
    .single();

  if (roleError || !artistRole) {
    console.error('❌ Failed to get artist role:', roleError);
    return;
  }

  console.log('✅ Artist Role ID:', artistRole.id);

  // 2. Check role permissions BEFORE reset
  const { data: rolePermsBefore } = await supabase
    .from('role_permissions')
    .select(`
      permissions (
        name
      )
    `)
    .eq('role_id', artistRole.id);

  console.log(`\n📊 Role Permissions (BEFORE reset): ${rolePermsBefore?.length}`);
  rolePermsBefore?.forEach(rp => {
    console.log(`   - ${rp.permissions.name}`);
  });

  // 3. Get artist users
  const { data: artistUsers } = await supabase
    .from('user_profiles')
    .select('id, email')
    .eq('role', 'artist');

  console.log(`\n👥 Artist Users: ${artistUsers?.length}`);
  artistUsers?.forEach(u => {
    console.log(`   - ${u.email}`);
  });

  // 4. Add a dummy user permission override for testing
  if (artistUsers && artistUsers.length > 0) {
    const testUserId = artistUsers[0].id;

    // Get a random permission to add as override
    const { data: testPerm } = await supabase
      .from('permissions')
      .select('id, name')
      .eq('name', 'artist:dashboard:access')
      .single();

    if (testPerm) {
      console.log(`\n➕ Adding test permission override for ${artistUsers[0].email}...`);

      const { error: addError } = await supabase
        .from('user_permissions')
        .insert([{
          user_id: testUserId,
          permission_id: testPerm.id
        }]);

      if (!addError) {
        console.log(`   ✅ Added override: ${testPerm.name}`);
      } else if (addError.code === '23505') {
        console.log(`   ℹ️  Override already exists`);
      }
    }

    // 5. Check user permissions BEFORE reset
    const { data: userPermsBefore } = await supabase
      .from('user_permissions')
      .select(`
        permissions (
          name
        )
      `)
      .eq('user_id', testUserId);

    console.log(`\n📋 User Permission Overrides (BEFORE reset): ${userPermsBefore?.length}`);
    userPermsBefore?.forEach(up => {
      console.log(`   - ${up.permissions.name}`);
    });

    // 6. Simulate the RESET operation
    console.log(`\n🔄 Simulating RESET TO DEFAULT...`);

    // This is what the API does:
    const { error: clearError } = await supabase
      .from('user_permissions')
      .delete()
      .in('user_id', artistUsers.map(u => u.id));

    if (clearError) {
      console.error('   ❌ Failed to clear user permissions:', clearError);
    } else {
      console.log(`   ✅ Cleared user permission overrides`);
    }

    // 7. Check user permissions AFTER reset
    const { data: userPermsAfter } = await supabase
      .from('user_permissions')
      .select(`
        permissions (
          name
        )
      `)
      .eq('user_id', testUserId);

    console.log(`\n📋 User Permission Overrides (AFTER reset): ${userPermsAfter?.length || 0}`);
    if (userPermsAfter && userPermsAfter.length > 0) {
      userPermsAfter.forEach(up => {
        console.log(`   - ${up.permissions.name}`);
      });
    } else {
      console.log(`   ✅ All user overrides cleared - user will now inherit role defaults`);
    }
  }

  // 8. Check role permissions AFTER reset
  const { data: rolePermsAfter } = await supabase
    .from('role_permissions')
    .select(`
      permissions (
        name
      )
    `)
    .eq('role_id', artistRole.id);

  console.log(`\n📊 Role Permissions (AFTER reset): ${rolePermsAfter?.length}`);
  rolePermsAfter?.forEach(rp => {
    console.log(`   - ${rp.permissions.name}`);
  });

  // 9. Verify inherited permissions
  if (artistUsers && artistUsers.length > 0) {
    console.log(`\n✅ RESULT: User ${artistUsers[0].email} will now inherit ${rolePermsAfter?.length} permissions from artist role`);
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log('✅ Test Complete!');
  console.log(`${'='.repeat(70)}\n`);
}

testArtistReset().catch(console.error);
