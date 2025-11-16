/**
 * API: Unread Notification Count (App Router)
 * GET /api/notifications/unread-count - Get count of unread notifications for authenticated user
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  try {
    // Check authentication
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
      }, { status: 401 })
    }

    console.log('📬 Fetching unread notification count for user:', session.user.id)

    // Use service role to bypass RLS
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('read', false)

    if (error) {
      console.error('❌ Error fetching unread count:', error)
      return NextResponse.json({
        error: 'Failed to fetch unread count',
        details: error.message
      }, { status: 500 })
    }

    console.log(`✅ Found ${count || 0} unread notifications`)

    return NextResponse.json({
      success: true,
      count: count || 0
    })

  } catch (error) {
    console.error('❌ Unread count API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

