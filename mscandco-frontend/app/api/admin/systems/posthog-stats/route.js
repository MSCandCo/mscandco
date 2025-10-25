import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { userHasPermission } from '@/lib/permissions'

/**
 * GET /api/admin/systems/posthog-stats
 * Get PostHog analytics statistics
 */
export async function GET(request) {
  try {
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await userHasPermission(user.id, 'systems:analytics:access')
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

    if (!posthogKey) {
      return NextResponse.json({
        configured: false,
        message: 'PostHog not configured. Please add environment variables.',
        setup_url: 'https://posthog.com'
      })
    }

    return NextResponse.json({
      configured: true,
      api_key: posthogKey.substring(0, 10) + '...',
      host: posthogHost,
      dashboard_url: `${posthogHost}/project/`,
      features: [
        'Product Analytics',
        'Session Recording',
        'Feature Flags',
        'A/B Testing',
        'Heatmaps',
        'User Surveys'
      ]
    })
  } catch (error) {
    console.error('❌ PostHog stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

