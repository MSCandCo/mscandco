/**
 * API: Profile Change Requests (App Router)
 * GET /api/admin/profile-change-requests - Fetch all profile change requests
 * PUT /api/admin/profile-change-requests - Update request status (approve/reject)
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors

    return NextResponse.json({
      success: true,
      requests: requests || []
    })

  } catch (error) {
    console.error('❌ Profile change requests API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
        review_notes: adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating profile change request:', error)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to update request', 
        message: error.message,
        details: error 
      }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ 
        success: false,
        error: 'Request not found' 
      }, { status: 404 })
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
