import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { userHasPermission } from '@/lib/permissions'

/**
 * GET /api/admin/systems/realtime-stats
 * Get Supabase Realtime statistics
 */
export async function GET(request) {
  try {
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await userHasPermission(user.id, 'systems:performance:access')
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!supabaseUrl) {
      return NextResponse.json({
        configured: false,
        message: 'Supabase not configured.',
      })
    }

    return NextResponse.json({
      configured: true,
      status: 'active',
      url: supabaseUrl,
      dashboard_url: `${supabaseUrl.replace('.supabase.co', '')}/project/default`,
      features: [
        'Real-time Notifications',
        'Real-time Releases',
        'Real-time Earnings',
        'Real-time Messages',
        'Presence Tracking',
        'Browser Notifications',
        'Automatic Reconnection'
      ],
      channels: [
        'notifications',
        'releases',
        'earnings',
        'messages',
        'presence'
      ]
    })
  } catch (error) {
    console.error('❌ Realtime stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

