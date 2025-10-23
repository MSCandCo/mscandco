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

async function checkNavigationUrls() {
  console.log('\n=== Checking Navigation URLs ===\n')

  try {
    // Get all navigation items with distribution or revenue in the URL
    const { data: navItems, error } = await supabase
      .from('navigation_items')
      .select('label, url, role_slug, order')
      .or('url.ilike.%distribution%,url.ilike.%revenue%')
      .order('role_slug')
      .order('order')

    if (error) {
      console.error('❌ Error fetching navigation items:', error.message)
      return
    }

    if (!navItems || navItems.length === 0) {
      console.log('No distribution or revenue navigation items found')
      return
    }

    console.log(`Found ${navItems.length} navigation items:\n`)

    navItems.forEach(item => {
      console.log(`Role: ${item.role_slug}`)
      console.log(`  Label: ${item.label}`)
      console.log(`  URL: ${item.url}`)
      console.log(`  Order: ${item.order}`)
      console.log('')
    })

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkNavigationUrls()
