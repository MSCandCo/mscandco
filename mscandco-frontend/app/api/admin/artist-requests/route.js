/**
 * API: Artist Requests (App Router)
 * GET /api/admin/artist-requests - Fetch all artist requests
 * POST /api/admin/artist-requests - Process artist request (approve/reject)
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'


// Lazy initialization to avoid build-time errors
async function getSupabaseAdmin() {
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();
}
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

    // Get all artist requests with optional status filter
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('artist_requests')
      .select(`
        id,
        from_label_id,
        to_artist_id,
        artist_first_name,
        artist_last_name,
        artist_email,
        label_admin_name,
        label_admin_email,
        status,
        message,
        created_at,
        updated_at,
        responded_at
      `)
      .order('created_at', { ascending: false })

    // Map status values: 'pending' -> 'pending', 'approved' -> 'accepted', 'rejected' -> 'declined'
    if (status) {
      const statusMap = {
        'pending': 'pending',
        'approved': 'accepted',
        'rejected': 'declined'
      }
      const mappedStatus = statusMap[status] || status
      if (['pending', 'accepted', 'declined'].includes(mappedStatus)) {
        query = query.eq('status', mappedStatus)
      }
    }

    const { data: requests, error } = await query

    if (error) {
      console.error('Error fetching artist requests:', error)
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
    }

    return NextResponse.json({ requests: requests || [] })

  } catch (error) {
    console.error('Error in artist-requests GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
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

    const body = await request.json()
    const { requestId, action, rejectionReason, notes } = body

    // Validate required fields
    if (!requestId || !action) {
      return NextResponse.json({ error: 'Request ID and action are required' }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "approve" or "reject"' }, { status: 400 })
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason is required when rejecting' }, { status: 400 })
    }

    // Map action to database status values
    const actionMap = {
      'approve': 'accepted',
      'reject': 'declined'
    }
    const dbStatus = actionMap[action]

    // Update the request status directly since process_artist_request function may not exist
    const { data: requestData, error: fetchError } = await supabaseAdmin
      .from('artist_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Update the request
    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from('artist_requests')
      .update({
        status: dbStatus,
        message: notes || requestData.message,
        updated_at: new Date().toISOString(),
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating artist request:', updateError)
      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      request: updatedData 
    })

  } catch (error) {
    console.error('Error in artist-requests POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
