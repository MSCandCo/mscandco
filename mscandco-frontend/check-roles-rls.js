const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Test with ANON key (like client-side)
const anonSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Test with SERVICE ROLE key
const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function checkRolesRLS() {
  console.log('🔍 Testing roles table access...\n')

  // Test 1: Anon key (client-side)
  console.log('1. Testing with ANON key (client-side):')
  const { data: anonData, error: anonError } = await anonSupabase
    .from('roles')
    .select('id, name, description')
    .limit(5)

  if (anonError) {
    console.error('   ❌ Error:', anonError.message)
    console.error('   Code:', anonError.code)
  } else {
    console.log(`   ✅ Success! Fetched ${anonData.length} roles`)
  }
  console.log()

  // Test 2: Service role key
  console.log('2. Testing with SERVICE ROLE key:')
  const { data: serviceData, error: serviceError } = await serviceSupabase
    .from('roles')
    .select('id, name, description')
    .limit(5)

  if (serviceError) {
    console.error('   ❌ Error:', serviceError.message)
  } else {
    console.log(`   ✅ Success! Fetched ${serviceData.length} roles`)
  }
  console.log()

  console.log('='.repeat(80))
  console.log('CONCLUSION:')
  if (anonError) {
    console.log('❌ Client-side access to roles table is BLOCKED by RLS')
    console.log('   Need to either:')
    console.log('   1. Add RLS policy to allow SELECT on roles table')
    console.log('   2. Create an API endpoint to fetch roles (using service role)')
  } else {
    console.log('✅ Client-side access to roles table works fine')
  }
}

checkRolesRLS()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
