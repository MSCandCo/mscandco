const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function fixGhostLoginPermission() {
  console.log('🔧 Fixing Ghost Login permission...\n')

  // Step 1: Get both permission IDs
  const { data: permissions, error: permError } = await supabase
    .from('permissions')
    .select('id, name')
    .in('name', ['admin:ghost_login:access', 'superadmin:ghost_login:access'])

  if (permError) {
    console.error('❌ Error fetching permissions:', permError)
    return
  }

  const adminGhostPerm = permissions.find(p => p.name === 'admin:ghost_login:access')
  const superadminGhostPerm = permissions.find(p => p.name === 'superadmin:ghost_login:access')

  console.log('Found permissions:')
  console.log(`  admin:ghost_login:access - ${adminGhostPerm?.id || 'NOT FOUND'}`)
  console.log(`  superadmin:ghost_login:access - ${superadminGhostPerm?.id || 'NOT FOUND'}`)
  console.log()

  // Step 2: Get super_admin role
  const { data: superAdminRole, error: roleError } = await supabase
    .from('roles')
    .select('id, name')
    .eq('name', 'super_admin')
    .single()

  if (roleError || !superAdminRole) {
    console.error('❌ Error finding super_admin role:', roleError)
    return
  }

  console.log(`Super Admin role ID: ${superAdminRole.id}\n`)

  // Step 3: Check current super_admin permissions for ghost login
  const { data: currentPerms, error: currentError } = await supabase
    .from('role_permissions')
    .select('permission_id, permissions(name)')
    .eq('role_id', superAdminRole.id)
    .in('permission_id', [adminGhostPerm?.id, superadminGhostPerm?.id].filter(Boolean))

  if (currentError) {
    console.error('❌ Error checking current permissions:', currentError)
    return
  }

  console.log('Current ghost login permissions for super_admin:')
  if (currentPerms.length === 0) {
    console.log('  None')
  } else {
    currentPerms.forEach(p => {
      console.log(`  - ${p.permissions.name}`)
    })
  }
  console.log()

  // Step 4: Remove admin:ghost_login:access from super_admin if it exists
  if (adminGhostPerm) {
    console.log('Removing admin:ghost_login:access from super_admin...')
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', superAdminRole.id)
      .eq('permission_id', adminGhostPerm.id)

    if (deleteError) {
      console.error('❌ Error removing admin:ghost_login:access:', deleteError)
    } else {
      console.log('✓ Removed admin:ghost_login:access from super_admin')
    }
  }

  // Step 5: Add superadmin:ghost_login:access to super_admin if not already there
  if (superadminGhostPerm) {
    const hasSupeadminPerm = currentPerms.some(p => p.permission_id === superadminGhostPerm.id)

    if (!hasSupeadminPerm) {
      console.log('Adding superadmin:ghost_login:access to super_admin...')
      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert({
          role_id: superAdminRole.id,
          permission_id: superadminGhostPerm.id
        })

      if (insertError) {
        console.error('❌ Error adding superadmin:ghost_login:access:', insertError)
      } else {
        console.log('✓ Added superadmin:ghost_login:access to super_admin')
      }
    } else {
      console.log('✓ super_admin already has superadmin:ghost_login:access')
    }
  }

  // Step 6: Delete admin:ghost_login:access permission entirely
  if (adminGhostPerm) {
    console.log('\nDeleting admin:ghost_login:access permission from database...')

    // First check if any other roles use it
    const { data: otherRoles, error: checkError } = await supabase
      .from('role_permissions')
      .select('role_id, roles(name)')
      .eq('permission_id', adminGhostPerm.id)

    if (checkError) {
      console.error('❌ Error checking other roles:', checkError)
    } else if (otherRoles && otherRoles.length > 0) {
      console.log('⚠️  Warning: Other roles still use admin:ghost_login:access:')
      otherRoles.forEach(rp => {
        console.log(`   - ${rp.roles.name}`)
      })
      console.log('Removing from all roles first...')

      const { error: deleteAllError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('permission_id', adminGhostPerm.id)

      if (deleteAllError) {
        console.error('❌ Error removing from roles:', deleteAllError)
        return
      }
      console.log('✓ Removed from all roles')
    }

    // Now delete the permission
    const { error: deletePermError } = await supabase
      .from('permissions')
      .delete()
      .eq('id', adminGhostPerm.id)

    if (deletePermError) {
      console.error('❌ Error deleting permission:', deletePermError)
    } else {
      console.log('✓ Deleted admin:ghost_login:access permission')
    }
  }

  // Step 7: Verify final state
  console.log('\n' + '='.repeat(80))
  console.log('Final verification:\n')

  const { data: finalPerms, error: finalError } = await supabase
    .from('role_permissions')
    .select('permissions(name, description)')
    .eq('role_id', superAdminRole.id)
    .like('permissions.name', '%ghost%')

  if (finalError) {
    console.error('❌ Error in final verification:', finalError)
  } else {
    console.log('Super Admin ghost login permissions:')
    if (finalPerms.length === 0) {
      console.log('  ⚠️  None found!')
    } else {
      finalPerms.forEach(p => {
        console.log(`  ✅ ${p.permissions.name}`)
        console.log(`     ${p.permissions.description}`)
      })
    }
  }

  console.log('\n✅ Ghost login permission fix complete!')
}

fixGhostLoginPermission()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
