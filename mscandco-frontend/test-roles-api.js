const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testRolesAPI() {
  console.log('🧪 Testing /api/admin/roles endpoint...\n')

  // First, sign in to get a valid token
  const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'superadmin@mscandco.com',
    password: 'your_password_here'  // You'll need to provide this
  })

  if (signInError) {
    console.error('❌ Sign in failed:', signInError.message)
    console.log('\nPlease test manually by:')
    console.log('1. Opening the app in browser')
    console.log('2. Logging in as superadmin')
    console.log('3. Going to User Management page')
    console.log('4. Checking the roles dropdown')
    return
  }

  const token = session.access_token

  // Test the API endpoint
  const response = await fetch('http://localhost:3013/api/admin/roles', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('❌ API call failed:', error)
    return
  }

  const data = await response.json()

  console.log(`✅ Successfully fetched ${data.roles.length} roles:\n`)
  data.roles.forEach(role => {
    console.log(`  • ${role.name}`)
    console.log(`    ID: ${role.id}`)
    console.log(`    System Role: ${role.is_system_role}`)
    console.log()
  })

  // Sign out
  await supabase.auth.signOut()
}

testRolesAPI()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
