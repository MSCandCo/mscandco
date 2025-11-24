/**
 * Touring Platform - Tour Crew API
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET - Get all crew for a tour
 */
export async function GET(request, { params }) {
  try {
    const { tourId } = params;
    const activeOnly = request.nextUrl.searchParams.get('activeOnly') !== 'false';
    
    let query = supabaseAdmin
      .from('tour_crew')
      .select('*')
      .eq('tour_id', tourId);
    
    if (activeOnly) {
      query = query.eq('active', true);
    }
    
    query = query.order('name', { ascending: true });
    
    const { data: crew, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      crew: crew || []
    });
    
  } catch (error) {
    console.error('❌ Error fetching crew:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crew', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Add crew member to tour
 */
export async function POST(request, { params }) {
  try {
    const { tourId } = params;
    const body = await request.json();
    
    const { name, role, email, phone, user_id, permissions, rate, rate_type, dietary_restrictions, allergies } = body;
    
    if (!name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role' },
        { status: 400 }
      );
    }
    
    const { data: crewMember, error } = await supabaseAdmin
      .from('tour_crew')
      .insert({
        tour_id: tourId,
        name,
        role,
        email: email || null,
        phone: phone || null,
        user_id: user_id || null,
        permissions: permissions || 'crew',
        rate: rate || null,
        rate_type: rate_type || null,
        dietary_restrictions: dietary_restrictions || null,
        allergies: allergies || null,
        active: true
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      crewMember
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error adding crew member:', error);
    return NextResponse.json(
      { error: 'Failed to add crew member', details: error.message },
      { status: 500 }
    );
  }
}

