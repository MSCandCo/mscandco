import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { userHasPermission } from '@/lib/permissions'

/**
 * GET /api/admin/systems/inngest-stats
 * Get Inngest background jobs statistics
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

    const inngestEventKey = process.env.INNGEST_EVENT_KEY
    const inngestSigningKey = process.env.INNGEST_SIGNING_KEY

    if (!inngestEventKey || !inngestSigningKey) {
      return NextResponse.json({
        configured: false,
        message: 'Inngest not configured. Please add environment variables.',
        setup_url: 'https://inngest.com'
      })
    }

    return NextResponse.json({
      configured: true,
      event_key: inngestEventKey.substring(0, 10) + '...',
      dashboard_url: 'https://app.inngest.com',
      functions: [
        'AI Processing',
        'Email Sender',
        'Analytics Aggregator',
        'Subscription Renewal'
      ],
      features: [
        'Automatic Retries (3 attempts)',
        'Step-based Execution',
        'Visual Workflow Builder',
        'Error Tracking Integration',
        'Serverless-native'
      ]
    })
  } catch (error) {
    console.error('❌ Inngest stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

