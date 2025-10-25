import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { userHasPermission } from '@/lib/permissions'

/**
 * GET /api/admin/systems/sentry-stats
 * Get Sentry error tracking statistics
 */
export async function GET(request) {
  try {
    const serverSupabase = await createServerClient()
    const { data: { user }, error: userError } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await userHasPermission(user.id, 'systems:errors:access')
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get Sentry stats from environment
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    const sentryOrg = process.env.SENTRY_ORG
    const sentryProject = process.env.SENTRY_PROJECT
    const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN

    if (!sentryDsn || !sentryOrg || !sentryProject || !sentryAuthToken) {
      return NextResponse.json({
        configured: false,
        message: 'Sentry not configured. Please add environment variables.',
        setup_url: 'https://sentry.io'
      })
    }

    // Fetch stats from Sentry API
    try {
      const response = await fetch(
        `https://sentry.io/api/0/projects/${sentryOrg}/${sentryProject}/stats/`,
        {
          headers: {
            'Authorization': `Bearer ${sentryAuthToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Sentry API error: ${response.status}`)
      }

      const stats = await response.json()

      return NextResponse.json({
        configured: true,
        dsn: sentryDsn,
        org: sentryOrg,
        project: sentryProject,
        stats,
        dashboard_url: `https://sentry.io/organizations/${sentryOrg}/projects/${sentryProject}/`,
      })
    } catch (apiError) {
      console.error('❌ Sentry API error:', apiError)
      
      // Return basic config info even if API fails
      return NextResponse.json({
        configured: true,
        dsn: sentryDsn,
        org: sentryOrg,
        project: sentryProject,
        stats: null,
        error: 'Failed to fetch stats from Sentry API',
        dashboard_url: `https://sentry.io/organizations/${sentryOrg}/projects/${sentryProject}/`,
      })
    }
  } catch (error) {
    console.error('❌ Sentry stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

