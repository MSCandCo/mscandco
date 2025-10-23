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

const ROLE_PERMISSIONS = {
  artist: [
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
  ],

  content_moderator: [
    'dashboard:access',
    'profile:read',
    'profile:update',
    'content:asset_library:read',
    'users_access:master_roster:read',
    'analytics:requests:read',
    'analytics:requests:update',
    'messages:access',
    'messages:all:view',
    'platform_messages:read',
    'settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
  ],

  company_admin: [
    'dashboard:access',
    'profile:read',
    'profile:update',
    'users_access:user_management:read',
    'users_access:user_management:create',
    'users_access:user_management:update',
    'users_access:master_roster:read',
    'users_access:master_roster:create',
    'users_access:master_roster:update',
    'users_access:master_roster:delete',
    'content:asset_library:read',
    'content:asset_library:delete',
    'finance:earnings_management:read',
    'finance:wallet_management:read',
    'finance:split_configuration:read',
    'finance:split_configuration:create',
    'finance:split_configuration:update',
    'analytics:access',
    'analytics:platform_analytics:read',
    'analytics:analytics_management:read',
    'analytics:requests:read',
    'analytics:requests:update',
    'releases:access',
    'messages:access',
    'messages:all:view',
    'platform_messages:read',
    'platform_messages:create',
    'platform_messages:update',
    'settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
    'settings:billing:view',
    'settings:billing:edit',
  ],
}

async function resetRole(roleName, permissionNames) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`Resetting: ${roleName}`)
  console.log('='.repeat(80))

  // Get role ID
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single()

  if (roleError || !role) {
    console.error(`❌ Error finding ${roleName} role:`, roleError)
    return false
  }

  console.log(`Role ID: ${role.id}`)
  console.log(`Default permissions to set: ${permissionNames.length}`)

  // Look up permission IDs
  const { data: permissions, error: permError } = await supabase
    .from('permissions')
    .select('id, name')
    .in('name', permissionNames)

  if (permError) {
    console.error(`❌ Error looking up permissions:`, permError)
    return false
  }

  console.log(`✓ Found ${permissions.length} matching permissions`)

  if (permissions.length !== permissionNames.length) {
    const foundNames = permissions.map(p => p.name)
    const missing = permissionNames.filter(name => !foundNames.includes(name))
    console.warn(`⚠️  Warning: ${missing.length} permissions not found:`)
    missing.forEach(name => console.warn(`   - ${name}`))
  }

  // Delete existing permissions
  console.log('Deleting existing permissions...')
  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', role.id)

  if (deleteError) {
    console.error(`❌ Error deleting permissions:`, deleteError)
    return false
  }
  console.log('✓ Existing permissions deleted')

  // Insert new permissions
  if (permissions.length > 0) {
    console.log('Inserting new permissions...')
    const permissionsToInsert = permissions.map(perm => ({
      role_id: role.id,
      permission_id: perm.id
    }))

    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(permissionsToInsert)

    if (insertError) {
      console.error(`❌ Error inserting permissions:`, insertError)
      return false
    }
    console.log(`✅ Successfully set ${permissions.length} permissions`)
  }

  return true
}

async function main() {
  console.log('🔄 Resetting Artist, Company Admin, and Content Moderator roles...\n')

  const roles = ['artist', 'company_admin', 'content_moderator']
  const results = {}

  for (const roleName of roles) {
    const success = await resetRole(roleName, ROLE_PERMISSIONS[roleName])
    results[roleName] = success
  }

  console.log('\n' + '='.repeat(80))
  console.log('📊 Summary:')
  console.log('='.repeat(80))

  for (const [roleName, success] of Object.entries(results)) {
    const status = success ? '✅' : '❌'
    console.log(`${status} ${roleName}`)
  }

  // Verify final state
  console.log('\n' + '='.repeat(80))
  console.log('📋 Final Permission Counts:')
  console.log('='.repeat(80))

  for (const roleName of roles) {
    const { data: role } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single()

    if (role) {
      const { data: perms } = await supabase
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', role.id)

      console.log(`${roleName.padEnd(25)} ${perms?.length || 0} permissions`)
    }
  }

  console.log()
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
