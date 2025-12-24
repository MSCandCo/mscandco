import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

    // Get target user first (we need their email for the magic link)
    const { data: targetUser, error: targetUserError } = await supabaseAdmin.auth.admin.getUserById(target_user_id)

    if (targetUserError || !targetUser?.user) {
      console.error('Error fetching target user:', targetUserError)
      return NextResponse.json(
        { error: 'Target user not found', details: targetUserError?.message },
        { status: 404 }
      )
    }

    const targetEmail = targetUser.user.email
    if (!targetEmail) {
      return NextResponse.json(
        { error: 'Target user email not found' },
        { status: 400 }
      )
    }

    // Generate a magic link for the target user
    // Magic links automatically authenticate when clicked and redirect to the specified URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3013'
    // Use a simpler redirect URL - Supabase will append tokens to it
    // The callback handler will detect magic link from the hash tokens
    const redirectUrl = `${siteUrl}/auth/callback`
    
    console.log('🔐 Generating magic link for:', { targetEmail, redirectUrl, siteUrl })
    
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: targetEmail,
      options: {
        redirectTo: redirectUrl
      }
    })
    
    console.log('🔐 Magic link generation result:', {
      hasData: !!magicLinkData,
      hasError: !!magicLinkError,
      errorMessage: magicLinkError?.message,
      hasActionLink: !!magicLinkData?.properties?.action_link
    })

    if (magicLinkError || !magicLinkData?.properties?.action_link) {
      console.error('Error generating magic link:', magicLinkError)
      return NextResponse.json(
        { error: 'Failed to generate magic link', details: magicLinkError?.message },
        { status: 500 }
      )
    }

    // Use the magic link directly - it will authenticate and redirect
    const magicLink = magicLinkData.properties.action_link
    console.log('Magic link generated:', magicLink.substring(0, 100) + '...')

    // Create ghost session record
    const { data: ghostSession, error: createError } = await supabaseAdmin
      .from('ghost_sessions')
      .insert({
        superadmin_id: session.user.id,
        target_user_id: target_user_id,
        notes: notes || '',
        active: true,
        magic_link: magicLink,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating ghost session:', createError)
      // If table doesn't exist, return a mock session with the ghost login URL
      return NextResponse.json({
        success: true,
        ghost_session: {
          id: `ghost_${Date.now()}`,
          superadmin_id: session.user.id,
          target_user_id: target_user_id,
          notes: notes || '',
          active: true,
          magic_link: magicLink,
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

