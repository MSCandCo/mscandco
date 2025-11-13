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

async function checkSuperAdminPermissions() {
  console.log('🔍 Checking Super Admin permissions...\n')

  // Get super_admin role
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id, name')
    .eq('name', 'super_admin')
    .single()

  if (roleError || !role) {
    console.error('❌ Error finding super_admin role:', roleError)
    return
  }

  console.log(`Role: ${role.name} (${role.id})\n`)

  // Get role permissions with details
  const { data: rolePermissions, error: permError } = await supabase
    .from('role_permissions')
    .select(`
      permission_id,
      permissions (
        id,
        name,
        description,
        resource
      )
    `)
    .eq('role_id', role.id)

  if (permError) {
    console.error('❌ Error fetching permissions:', permError)
    return
  }

  console.log(`Total permissions: ${rolePermissions.length}\n`)
  console.log('Permissions list:\n')

  rolePermissions.forEach((rp, index) => {
    const perm = rp.permissions
    console.log(`${index + 1}. ${perm.name}`)
    if (perm.description) {
      console.log(`   ${perm.description}`)
    }
    console.log(`   Resource: ${perm.resource}`)
    console.log()
  })

  // Check if wildcard exists
  const hasWildcard = rolePermissions.some(rp => rp.permissions.name === '*:*:*')
  console.log('='.repeat(80))
  if (hasWildcard) {
    console.log('✅ Super Admin has wildcard permission (*:*:*)')
    console.log('   This grants access to ALL features, so UI shows all toggles as ON')
  } else {
    console.log('⚠️  Super Admin does NOT have wildcard permission')
    console.log('   Consider adding *:*:* for full access')
  }
  console.log('='.repeat(80))
}

checkSuperAdminPermissions()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
