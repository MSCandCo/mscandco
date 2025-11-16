/**
 * Remove accessibility:use from user_permissions since it's already in role_permissions
 * Run with: node scripts/remove-duplicate-accessibility-permission.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeDuplicateAccessibilityPermission() {
  console.log('🔍 Removing accessibility:use from user_permissions table...');
  console.log('   (It will still be available via role_permissions)');
  console.log('');

  // Get the accessibility:use permission ID
  const { data: permission, error: permError } = await supabase
    .from('permissions')
    .select('id, name')
    .eq('name', 'accessibility:use')
    .single();

  if (permError || !permission) {
    console.error('❌ Permission not found:', permError);
    return;
  }

  console.log(`✅ Found permission: ${permission.name} (${permission.id})`);
  console.log('');

  // Delete all user_permissions records with this permission
  const { data: deletedRecords, error: deleteError } = await supabase
    .from('user_permissions')
    .delete()
    .eq('permission_id', permission.id)
    .select();

  if (deleteError) {
    console.error('❌ Error deleting records:', deleteError);
    return;
  }

  console.log(`✅ Deleted ${deletedRecords?.length || 0} user_permissions records`);
  console.log('');
  console.log('🎉 Done! The accessibility:use permission is now only in role_permissions.');
  console.log('   Users with the artist role will still have the permission via their role.');
}

removeDuplicateAccessibilityPermission().catch(console.error);
