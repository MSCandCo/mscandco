/**
 * API: Update Earnings Status (App Router)
 * PUT /api/admin/earnings/update-status - Update status of earnings entry
 */

import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PUT(request) {
  try {
    // Lazy load Supabase clients
    const { createClient } = await import('@/lib/supabase/server');
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    
    const supabase = await createClient();
    const supabaseAdmin = await createServiceRoleClient();
    
    // Check authentication using App Router server client
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
      }, { status: 401 })
    }

    const body = await request.json()
    const { entry_id, status, payment_date, notes } = body

    // Validation
    if (!entry_id || !status) {
      return NextResponse.json({
        error: 'Missing required fields: entry_id, status'
      }, { status: 400 })
    }

    const validStatuses = ['pending', 'processing', 'paid', 'held', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        error: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
      }, { status: 400 })
    }

    console.log(`💰 Updating earnings entry ${entry_id} to status: ${status}`)

    // Prepare update data
    const updateData = {
      status
    }

    // Add payment_date if status is 'paid' and date provided
    if (status === 'paid' && payment_date) {
      updateData.payment_date = payment_date
    }

    // Add notes if provided
    if (notes) {
      updateData.notes = notes
    }

    // Update earnings entry in earnings_log table
    const { data: updatedEntry, error: updateError } = await supabaseAdmin
      .from('earnings_log')
      .update(updateData)
      .eq('id', entry_id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating earnings entry:', updateError)
      return NextResponse.json({
        error: 'Failed to update earnings entry',
        details: updateError.message
      }, { status: 500 })
    }

    console.log('✅ Earnings entry updated successfully:', updatedEntry.id)

    return NextResponse.json({
      success: true,
      message: 'Earnings entry status updated successfully',
      entry: updatedEntry
    })

  } catch (error) {
    console.error('❌ Update status API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
