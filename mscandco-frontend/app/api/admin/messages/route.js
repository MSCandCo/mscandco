import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/admin/messages
 * Get admin messages and notifications
 */
export async function GET(request) {
  try {
    // Lazy load Supabase clients
    const { createClient } = await import('@/lib/supabase/server');
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin', 'label_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const archived = searchParams.get('archived') === 'true'
    const isSuperadmin = searchParams.get('superadmin') === 'true'

    // Check if user is superadmin for full platform access
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const isSuperAdminUser = userProfile?.role === 'super_admin' || isSuperadmin

    // Get notifications from notifications table
    // If superadmin, get all notifications; otherwise, get only user's notifications
    let notificationsQuery = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('archived', archived)
      .order('created_at', { ascending: false })
      .limit(100)

    // If not superadmin, filter by user_id
    if (!isSuperAdminUser) {
      notificationsQuery = notificationsQuery.eq('user_id', session.user.id)
    }

    const { data: notifications, error: notificationsError } = await notificationsQuery

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError)
      // Return empty array if table doesn't exist
      return NextResponse.json({
        success: true,
        messages: []
      })
    }

    // Get user profiles for from/to names if superadmin
    let userProfilesMap = new Map()
    if (isSuperAdminUser && notifications && notifications.length > 0) {
      const userIds = new Set()
      notifications.forEach(notif => {
        if (notif.from_user_id) userIds.add(notif.from_user_id)
        if (notif.user_id) userIds.add(notif.user_id)
      })

      if (userIds.size > 0) {
        const { data: profiles } = await supabaseAdmin
          .from('user_profiles')
          .select('id, email, first_name, last_name, artist_name')
          .in('id', Array.from(userIds))

        if (profiles) {
          profiles.forEach(profile => {
            userProfilesMap.set(profile.id, profile)
          })
        }
      }
    }

    // Transform notifications to message format
    const messages = (notifications || []).map(notif => {
      const fromProfile = notif.from_user_id ? userProfilesMap.get(notif.from_user_id) : null
      const toProfile = notif.user_id ? userProfilesMap.get(notif.user_id) : null

      return {
        id: notif.id,
        from: notif.from_user_id || 'system@mscandco.com',
        fromName: notif.from_name || fromProfile?.artist_name || fromProfile?.email || 'MSC & Co System',
        from_user_id: notif.from_user_id,
        to: notif.user_id || '',
        toName: toProfile?.artist_name || toProfile?.email || 'Unknown',
        user_id: notif.user_id,
        subject: notif.title || notif.message?.substring(0, 50) || 'Notification',
        body: notif.message || '',
        type: notif.type || 'notification',
        read: notif.read || false,
        archived: notif.archived || false,
        created_at: notif.created_at,
        priority: notif.priority || 'medium'
      }
    })

    // Apply filter
    let filteredMessages = messages
    if (filter === 'unread') {
      filteredMessages = messages.filter(m => !m.read)
    } else if (filter !== 'all') {
      filteredMessages = messages.filter(m => m.type === filter)
    }

    return NextResponse.json({
      success: true,
      messages: filteredMessages
    })

  } catch (error) {
    console.error('Error in messages GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/messages
 * Create a new message/notification
 */
export async function POST(request) {
  try {
    // Lazy load Supabase clients
    const { createClient } = await import('@/lib/supabase/server');
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || !['super_admin', 'company_admin', 'label_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { recipient, subject, body: messageBody, type, priority } = body

    // Create notification
    const { data: notification, error: createError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: recipient,
        title: subject,
        message: messageBody,
        type: type || 'notification',
        priority: priority || 'medium',
        from_user_id: session.user.id,
        from_name: profile.first_name || profile.email,
        read: false,
        archived: false
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating notification:', createError)
      return NextResponse.json(
        { error: 'Failed to send message', message: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      notification
    })

  } catch (error) {
    console.error('Error in messages POST:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/messages/[messageId]
 * Update message (mark as read, archive, etc.)
 */
export async function PUT(request) {
  try {
    // Lazy load Supabase clients
    const { createClient } = await import('@/lib/supabase/server');
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { messageId, read, archived } = body

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      )
    }

    const updateData = {}
    if (read !== undefined) updateData.read = read
    if (archived !== undefined) updateData.archived = archived

    const { error: updateError } = await supabaseAdmin
      .from('notifications')
      .update(updateData)
      .eq('id', messageId)

    if (updateError) {
      console.error('Error updating notification:', updateError)
      return NextResponse.json(
        { error: 'Failed to update message', message: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Message updated successfully'
    })

  } catch (error) {
    console.error('Error in messages PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

