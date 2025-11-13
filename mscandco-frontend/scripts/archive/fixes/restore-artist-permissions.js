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

async function restoreArtistPermissions() {
  console.log('🎨 Restoring Artist Role Permissions...\n')

  // Get artist role ID
  const { data: artistRole, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'artist')
    .single()

  if (roleError || !artistRole) {
    console.error('❌ Error finding artist role:', roleError)
    return
  }

  console.log(`Artist role ID: ${artistRole.id}\n`)

  // Define typical artist permissions based on what we saw in the permissions list
  const artistPermissionNames = [
    'dashboard:access',
    'profile:read',
    'profile:update',
    'releases:access',
    'analytics:access',
    'analytics:basic:view',
    'earnings:access',
    'roster:access',
    'messages:access',
    'messages:releases:view',
    'messages:earnings:view',
    'messages:payouts:view',
    'messages:invitations:view',
    'artist:messages:access',
    'settings:access',
    'artist:settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
  ]

  console.log(`Looking up ${artistPermissionNames.length} permissions...\n`)

  // Get permission IDs for these permission names
  const { data: permissions, error: permError } = await supabase
    .from('permissions')
    .select('id, name')
    .in('name', artistPermissionNames)

  if (permError) {
    console.error('❌ Error fetching permissions:', permError)
    return
  }

  console.log(`✓ Found ${permissions.length} permissions\n`)

  // First, delete all existing artist permissions
  console.log('Removing existing artist permissions...')
  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', artistRole.id)

  if (deleteError) {
    console.error('❌ Error deleting existing permissions:', deleteError)
    return
  }
  console.log('✓ Existing permissions removed\n')

  // Insert new permissions
  console.log('Inserting new permissions...')
  const permissionsToInsert = permissions.map(perm => ({
    role_id: artistRole.id,
    permission_id: perm.id
  }))

  const { data: inserted, error: insertError } = await supabase
    .from('role_permissions')
    .insert(permissionsToInsert)
    .select()

  if (insertError) {
    console.error('❌ Error inserting permissions:', insertError)
    return
  }

  console.log(`✅ Successfully restored ${permissions.length} permissions for Artist role!\n`)
  console.log('Permissions added:')
  permissions.forEach(perm => {
    console.log(`  ✓ ${perm.name}`)
  })
}

restoreArtistPermissions()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
