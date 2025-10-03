import { createClient } from '@supabase/supabase-js'
import { requirePermission } from '@/lib/rbac/middleware'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // req.user and req.userRole are automatically attached by middleware
    const { artistId } = req.query

    if (!artistId) {
      return res.status(400).json({ error: 'Artist ID is required' })
    }

    console.log('📥 Loading analytics data for artist:', artistId)

    // Load existing data from user_profiles using service role (bypasses RLS)
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('analytics_data')
      .eq('id', artistId)
      .single()

    if (error) {
      console.error('❌ Error loading profile:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to load analytics data',
        details: error.message 
      })
    }

    console.log('✅ Analytics data loaded successfully for artist:', artistId)

    return res.json({
      success: true,
      data: profile?.analytics_data || null
    })

  } catch (error) {
    console.error('Load analytics data API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to load analytics data',
      details: error.message
    })
  }
}

// Protect with analytics:view:any permission (admin read access)
export default requirePermission('analytics:view:any')(handler)
