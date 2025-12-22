/**
 * Touring Platform - Smart Venue Matching
 * AI-powered venue recommendations based on tour requirements
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * POST - Find matching venues
 */
export async function POST(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { city, country, capacity, venueType, budget, date } = await request.json();
    
    if (!city || !country) {
      return NextResponse.json(
        { error: 'city and country required' },
        { status: 400 }
      );
    }
    
    // Build query
    let query = supabaseAdmin
      .from('venues')
      .select('*')
      .ilike('city', `%${city}%`)
      .ilike('country', `%${country}%`);
    
    // Add filters
    if (capacity) {
      query = query.gte('capacity', capacity * 0.8) // 80% of desired capacity
                   .lte('capacity', capacity * 1.5); // Up to 150% of desired capacity
    }
    
    if (venueType) {
      query = query.eq('venue_type', venueType);
    }
    
    const { data: venues, error } = await query.limit(20);
    
    if (error) throw error;
    
    // Score and rank venues
    const scoredVenues = venues.map(venue => {
      let score = 100;
      
      // Capacity match (closer to desired = higher score)
      if (capacity && venue.capacity) {
        const capacityDiff = Math.abs(venue.capacity - capacity);
        const capacityScore = Math.max(0, 100 - (capacityDiff / capacity) * 100);
        score = (score + capacityScore) / 2;
      }
      
      // Venue type match
      if (venueType && venue.venue_type === venueType) {
        score += 20;
      }
      
      // Has coordinates (better for routing)
      if (venue.latitude && venue.longitude) {
        score += 10;
      }
      
      // Has contact info
      if (venue.phone || venue.email) {
        score += 10;
      }
      
      return {
        ...venue,
        matchScore: Math.min(100, score)
      };
    });
    
    // Sort by score
    scoredVenues.sort((a, b) => b.matchScore - a.matchScore);
    
    return NextResponse.json({
      success: true,
      venues: scoredVenues.slice(0, 10), // Top 10 matches
      criteria: {
        city,
        country,
        capacity,
        venueType,
        budget,
        date
      }
    });
    
  } catch (error) {
    console.error('Venue matching error:', error);
    return NextResponse.json(
      { error: 'Failed to find matching venues', details: error.message },
      { status: 500 }
    );
  }
}

