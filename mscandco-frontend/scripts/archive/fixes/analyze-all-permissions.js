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

async function analyzePermissions() {
  console.log('🔍 Analyzing all permissions for duplicates and issues...\n')

  // Get all permissions
  const { data: permissions, error } = await supabase
    .from('permissions')
    .select('*')
    .order('resource', { ascending: true })

  if (error) {
    console.error('❌ Error fetching permissions:', error)
    return
  }

  console.log(`Total permissions: ${permissions.length}\n`)
  console.log('='.repeat(100))

  // 1. Check for duplicate names
  const nameMap = {}
  const duplicateNames = []

  permissions.forEach(perm => {
    if (nameMap[perm.name]) {
      nameMap[perm.name].push(perm)
      if (!duplicateNames.includes(perm.name)) {
        duplicateNames.push(perm.name)
      }
    } else {
      nameMap[perm.name] = [perm]
    }
  })

  if (duplicateNames.length > 0) {
    console.log('\n⚠️  DUPLICATE PERMISSION NAMES FOUND:\n')
    duplicateNames.forEach(name => {
      console.log(`Name: ${name}`)
      nameMap[name].forEach(perm => {
        console.log(`  - ID: ${perm.id} | Resource: ${perm.resource} | Description: ${perm.description}`)
      })
      console.log()
    })
  } else {
    console.log('\n✅ No duplicate permission names found\n')
  }

  // 2. Check for similar/redundant permissions
  console.log('='.repeat(100))
  console.log('\n📋 Permissions grouped by resource:\n')

  const grouped = {}
  permissions.forEach(perm => {
    if (!grouped[perm.resource]) {
      grouped[perm.resource] = []
    }
    grouped[perm.resource].push(perm)
  })

  Object.keys(grouped).sort().forEach(resource => {
    console.log(`\n${resource.toUpperCase()} (${grouped[resource].length} permissions):`)
    console.log('-'.repeat(100))

    grouped[resource].forEach(perm => {
      console.log(`  • ${perm.name}`)
      console.log(`    ${perm.description || '(no description)'}`)
    })
  })

  // 3. Find permissions that might be redundant
  console.log('\n' + '='.repeat(100))
  console.log('\n🔍 Checking for potentially redundant permissions:\n')

  const redundancyIssues = []

  // Check for permissions that serve the same purpose
  Object.keys(grouped).forEach(resource => {
    const perms = grouped[resource]

    // Look for access/read duplicates
    const accessPerms = perms.filter(p => p.name.includes(':access'))
    const readPerms = perms.filter(p => p.name.includes(':read'))

    if (accessPerms.length > 1) {
      redundancyIssues.push({
        type: 'Multiple :access permissions for same resource',
        resource: resource,
        permissions: accessPerms.map(p => p.name)
      })
    }

    // Check for same resource, different naming
    const names = perms.map(p => p.name)
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        // Check if they're very similar (same action, different prefix)
        const name1Parts = names[i].split(':')
        const name2Parts = names[j].split(':')

        if (name1Parts.length >= 3 && name2Parts.length >= 3) {
          // If last two parts are the same, might be redundant
          if (name1Parts.slice(-2).join(':') === name2Parts.slice(-2).join(':')) {
            redundancyIssues.push({
              type: 'Similar permission structure',
              permissions: [names[i], names[j]]
            })
          }
        }
      }
    }
  })

  if (redundancyIssues.length > 0) {
    console.log('⚠️  Potential redundancies found:\n')
    redundancyIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.type}`)
      if (issue.resource) console.log(`   Resource: ${issue.resource}`)
      console.log(`   Permissions:`)
      issue.permissions.forEach(p => console.log(`     - ${p}`))
      console.log()
    })
  } else {
    console.log('✅ No obvious redundancies detected\n')
  }

  // 4. Check for unused permissions
  console.log('='.repeat(100))
  console.log('\n📊 Checking which permissions are actually assigned to roles:\n')

  const { data: rolePermissions } = await supabase
    .from('role_permissions')
    .select('permission_id')

  const usedPermissionIds = new Set(rolePermissions.map(rp => rp.permission_id))
  const unusedPermissions = permissions.filter(p => !usedPermissionIds.has(p.id))

  console.log(`Used permissions: ${usedPermissionIds.size}`)
  console.log(`Unused permissions: ${unusedPermissions.length}\n`)

  if (unusedPermissions.length > 0) {
    console.log('⚠️  Unused permissions (not assigned to any role):\n')
    unusedPermissions.forEach(perm => {
      console.log(`  • ${perm.name}`)
      console.log(`    ${perm.description || '(no description)'}`)
    })
    console.log()
  }

  // 5. Summary
  console.log('='.repeat(100))
  console.log('\n📊 SUMMARY:\n')
  console.log(`Total permissions: ${permissions.length}`)
  console.log(`Duplicate names: ${duplicateNames.length}`)
  console.log(`Potential redundancies: ${redundancyIssues.length}`)
  console.log(`Unused permissions: ${unusedPermissions.length}`)
  console.log(`Used permissions: ${usedPermissionIds.size}`)
  console.log()
}

analyzePermissions()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
