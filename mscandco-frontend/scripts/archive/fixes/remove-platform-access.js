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

async function removePlatformAccess() {
  console.log('🗑️  Removing platform:access permission...\n')

  // Get the permission
  const { data: perm, error: fetchError } = await supabase
    .from('permissions')
    .select('id, name, description')
    .eq('name', 'platform:access')
    .single()

  if (fetchError || !perm) {
    console.error('❌ Permission not found:', fetchError)
    return
  }

  console.log('Found permission:')
  console.log('  Name:', perm.name)
  console.log('  Description:', perm.description)
  console.log('  ID:', perm.id)
  console.log()

  // Check which roles use it
  const { data: rolePerms, error: roleError } = await supabase
    .from('role_permissions')
    .select('roles(name)')
    .eq('permission_id', perm.id)

  if (roleError) {
    console.error('❌ Error checking roles:', roleError)
    return
  }

  console.log('Currently assigned to roles:')
  if (rolePerms.length === 0) {
    console.log('  (none)')
  } else {
    rolePerms.forEach(rp => {
      console.log('  -', rp.roles.name)
    })
  }
  console.log()

  // Remove from all roles first
  if (rolePerms.length > 0) {
    console.log('Removing from all roles...')
    const { error: deleteRoleError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('permission_id', perm.id)

    if (deleteRoleError) {
      console.error('❌ Error removing from roles:', deleteRoleError)
      return
    }
    console.log('✓ Removed from all roles')
  }

  // Delete the permission
  console.log('Deleting permission from database...')
  const { error: deleteError } = await supabase
    .from('permissions')
    .delete()
    .eq('id', perm.id)

  if (deleteError) {
    console.error('❌ Error deleting permission:', deleteError)
    return
  }

  console.log('✅ Successfully deleted platform:access permission')
  console.log()

  // Verify
  const { data: verify, error: verifyError } = await supabase
    .from('permissions')
    .select('id')
    .eq('name', 'platform:access')

  if (verifyError) {
    console.error('⚠️  Could not verify:', verifyError)
  } else {
    console.log('Verification: platform:access permission', verify && verify.length > 0 ? '❌ still exists' : '✅ removed')
  }

  // Show final permission count
  const { data: allPerms, error: countError } = await supabase
    .from('permissions')
    .select('id')

  if (!countError) {
    console.log(`\nTotal permissions remaining: ${allPerms.length}`)
  }
}

removePlatformAccess()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
