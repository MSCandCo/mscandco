import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Update the URL
    const { data, error } = await supabase
      .from('navigation_menus')
      .update({ url: '/superadmin/permissionsroles' })
      .eq('title', 'Permissions & Roles')
      .select()

    if (error) {
      throw error
    }

    // Verify the change
    const { data: verifyData, error: verifyError } = await supabase
      .from('navigation_menus')
      .select('*')
      .eq('title', 'Permissions & Roles')

    if (verifyError) {
      throw verifyError
    }

    return res.status(200).json({
      success: true,
      message: 'Navigation URL updated successfully',
      updated: data,
      current: verifyData
    })

  } catch (error) {
    console.error('Error updating navigation URL:', error)
    return res.status(500).json({ error: error.message })
  }
}
