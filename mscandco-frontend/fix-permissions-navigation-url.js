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

async function fixNavigationUrl() {
  console.log('🔧 Fixing Permissions & Roles navigation URL...\n')

  // Check current state
  const { data: current, error: currentError } = await supabase
    .from('navigation_menus')
    .select('*')
    .eq('title', 'Permissions & Roles')

  if (currentError) {
    console.error('❌ Error checking current state:', currentError)
    process.exit(1)
  }

  console.log('📋 Current state:')
  console.log(current)
  console.log()

  // Update the URL
  const { data, error } = await supabase
    .from('navigation_menus')
    .update({ url: '/superadmin/permissionsroles' })
    .eq('title', 'Permissions & Roles')
    .select()

  if (error) {
    console.error('❌ Error updating navigation URL:', error)
    process.exit(1)
  }

  console.log('✅ Successfully updated navigation URL')
  console.log('📊 Updated records:', data)
  console.log()

  // Verify the change
  const { data: verifyData, error: verifyError } = await supabase
    .from('navigation_menus')
    .select('*')
    .eq('title', 'Permissions & Roles')

  if (verifyError) {
    console.error('❌ Error verifying update:', verifyError)
  } else {
    console.log('✓ Verification - Current state:')
    console.log(verifyData)
  }
}

fixNavigationUrl()
