require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSuperadminPermissions() {
  // Get superadmin user
  const { data: superAdmin } = await supabase
    .from('user_profiles')
    .select('id, email, role')
    .eq('role', 'super_admin')
    .single();

  console.log('Superadmin:', superAdmin.email);

  // Get their permissions
  const { data: perms } = await supabase
    .from('user_permissions')
    .select('permissions(name)')
    .eq('user_id', superAdmin.id);

  console.log('User permissions:', perms?.length || 0);
  perms?.forEach(p => console.log('  -', p.permissions.name));

  // Get role permissions
  const { data: role } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'super_admin')
    .single();

  const { data: rolePerms } = await supabase
    .from('role_permissions')
    .select('permissions(name)')
    .eq('role_id', role.id);

  console.log('\nRole permissions:', rolePerms?.length || 0);
  rolePerms?.forEach(p => console.log('  -', p.permissions.name));

  // Check for specific permission
  const { data: permCheck } = await supabase
    .from('permissions')
    .select('id, name')
    .eq('name', 'superadmin:permissionsroles:access')
    .single();

  console.log('\nsuperadmin:permissionsroles:access exists:', !!permCheck);

  if (!permCheck) {
    console.log('\n❌ Permission does not exist! Need to create it.');
  }
}

checkSuperadminPermissions().catch(console.error);
