/**
 * Touring Platform - Single Guest API
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * PATCH - Update guest (approve/decline)
 */
export async function PATCH(request, { params }) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { guestId } = params;
    const body = await request.json();
    const { status, approved_by, declined_reason } = body;
    
    if (!status || !['approved', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "declined"' },
        { status: 400 }
      );
    }
    
    const updates = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'approved') {
      updates.approved_by = approved_by || null;
      updates.approved_at = new Date().toISOString();
    } else {
      updates.declined_reason = declined_reason || null;
    }
    
    const { data: guest, error } = await supabaseAdmin
      .from('guest_lists')
      .update(updates)
      .eq('id', guestId)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      guest
    });
    
  } catch (error) {
    console.error('❌ Error updating guest:', error);
    return NextResponse.json(
      { error: 'Failed to update guest', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove guest from list
 */
export async function DELETE(request, { params }) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { guestId } = params;
    
    const { error } = await supabaseAdmin
      .from('guest_lists')
      .delete()
      .eq('id', guestId);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: 'Guest removed successfully'
    });
    
  } catch (error) {
    console.error('❌ Error removing guest:', error);
    return NextResponse.json(
      { error: 'Failed to remove guest', details: error.message },
      { status: 500 }
    );
  }
}

