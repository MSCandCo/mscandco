/**
 * Touring Platform - AI Suggestions API
 * Smart suggestions for tour naming, crew, budget, etc.
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * POST - Get AI suggestions
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

    const { type, data } = await request.json();
    
    if (!type) {
      return NextResponse.json(
        { error: 'type required' },
        { status: 400 }
      );
    }
    
    switch (type) {
      case 'tour_name':
        return getTourNameSuggestions(data);
      
      case 'crew':
        return getCrewSuggestions(data);
      
      case 'budget':
        return getBudgetEstimate(data);
      
      default:
        return NextResponse.json(
          { error: 'Invalid suggestion type' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions', details: error.message },
      { status: 500 }
    );
  }
}

async function getTourNameSuggestions(data) {
  const { artistName, cities, year, tourType } = data;
  
  const suggestions = [];
  
  if (artistName && cities && cities.length > 0) {
    // Generate smart tour names
    if (cities.length === 1) {
      suggestions.push(`${artistName} - ${cities[0]} ${year || new Date().getFullYear()}`);
      suggestions.push(`${artistName} Live in ${cities[0]}`);
    } else if (cities.length <= 3) {
      suggestions.push(`${artistName} - ${cities.join(' & ')} Tour`);
      suggestions.push(`${artistName} ${year || new Date().getFullYear()} Tour`);
    } else {
      suggestions.push(`${artistName} ${year || new Date().getFullYear()} World Tour`);
      suggestions.push(`${artistName} - ${cities.length} City Tour`);
    }
    
    if (tourType) {
      suggestions.push(`${artistName} - ${tourType} Tour ${year || new Date().getFullYear()}`);
    }
  }
  
  // Fallback suggestions
  if (suggestions.length === 0) {
    suggestions.push(`${artistName || 'Artist'} Tour ${year || new Date().getFullYear()}`);
    suggestions.push(`${artistName || 'Artist'} Live Tour`);
    suggestions.push(`${artistName || 'Artist'} ${year || new Date().getFullYear()} Tour`);
  }
  
  return NextResponse.json({
    success: true,
    suggestions: suggestions.slice(0, 5),
    type: 'tour_name'
  });
}

async function getCrewSuggestions(data) {
  const { venueCapacity, tourType, budget } = data;
  
  const suggestions = {
    essential: [],
    recommended: [],
    optional: []
  };
  
  // Essential crew (always needed)
  suggestions.essential = [
    { role: 'Tour Manager', reason: 'Essential for tour coordination' },
    { role: 'Sound Engineer', reason: 'Required for live sound' }
  ];
  
  // Recommended based on venue size
  if (venueCapacity && venueCapacity > 500) {
    suggestions.recommended.push(
      { role: 'Monitor Engineer', reason: 'Larger venues require dedicated monitor mixing' },
      { role: 'Lighting Designer', reason: 'Professional lighting needed for larger shows' }
    );
  }
  
  if (venueCapacity && venueCapacity > 1000) {
    suggestions.recommended.push(
      { role: 'Production Manager', reason: 'Larger productions need dedicated production management' },
      { role: 'Guitar Tech', reason: 'Instrument maintenance for larger shows' },
      { role: 'Drum Tech', reason: 'Drum kit setup and maintenance' }
    );
  }
  
  if (venueCapacity && venueCapacity > 5000) {
    suggestions.recommended.push(
      { role: 'Security', reason: 'Large venues require security coordination' },
      { role: 'Merchandise Manager', reason: 'Higher sales potential at larger venues' }
    );
  }
  
  // Optional based on budget
  if (budget && budget > 50000) {
    suggestions.optional.push(
      { role: 'Photographer', reason: 'Tour documentation and content creation' },
      { role: 'Videographer', reason: 'Video content for social media' }
    );
  }
  
  return NextResponse.json({
    success: true,
    suggestions,
    type: 'crew',
    totalSuggested: suggestions.essential.length + suggestions.recommended.length + suggestions.optional.length
  });
}

async function getBudgetEstimate(data) {
  const { tourDates, cities, crewCount, venueCapacity } = data;
  
  const dateCount = tourDates || 1;
  const cityCount = cities?.length || 1;
  
  // Base estimates (in GBP)
  let baseEstimate = 0;
  
  // Travel costs (estimate £200-500 per city)
  const travelCost = cityCount * 300;
  
  // Accommodation (£100-200 per night per person)
  const accommodationCost = dateCount * 150 * (crewCount || 5);
  
  // Venue costs (varies by capacity)
  let venueCost = 0;
  if (venueCapacity) {
    if (venueCapacity < 500) venueCost = dateCount * 500;
    else if (venueCapacity < 2000) venueCost = dateCount * 2000;
    else if (venueCapacity < 5000) venueCost = dateCount * 5000;
    else venueCost = dateCount * 10000;
  } else {
    venueCost = dateCount * 2000; // Average
  }
  
  // Crew costs (£200-500 per day per crew member)
  const crewCost = dateCount * 300 * (crewCount || 5);
  
  // Equipment/backline (£500-2000 per show)
  const equipmentCost = dateCount * 1000;
  
  // Food & per diems (£50-100 per person per day)
  const foodCost = dateCount * 75 * (crewCount || 5);
  
  baseEstimate = travelCost + accommodationCost + venueCost + crewCost + equipmentCost + foodCost;
  
  // Add 20% buffer
  const totalEstimate = baseEstimate * 1.2;
  
  return NextResponse.json({
    success: true,
    estimate: {
      total: totalEstimate,
      breakdown: {
        travel: travelCost,
        accommodation: accommodationCost,
        venues: venueCost,
        crew: crewCost,
        equipment: equipmentCost,
        food: foodCost,
        buffer: baseEstimate * 0.2
      },
      perShow: totalEstimate / dateCount,
      currency: 'GBP'
    },
    type: 'budget'
  });
}

