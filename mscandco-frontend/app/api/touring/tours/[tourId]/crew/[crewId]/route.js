/**
 * Touring Platform - Single Crew Member API
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * PATCH - Update crew member
 */
export async function PATCH(request, { params }) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { crewId } = params;
    const body = await request.json();
    
    const updates = Object.fromEntries(
      Object.entries(body).filter(([_, v]) => v !== undefined)
    );
    
    updates.updated_at = new Date().toISOString();
    
    const { data: crewMember, error } = await supabaseAdmin
      .from('tour_crew')
      .update(updates)
      .eq('id', crewId)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      crewMember
    });
    
  } catch (error) {
    console.error('❌ Error updating crew member:', error);
    return NextResponse.json(
      { error: 'Failed to update crew member', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove crew member from tour
 */
export async function DELETE(request, { params }) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { crewId } = params;
    
    const { error } = await supabaseAdmin
      .from('tour_crew')
      .update({ active: false })
      .eq('id', crewId);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: 'Crew member removed successfully'
    });
    
  } catch (error) {
    console.error('❌ Error removing crew member:', error);
    return NextResponse.json(
      { error: 'Failed to remove crew member', details: error.message },
      { status: 500 }
    );
  }
}

