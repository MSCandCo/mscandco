/**
 * API: Artist Requests (App Router)
 * GET /api/admin/artist-requests - Fetch all artist requests
 * POST /api/admin/artist-requests - Process artist request (approve/reject)
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

    // Get all artist requests with optional status filter
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('artist_requests')
      .select(`
        id,
        requested_by_user_id,
        requested_by_email,
        label_name,
        artist_first_name,
        artist_last_name,
        artist_stage_name,
        label_royalty_percent,
        status,
        request_type,
        approved_by_user_id,
        approved_by_email,
        rejection_reason,
        notes,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status)
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

    // Call the database function to process the request
    const { data, error } = await supabaseAdmin.rpc('process_artist_request', {
      p_request_id: requestId,
      p_action: action,
      p_rejection_reason: rejectionReason || null,
      p_notes: notes || null
    })

    if (error) {
      console.error('Error processing artist request:', error)
      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
    }

    if (!data.success) {
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in artist-requests POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
