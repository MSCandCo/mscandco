require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkArtistMessagesPermission() {
  console.log('🔍 Checking artist:messages:access permission for artist role\n');

  // Get artist role
  const { data: artistRole, error: roleError } = await supabase
    .from('roles')
    .select('id, name')
    .eq('name', 'artist')
    .single();

  if (roleError || !artistRole) {
    console.error('❌ Error fetching artist role:', roleError);
    return;
  }

  console.log('✅ Artist role found:', artistRole);

  // Get the permission
  const { data: permission, error: permError } = await supabase
    .from('permissions')
    .select('id, name')
    .eq('name', 'artist:messages:access')
    .single();

  if (permError || !permission) {
    console.error('❌ Error fetching permission:', permError);
    return;
  }

  console.log('✅ Permission found:', permission);

  // Check if artist role has this permission
  const { data: rolePermission, error: rpError } = await supabase
    .from('role_permissions')
    .select('*')
    .eq('role_id', artistRole.id)
    .eq('permission_id', permission.id)
    .single();

  if (rpError) {
    console.log('\n❌ Artist role does NOT have artist:messages:access permission');
    console.log('Error:', rpError.message);
    
    // Add the permission
    console.log('\n🔧 Adding artist:messages:access permission to artist role...');
    
    const { data: newRP, error: insertError } = await supabase
      .from('role_permissions')
      .insert({
        role_id: artistRole.id,
        permission_id: permission.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error adding permission:', insertError);
    } else {
      console.log('✅ Permission added successfully!', newRP);
    }
  } else {
    console.log('\n✅ Artist role ALREADY has artist:messages:access permission');
    console.log('Role Permission:', rolePermission);
  }

  // List all permissions for artist role
  console.log('\n📋 All permissions for artist role:');
  const { data: allPerms, error: allPermsError } = await supabase
    .from('role_permissions')
    .select(`
      permissions (
        name
      )
    `)
    .eq('role_id', artistRole.id);

  if (allPermsError) {
    console.error('Error fetching all permissions:', allPermsError);
  } else {
    allPerms.forEach(rp => {
      console.log('  -', rp.permissions.name);
    });
  }
}

checkArtistMessagesPermission();

