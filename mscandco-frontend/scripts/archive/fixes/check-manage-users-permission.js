require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkManageUsersPermission() {
  console.log('\n=== Checking manage_users Permission ===\n')

  try {
    // 1. Check if manage_users permission exists
    const { data: permission, error: permError } = await supabase
      .from('permissions')
      .select('*')
      .eq('name', 'manage_users')
      .single()

    if (permError || !permission) {
      console.log('❌ manage_users permission does NOT exist')
      console.log('\n📝 Creating manage_users permission...')

      const { data: newPerm, error: createError } = await supabase
        .from('permissions')
        .insert({
          name: 'manage_users',
          description: 'Can manage users and their roles',
          resource: 'users',
          action: 'manage',
          scope: 'all'
        })
        .select()
        .single()

      if (createError) {
        console.error('❌ Failed to create permission:', createError)
        return
      }

      console.log('✅ Created manage_users permission:', newPerm.id)
    } else {
      console.log('✅ manage_users permission exists:', permission.id)
    }

    // 2. Check which roles have this permission
    const { data: rolePermissions, error: rpError } = await supabase
      .from('role_permissions')
      .select('*, roles(name), permissions(name)')
      .eq('permissions.name', 'manage_users')

    console.log('\n📋 Roles with manage_users permission:')
    if (rolePermissions && rolePermissions.length > 0) {
      rolePermissions.forEach(rp => {
        console.log(`  - ${rp.roles.name}`)
      })
    } else {
      console.log('  (none)')
    }

    // 3. Get permission ID for assignment
    const { data: perm } = await supabase
      .from('permissions')
      .select('id')
      .eq('name', 'manage_users')
      .single()

    if (!perm) {
      console.error('❌ Could not find manage_users permission')
      return
    }

    // 4. Get roles that should have this permission
    const rolesToAssign = ['admin', 'super_admin', 'labeladmin']

    console.log('\n📝 Ensuring roles have manage_users permission...')

    for (const roleName of rolesToAssign) {
      // Get role ID
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id, name')
        .eq('name', roleName)
        .single()

      if (roleError || !role) {
        console.log(`  ⚠️ Role ${roleName} not found`)
        continue
      }

      // Check if already assigned
      const { data: existing } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_id', role.id)
        .eq('permission_id', perm.id)
        .single()

      if (existing) {
        console.log(`  ✅ ${roleName} already has manage_users`)
      } else {
        // Assign permission
        const { error: assignError } = await supabase
          .from('role_permissions')
          .insert({
            role_id: role.id,
            permission_id: perm.id
          })

        if (assignError) {
          console.log(`  ❌ Failed to assign to ${roleName}:`, assignError.message)
        } else {
          console.log(`  ✅ Assigned manage_users to ${roleName}`)
        }
      }
    }

    // 5. Final verification
    console.log('\n=== Final Verification ===')
    const { data: finalCheck } = await supabase
      .from('role_permissions')
      .select('*, roles(name), permissions(name)')
      .eq('permissions.name', 'manage_users')

    console.log('\nRoles with manage_users permission:')
    if (finalCheck && finalCheck.length > 0) {
      finalCheck.forEach(rp => {
        console.log(`  ✅ ${rp.roles.name}`)
      })
    }

    // 6. Test with a user
    console.log('\n=== Testing Permission Check ===')

    // Get an admin user
    const { data: adminProfile } = await supabase
      .from('user_profiles')
      .select('id, email, role')
      .eq('role', 'admin')
      .limit(1)
      .single()

    if (adminProfile) {
      console.log(`\nTesting with user: ${adminProfile.email} (${adminProfile.role})`)

      const { data: hasPermission, error: checkError } = await supabase
        .rpc('check_user_permission', {
          user_id: adminProfile.id,
          permission_name: 'manage_users'
        })

      if (checkError) {
        console.log('❌ Permission check failed:', checkError.message)
      } else {
        console.log(`Result: ${hasPermission ? '✅ HAS PERMISSION' : '❌ NO PERMISSION'}`)
      }
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

checkManageUsersPermission().then(() => {
  console.log('\n✅ Check complete\n')
  process.exit(0)
})
