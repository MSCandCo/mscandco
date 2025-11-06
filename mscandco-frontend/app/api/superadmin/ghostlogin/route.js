import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * GET /api/superadmin/ghostlogin
 * Get active ghost login sessions
 */
export async function GET(request) {
  try {
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Check if user is superadmin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Superadmin access required' },
        { status: 403 }
      )
    }

    // Get active ghost sessions from ghost_sessions table
    const { data: sessions, error } = await supabaseAdmin
      .from('ghost_sessions')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching ghost sessions:', error)
      // Return empty array if table doesn't exist
      return NextResponse.json({
        success: true,
        sessions: []
      })
    }

    return NextResponse.json({
      success: true,
      sessions: sessions || []
    })

  } catch (error) {
    console.error('Error in ghostlogin GET:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/superadmin/ghostlogin
 * Create a new ghost login session
 */
export async function POST(request) {
  try {
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Check if user is superadmin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Superadmin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { target_user_id, notes } = body

    if (!target_user_id) {
      return NextResponse.json(
        { error: 'target_user_id is required' },
        { status: 400 }
      )
    }

    // Generate a magic link for the target user
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: '', // Will be set from target user
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3013'}/dashboard`
      }
    })

    // Get target user email
    const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(target_user_id)

    if (!targetUser?.user) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      )
    }

    // Create ghost session record
    const { data: ghostSession, error: createError } = await supabaseAdmin
      .from('ghost_sessions')
      .insert({
        superadmin_id: session.user.id,
        target_user_id: target_user_id,
        notes: notes || '',
        active: true,
        magic_link: magicLinkData?.properties?.action_link || '',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating ghost session:', createError)
      // If table doesn't exist, return a mock session
      return NextResponse.json({
        success: true,
        ghost_session: {
          id: `ghost_${Date.now()}`,
          superadmin_id: session.user.id,
          target_user_id: target_user_id,
          notes: notes || '',
          active: true,
          magic_link: magicLinkData?.properties?.action_link || '',
          created_at: new Date().toISOString()
        }
      })
    }

    // Log the ghost login action
    try {
      await supabaseAdmin.rpc('log_security_event', {
        p_user_id: session.user.id,
        p_event_type: 'ghost_login_created',
        p_event_category: 'security',
        p_severity: 'high',
        p_success: true,
        p_details: JSON.stringify({
          target_user_id: target_user_id,
          target_user_email: targetUser.user.email,
          notes: notes
        })
      })
    } catch (logError) {
      // Silently fail if logging function doesn't exist
      console.log('Security event logging not available')
    }

    return NextResponse.json({
      success: true,
      ghost_session: ghostSession
    })

  } catch (error) {
    console.error('Error in ghostlogin POST:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/superadmin/ghostlogin
 * End a ghost login session
 */
export async function DELETE(request) {
  try {
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Check if user is superadmin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Superadmin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { session_id } = body

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      )
    }

    // Update ghost session to inactive
    const { error: updateError } = await supabaseAdmin
      .from('ghost_sessions')
      .update({
        active: false,
        ended_at: new Date().toISOString()
      })
      .eq('id', session_id)

    if (updateError) {
      console.error('Error ending ghost session:', updateError)
      return NextResponse.json(
        { error: 'Failed to end session', message: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Ghost session ended successfully'
    })

  } catch (error) {
    console.error('Error in ghostlogin DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

