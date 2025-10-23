/**
 * API: Profile Change Requests (App Router)
 * GET /api/admin/profile-change-requests - Fetch all profile change requests
 * PUT /api/admin/profile-change-requests - Update request status (approve/reject)
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
    // Check authentication using App Router server client
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
      }, { status: 401 })
    }

    console.log('📋 Admin viewing profile change requests:', { adminUserId: session.user.id })

    // Get all profile change requests (without join since FK doesn't exist)
    const { data: requests, error } = await supabaseAdmin
      .from('profile_change_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching profile change requests:', error)
      return NextResponse.json({ error: 'Failed to fetch change requests' }, { status: 500 })
    }

    console.log(`✅ Found ${requests?.length || 0} profile change requests`)

    // Manually fetch user profiles for each request
    if (requests && requests.length > 0) {
      const userIds = [...new Set(requests.map(r => r.user_id).filter(Boolean))]

      const { data: profiles, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email, first_name, last_name, artist_name')
        .in('id', userIds)

      if (!profileError && profiles) {
        // Attach user profiles to requests
        requests.forEach(request => {
          request.user_profiles = profiles.find(p => p.id === request.user_id)
        })
      }
    }

    return NextResponse.json({
      success: true,
      requests: requests || []
    })

  } catch (error) {
    console.error('❌ Profile change requests API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    // Check authentication using App Router server client
    const supabase = await createServerClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
      }, { status: 401 })
    }

    // Update request status (approve/reject)
    const body = await request.json()
    const { requestId, action, adminNotes = '' } = body

    if (!requestId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request ID or action' }, { status: 400 })
    }

    const status = action === 'approve' ? 'approved' : 'rejected'

    const { data, error } = await supabaseAdmin
      .from('profile_change_requests')
      .update({
        status: status,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes
      })
      .eq('id', requestId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating profile change request:', error)
      return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
    }

    console.log(`✅ Profile change request ${action}d:`, data.id)

    return NextResponse.json({
      success: true,
      message: `Request ${action}d successfully`,
      request: data
    })

  } catch (error) {
    console.error('❌ Profile change requests API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
