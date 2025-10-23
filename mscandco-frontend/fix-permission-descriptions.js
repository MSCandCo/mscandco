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

// Manual fixes for permissions that need better descriptions
const DESCRIPTION_FIXES = {
  'admin:permissionsroles:access': 'Access Permissions & Roles management page',
  'superadmin:permissionsroles:access': 'Access Permissions & Roles management',
  'users_access:permissions_roles:read': 'View Permissions & Roles page',
  'users_access:permissions_roles:create': 'Create permissions and roles',
  'users_access:permissions_roles:update': 'Update permissions and roles',
  'users_access:permissions_roles:delete': 'Delete permissions and roles',
  'users_access:master_roster:read': 'View Master Roster page',
  'messages:all:view': 'View all message types (Super Admin only)',
}

async function fixPermissionDescriptions() {
  console.log('🔧 Fixing permission descriptions...\n')

  let updateCount = 0

  for (const [permissionName, newDescription] of Object.entries(DESCRIPTION_FIXES)) {
    const { data: existing, error: fetchError } = await supabase
      .from('permissions')
      .select('id, name, description')
      .eq('name', permissionName)
      .single()

    if (fetchError) {
      console.log(`⚠️  Permission not found: ${permissionName}`)
      continue
    }

    console.log(`Updating: ${permissionName}`)
    console.log(`  OLD: "${existing.description}"`)
    console.log(`  NEW: "${newDescription}"`)

    const { error: updateError } = await supabase
      .from('permissions')
      .update({ description: newDescription })
      .eq('id', existing.id)

    if (updateError) {
      console.error(`  ❌ Error:`, updateError.message)
    } else {
      console.log(`  ✅ Updated`)
      updateCount++
    }
    console.log()
  }

  console.log(`\n✅ Successfully fixed ${updateCount}/${Object.keys(DESCRIPTION_FIXES).length} descriptions!`)
}

fixPermissionDescriptions()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
