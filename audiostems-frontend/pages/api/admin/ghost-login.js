import { createClient } from '@supabase/supabase-js'
import { requirePermission } from '@/lib/rbac/middleware'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // req.user and req.userRole are automatically attached by middleware
    const { targetUserId } = req.body

    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID is required' })
    }

    // Get target user information
    const { data: targetAuthUser, error: authError } = await supabase.auth.admin.getUserById(targetUserId)
    if (authError || !targetAuthUser.user) {
      return res.status(404).json({ error: 'Target user not found' })
    }

    // Get target user profile
    const { data: targetProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', targetUserId)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
    }

    // Create ghost session data
    const ghostSession = {
      isGhostMode: true,
      adminUserId: req.user.id,
      adminEmail: req.user.email,
      targetUserId: targetUserId,
      targetEmail: targetAuthUser.user.email,
      targetRole: targetAuthUser.user.user_metadata?.role || 'artist',
      targetProfile: targetProfile,
      ghostStartTime: new Date().toISOString(),
      sessionId: `ghost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Log ghost login attempt for audit trail
    console.log(`Ghost Login: Admin ${req.user.email} (${req.userRole}) accessing user ${targetAuthUser.user.email} at ${new Date().toISOString()}`)

    // Return ghost session data (to be stored in sessionStorage on frontend)
    res.status(200).json({
      success: true,
      ghostSession,
      targetUser: {
        id: targetAuthUser.user.id,
        email: targetAuthUser.user.email,
        name: `${targetProfile?.first_name || ''} ${targetProfile?.last_name || ''}`.trim(),
        role: targetAuthUser.user.user_metadata?.role || 'artist',
        profile: targetProfile
      },
      message: `Ghost mode activated for ${targetAuthUser.user.email}`
    })

  } catch (error) {
    console.error('Ghost login error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Ghost login failed'
    })
  }
}

// Protect with user:impersonate permission (super_admin only)
export default requirePermission('user:impersonate')(handler)
