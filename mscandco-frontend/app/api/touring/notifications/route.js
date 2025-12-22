/**
 * Touring Platform - Real-time Notifications
 * Push notifications for tour updates
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * POST - Create notification
 */
export async function POST(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { userId, tourId, tourDateId, type, title, message, actionUrl, priority = 'normal' } = await request.json();
    
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'userId, type, title, and message required' },
        { status: 400 }
      );
    }
    
    // Create notification
    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type: `touring_${type}`,
        title,
        message,
        metadata: {
          tour_id: tourId || null,
          tour_date_id: tourDateId || null,
          action_url: actionUrl || null,
          priority
        },
        read: false
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Send real-time notification via Supabase Realtime
    await supabaseAdmin
      .channel(`user-${userId}`)
      .send({
        type: 'broadcast',
        event: 'touring_notification',
        payload: {
          notification: {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            created_at: notification.created_at,
            metadata: notification.metadata
          }
        }
      });
    
    return NextResponse.json({
      success: true,
      notification
    }, { status: 201 });
    
  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET - Get notifications for user
 */
export async function GET(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }
    
    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .like('type', 'touring_%')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (unreadOnly) {
      query = query.eq('read', false);
    }
    
    const { data: notifications, error } = await query;
    
    if (error) throw error;
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount
    });
    
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications', details: error.message },
      { status: 500 }
    );
  }
}

