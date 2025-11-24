/**
 * Touring Platform - Tours API
 * CRUD operations for tours
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET - Fetch tours for authenticated user
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }
    
    let query = supabaseAdmin
      .from('tours')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: tours, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      tours: tours || [],
      count: tours?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Error fetching tours:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tours', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new tour
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, name, artist_name, start_date, end_date, description, budget, currency, tour_type } = body;
    
    if (!userId || !name || !artist_name) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, artist_name' },
        { status: 400 }
      );
    }
    
    const { data: tour, error } = await supabaseAdmin
      .from('tours')
      .insert({
        user_id: userId,
        name,
        artist_name,
        start_date: start_date || null,
        end_date: end_date || null,
        description: description || null,
        budget: budget || null,
        currency: currency || 'USD',
        tour_type: tour_type || null,
        status: 'planning'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      tour
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creating tour:', error);
    return NextResponse.json(
      { error: 'Failed to create tour', details: error.message },
      { status: 500 }
    );
  }
}

