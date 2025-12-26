import { NextResponse } from 'next/server'
import { getUserPermissions } from '@/lib/permissions'

/**
 * GET /api/user/permissions
 * Fetch user permissions for the authenticated user
 */

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request) {
  try {
    // Lazy load Supabase client to avoid build-time errors
    const { createClient } = await import('@/lib/supabase/server');
    
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ Authentication error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔑 Fetching permissions for user:', user.id, user.email)

    // Get user permissions using server-side service role
    const permissions = await getUserPermissions(user.id, true)

    // Extract permission names from the permission objects
    const permissionNames = permissions.map(p => p.permission_name || p.name).filter(Boolean)

    console.log('🔑 User permissions loaded:', {
      user_id: user.id,
      user_email: user.email,
      permission_count: permissionNames.length,
      permissions: permissionNames
    })

    return NextResponse.json({
      success: true,
      user_id: user.id,
      user_email: user.email,
      permissions: permissionNames
    })

  } catch (error) {
    console.error('❌ Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
