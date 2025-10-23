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

async function getAllPermissions() {
  console.log('🔍 Fetching all permissions...\n')

  const { data: permissions, error } = await supabase
    .from('permissions')
    .select('*')
    .order('resource', { ascending: true })

  if (error) {
    console.error('❌ Error fetching permissions:', error)
    return
  }

  console.log(`Total permissions: ${permissions.length}\n`)

  // Group by resource
  const grouped = {}
  permissions.forEach(perm => {
    if (!grouped[perm.resource]) {
      grouped[perm.resource] = []
    }
    grouped[perm.resource].push(perm)
  })

  console.log('📋 Permissions grouped by resource:\n')
  Object.keys(grouped).sort().forEach(resource => {
    console.log(`\n${resource}:`)
    grouped[resource].forEach(perm => {
      console.log(`  - ${perm.name} (${perm.id})`)
      if (perm.description) {
        console.log(`    ${perm.description}`)
      }
    })
  })

  // Also show what permissions make sense for Artist role
  console.log('\n' + '='.repeat(80))
  console.log('\n🎨 Suggested Artist Role Permissions:\n')

  const artistPermissions = permissions.filter(p =>
    p.name.includes('artist:') ||
    p.name.includes(':own') ||
    p.name.includes('release:') ||
    p.name.includes('analytics:read') ||
    p.name.includes('earnings:read:own') ||
    p.name.includes('profile:')
  )

  artistPermissions.forEach(perm => {
    console.log(`  ✓ ${perm.name}`)
  })
}

getAllPermissions()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
