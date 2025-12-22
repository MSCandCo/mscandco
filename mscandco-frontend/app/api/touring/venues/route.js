/**
 * Touring Platform - Venues API
 * Search and manage venues database
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * GET - Search venues
 */
export async function GET(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const venueType = searchParams.get('type');
    const minCapacity = searchParams.get('minCapacity');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let venuesQuery = supabaseAdmin
      .from('venues')
      .select('*');
    
    // Text search
    if (query) {
      venuesQuery = venuesQuery.or(`name.ilike.%${query}%,city.ilike.%${query}%,address.ilike.%${query}%`);
    }
    
    // Filters
    if (city) {
      venuesQuery = venuesQuery.ilike('city', `%${city}%`);
    }
    
    if (country) {
      venuesQuery = venuesQuery.eq('country', country);
    }
    
    if (venueType) {
      venuesQuery = venuesQuery.eq('venue_type', venueType);
    }
    
    if (minCapacity) {
      venuesQuery = venuesQuery.gte('capacity', parseInt(minCapacity));
    }
    
    venuesQuery = venuesQuery.order('name', { ascending: true }).limit(limit);
    
    const { data: venues, error } = await venuesQuery;
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      venues: venues || [],
      count: venues?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Error searching venues:', error);
    return NextResponse.json(
      { error: 'Failed to search venues', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new venue
 */
export async function POST(request) {
  try {
    // Lazy load Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const body = await request.json();
    const { name, address, city, state_province, country, postal_code, capacity, venue_type, phone, email, website } = body;
    
    if (!name || !city || !country) {
      return NextResponse.json(
        { error: 'Missing required fields: name, city, country' },
        { status: 400 }
      );
    }
    
    const { data: venue, error } = await supabaseAdmin
      .from('venues')
      .insert({
        name,
        address: address || null,
        city,
        state_province: state_province || null,
        country,
        postal_code: postal_code || null,
        capacity: capacity || null,
        venue_type: venue_type || null,
        phone: phone || null,
        email: email || null,
        website: website || null
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      venue
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error creating venue:', error);
    return NextResponse.json(
      { error: 'Failed to create venue', details: error.message },
      { status: 500 }
    );
  }
}

