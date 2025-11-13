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

async function checkRolesTable() {
  console.log('🔍 Checking roles table access...\n')

  // Try to fetch roles with all columns
  const { data: roles, error } = await supabase
    .from('roles')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('❌ Error fetching roles:', error)
    return
  }

  console.log(`✅ Successfully fetched ${roles.length} roles:\n`)

  // Show first role structure
  if (roles.length > 0) {
    console.log('Role structure (first role):')
    console.log(JSON.stringify(roles[0], null, 2))
    console.log()
  }

  roles.forEach(role => {
    console.log(`  • ${role.name} (ID: ${role.id})`)
  })
}

checkRolesTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
