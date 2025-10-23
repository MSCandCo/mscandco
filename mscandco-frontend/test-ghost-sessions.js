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

async function testGhostSessions() {
  console.log('\n=== Testing Ghost Sessions Table ===\n')

  try {
    // Test 1: Check if table exists
    console.log('1. Checking if ghost_sessions table exists...')
    const { data: tables, error: tablesError } = await supabase
      .from('ghost_sessions')
      .select('*')
      .limit(0)

    if (tablesError) {
      console.error('❌ Table check failed:', tablesError.message)
      return
    }
    console.log('✅ ghost_sessions table exists')

    // Test 2: Check RLS policies
    console.log('\n2. Checking RLS policies...')
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT policyname, cmd, qual, with_check
        FROM pg_policies
        WHERE tablename = 'ghost_sessions'
      `
    }).catch(async () => {
      // Fallback - try direct query
      const result = await supabase
        .from('ghost_sessions')
        .select('*')
        .limit(1)
      return { data: null, error: result.error }
    })

    if (policiesError) {
      console.log('⚠️  Could not fetch policies directly, but table is accessible')
    } else if (policies) {
      console.log('✅ RLS Policies found:', policies)
    }

    // Test 3: Try to query active sessions
    console.log('\n3. Querying active ghost sessions...')
    const { data: activeSessions, error: sessionsError } = await supabase
      .from('ghost_sessions')
      .select('*')
      .eq('is_active', true)

    if (sessionsError) {
      console.error('❌ Query failed:', sessionsError.message)
    } else {
      console.log(`✅ Found ${activeSessions?.length || 0} active ghost sessions`)
      if (activeSessions && activeSessions.length > 0) {
        console.log('Active sessions:', activeSessions)
      }
    }

    // Test 4: Check user_profiles table for search
    console.log('\n4. Testing user search functionality...')
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name, artist_name, role')
      .neq('role', 'super_admin')
      .limit(5)

    if (usersError) {
      console.error('❌ User search failed:', usersError.message)
    } else {
      console.log(`✅ Found ${users?.length || 0} users (excluding super_admin)`)
      console.log('Sample users:', users?.map(u => ({
        email: u.email,
        name: u.artist_name || `${u.first_name} ${u.last_name}`.trim(),
        role: u.role
      })))
    }

    console.log('\n=== All Tests Completed ===\n')
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testGhostSessions()
