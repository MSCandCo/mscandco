import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get auth token
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' })
    }

    // Decode JWT to get user info
    let userInfo
    try {
      userInfo = jwt.decode(token)
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const userEmail = userInfo?.email?.toLowerCase() || ''
    const userRole = userInfo?.user_metadata?.role

    // Check if user is admin
    const isAdmin = (
      userRole === 'company_admin' || 
      userRole === 'super_admin' ||
      userEmail === 'companyadmin@mscandco.com' ||
      userEmail === 'superadmin@mscandco.com'
    )

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' })
    }

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
