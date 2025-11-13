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

// Default role permissions configuration
const DEFAULT_ROLE_PERMISSIONS = {
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

  labeladmin: [
    'dashboard:access',
    'profile:read',
    'profile:update',
    'labeladmin:artists:access',
    'labeladmin:my_artists:access',
    'releases:access',
    'analytics:access',
    'analytics:basic:view',
    'analytics:advanced:view',
    'earnings:access',
    'roster:access',
    'messages:access',
    'messages:releases:view',
    'messages:earnings:view',
    'messages:payouts:view',
    'messages:invitation_responses:view',
    'messages:invitations:view',
    'labeladmin:messages:access',
    'settings:access',
    'labeladmin:settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
    'settings:billing:view',
    'settings:billing:edit',
  ],

  distribution_partner: [
    'dashboard:access',
    'profile:read',
    'profile:update',
    'distribution:distribution_hub:access',
    'distribution:distribution_hub:read',
    'distribution:distribution_hub:create',
    'distribution:distribution_hub:update',
    'distribution:distribution_hub:delete',
    'distribution:revenue_reporting:access',
    'distribution:revenue_reporting:read',
    'distribution:releases:access',
    'analytics:access',
    'analytics:platform_analytics:read',
    'messages:access',
    'messages:releases:view',
    'messages:system:view',
    'settings:access',
    'distribution:settings:access',
    'settings:read',
    'settings:preferences:edit',
    'settings:notifications:edit',
    'settings:security:edit',
    'settings:api_keys:view',
    'settings:api_keys:manage',
  ],

  financial_admin: [
    'dashboard:access',
    'finance:earnings_management:read',
    'finance:wallet_management:read',
    'finance:split_configuration:read',
  ],

  analytics_admin: [
    'dashboard:access',
    'analytics:analytics_management:read',
    'analytics:analytics_management:create',
    'analytics:analytics_management:update',
    'analytics:analytics_management:delete',
    'analytics:platform_analytics:read',
    'analytics:requests:read',
    'analytics:requests:update',
  ],

  support_admin: [
    'dashboard:access',
    'analytics:requests:read',
    'analytics:requests:update',
    'messages:access',
  ],

  marketing_admin: [
    'dashboard:access',
    'platform_messages:read',
    'platform_messages:create',
  ],

  requests_admin: [
    'dashboard:access',
    'analytics:requests:read',
  ],

  roster_admin: [
    'dashboard:access',
    'users_access:master_roster:read',
  ],
}

async function resetAllRoles() {
  console.log('🔄 Resetting all roles to default permissions...\n')

  // Get all roles
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name')

  if (rolesError) {
    console.error('❌ Error fetching roles:', rolesError)
    return
  }

  console.log(`Found ${roles.length} roles\n`)

  // Process each role
  for (const role of roles) {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`Processing role: ${role.name} (${role.id})`)
    console.log('='.repeat(80))

    // Skip super_admin - it should never be reset
    if (role.name === 'super_admin') {
      console.log('⚠️  Skipping super_admin - protected role')
      continue
    }

    // Get default permissions for this role
    const defaultPermissionNames = DEFAULT_ROLE_PERMISSIONS[role.name]

    if (!defaultPermissionNames || defaultPermissionNames.length === 0) {
      console.log(`⚠️  No default permissions defined for ${role.name} - skipping`)
      continue
    }

    console.log(`📋 Default permissions defined: ${defaultPermissionNames.length}`)

    // Look up permission IDs
    console.log('Looking up permission IDs...')
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('id, name')
      .in('name', defaultPermissionNames)

    if (permError) {
      console.error(`❌ Error looking up permissions:`, permError)
      continue
    }

    console.log(`✓ Found ${permissions.length} matching permissions`)

    if (permissions.length !== defaultPermissionNames.length) {
      const foundNames = permissions.map(p => p.name)
      const missing = defaultPermissionNames.filter(name => !foundNames.includes(name))
      console.warn(`⚠️  Warning: ${missing.length} permissions not found in database:`)
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
      continue
    }
    console.log('✓ Existing permissions deleted')

    // Insert default permissions
    if (permissions.length > 0) {
      console.log('Inserting default permissions...')
      const permissionsToInsert = permissions.map(perm => ({
        role_id: role.id,
        permission_id: perm.id
      }))

      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(permissionsToInsert)

      if (insertError) {
        console.error(`❌ Error inserting permissions:`, insertError)
        continue
      }
      console.log(`✅ Successfully reset ${role.name} with ${permissions.length} permissions`)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('✅ All roles reset complete!')
  console.log('='.repeat(80) + '\n')

  // Show final summary
  console.log('📊 Final Summary:\n')
  for (const role of roles) {
    const { data: perms } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', role.id)

    console.log(`  ${role.name.padEnd(25)} ${perms?.length || 0} permissions`)
  }
}

resetAllRoles()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
