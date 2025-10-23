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

async function updateGhostLoginUrl() {
  console.log('\n=== Updating Ghost Login URL ===\n')

  try {
    // Update the navigation menu URL
    const { data, error } = await supabase
      .from('navigation_menus')
      .update({ url: '/superadmin/ghostlogin' })
      .eq('url', '/superadmin/ghost-login')
      .select()

    if (error) {
      console.error('❌ Error updating navigation menu:', error.message)
      return
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No navigation items found with URL /superadmin/ghost-login')
      console.log('Checking current navigation menus...\n')

      const { data: menus, error: checkError } = await supabase
        .from('navigation_menus')
        .select('*')
        .ilike('url', '%ghost%')

      if (checkError) {
        console.error('Error checking menus:', checkError.message)
        return
      }

      console.log('Found ghost-related menus:', menus)
      return
    }

    console.log('✅ Successfully updated navigation menu URL')
    console.log('Updated items:', data)
    console.log('\nOld URL: /superadmin/ghost-login')
    console.log('New URL: /superadmin/ghostlogin')
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

updateGhostLoginUrl()
