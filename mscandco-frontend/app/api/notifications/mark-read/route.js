/**
 * API: Mark Notification as Read (App Router)
 * POST /api/notifications/mark-read - Mark a notification as read
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
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

    const body = await request.json()
    const { notification_id } = body

    if (!notification_id) {
      return NextResponse.json({
        error: 'Notification ID required'
      }, { status: 400 })
    }

    console.log('📧 Marking notification as read:', notification_id)

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', notification_id)
      .eq('user_id', session.user.id) // Security: only mark own notifications

    if (error) {
      console.error('❌ Error marking as read:', error)
      return NextResponse.json({
        error: 'Failed to mark as read',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Notification marked as read')

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Mark-read API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
