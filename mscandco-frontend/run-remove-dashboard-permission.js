/**
 * Remove dropdown:dashboard:read permission from the database
 * Dashboard is now accessible to all authenticated users without permission checks
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeDashboardPermission() {
  console.log('🗑️  Removing dropdown:dashboard:read permission from database...\n');

  try {
    // Step 1: Get the permission ID
    const { data: permission, error: getError } = await supabase
      .from('permissions')
      .select('id')
      .eq('name', 'dropdown:dashboard:read')
      .single();

    if (getError) {
      if (getError.code === 'PGRST116') {
        console.log('✅ Permission already removed or never existed\n');
        return;
      }
      throw getError;
    }

    console.log(`📋 Found permission ID: ${permission.id}`);

    // Step 2: Remove from role_permissions
    const { error: rolePermError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('permission_id', permission.id);

    if (rolePermError) {
      console.error('❌ Error removing from role_permissions:', rolePermError);
      throw rolePermError;
    }

    console.log('✅ Removed from role_permissions');

    // Step 3: Remove from user_permissions
    const { error: userPermError } = await supabase
      .from('user_permissions')
      .delete()
      .eq('permission_id', permission.id);

    if (userPermError) {
      console.error('❌ Error removing from user_permissions:', userPermError);
      throw userPermError;
    }

    console.log('✅ Removed from user_permissions');

    // Step 4: Delete the permission itself
    const { error: deleteError } = await supabase
      .from('permissions')
      .delete()
      .eq('id', permission.id);

    if (deleteError) {
      console.error('❌ Error deleting permission:', deleteError);
      throw deleteError;
    }

    console.log('✅ Deleted permission from permissions table');

    // Step 5: Verify removal
    const { data: verification, error: verifyError } = await supabase
      .from('permissions')
      .select('id, name')
      .eq('name', 'dropdown:dashboard:read');

    if (verifyError && verifyError.code !== 'PGRST116') {
      console.error('❌ Error verifying removal:', verifyError);
      throw verifyError;
    }

    if (!verification || verification.length === 0) {
      console.log('\n✅ VERIFICATION PASSED: Permission completely removed from database');
    } else {
      console.log('\n⚠️  WARNING: Permission still exists in database');
    }

    // Step 6: Check for any remaining dashboard permissions
    const { data: dashboardPerms, error: dashboardError } = await supabase
      .from('permissions')
      .select('id, name')
      .like('name', 'dropdown:dashboard%');

    if (dashboardError) {
      console.error('❌ Error checking dashboard permissions:', dashboardError);
      throw dashboardError;
    }

    console.log(`\n📊 Remaining dashboard permissions: ${dashboardPerms?.length || 0}`);
    if (dashboardPerms && dashboardPerms.length > 0) {
      dashboardPerms.forEach(p => {
        console.log(`   - ${p.name}`);
      });
    }

    console.log('\n🎉 Migration complete! Dashboard is now accessible to all authenticated users.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

removeDashboardPermission();
