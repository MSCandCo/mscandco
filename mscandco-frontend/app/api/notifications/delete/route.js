/**
 * API: Delete Notification (App Router)
 * DELETE /api/notifications/delete - Delete a notification
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
async function getSupabaseAdmin() {
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();
}
export async function DELETE(request) {
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

    console.log('🗑️ Deleting notification:', notification_id)

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', notification_id)
      .eq('user_id', session.user.id) // Security: only delete own notifications

    if (error) {
      console.error('❌ Error deleting notification:', error)
      return NextResponse.json({
        error: 'Failed to delete notification',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Notification deleted')

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Delete notification API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
