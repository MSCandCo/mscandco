/**
 * Touring Platform - Route Optimization API
 * AI-powered route optimization for tour dates
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * POST - Optimize tour route
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

    const { tourId, optimizationType = 'distance' } = await request.json();
    
    if (!tourId) {
      return NextResponse.json(
        { error: 'tourId required' },
        { status: 400 }
      );
    }
    
    // Fetch tour dates
    const { data: tourDates } = await supabaseAdmin
      .from('tour_dates')
      .select('*, venues(*)')
      .eq('tour_id', tourId)
      .order('date', { ascending: true });
    
    if (!tourDates || tourDates.length === 0) {
      return NextResponse.json(
        { error: 'No tour dates found' },
        { status: 404 }
      );
    }
    
    // Get coordinates for each date
    const locations = tourDates.map(date => ({
      id: date.id,
      city: date.city,
      country: date.country,
      venue: date.venues?.name,
      latitude: date.venues?.latitude || null,
      longitude: date.venues?.longitude || null,
      date: date.date,
      originalOrder: tourDates.indexOf(date)
    }));
    
    // Optimize route
    const optimizedRoute = optimizeRoute(locations, optimizationType);
    
    // Calculate savings
    const originalDistance = calculateTotalDistance(locations);
    const optimizedDistance = calculateTotalDistance(optimizedRoute);
    const distanceSaved = originalDistance - optimizedDistance;
    const timeSaved = distanceSaved / 60; // Assuming 60 mph average
    
    // Estimate cost savings (assuming $0.50 per mile)
    const costSaved = distanceSaved * 0.5;
    
    return NextResponse.json({
      success: true,
      optimizedRoute: optimizedRoute.map((loc, index) => ({
        ...loc,
        newOrder: index + 1,
        originalOrder: loc.originalOrder + 1
      })),
      savings: {
        distance: {
          original: originalDistance,
          optimized: optimizedDistance,
          saved: distanceSaved,
          percentage: originalDistance > 0 ? ((distanceSaved / originalDistance) * 100).toFixed(1) : 0
        },
        time: {
          saved: timeSaved.toFixed(1),
          unit: 'hours'
        },
        cost: {
          saved: costSaved.toFixed(2),
          currency: 'USD'
        }
      },
      recommendations: generateRecommendations(optimizedRoute, {
        distanceSaved,
        timeSaved,
        costSaved
      })
    });
    
  } catch (error) {
    console.error('Route optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize route', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Optimize route using nearest neighbor algorithm
 */
function optimizeRoute(locations, optimizationType) {
  if (locations.length <= 1) return locations;
  
  // Filter locations with coordinates
  const withCoords = locations.filter(loc => loc.latitude && loc.longitude);
  const withoutCoords = locations.filter(loc => !loc.latitude || !loc.longitude);
  
  if (withCoords.length === 0) {
    // If no coordinates, maintain date order
    return locations;
  }
  
  // Start with first location (or earliest date)
  const startIndex = 0;
  const optimized = [withCoords[startIndex]];
  const remaining = [...withCoords.slice(0, startIndex), ...withCoords.slice(startIndex + 1)];
  
  // Nearest neighbor algorithm
  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1];
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(
      current.latitude,
      current.longitude,
      remaining[0].latitude,
      remaining[0].longitude
    );
    
    for (let i = 1; i < remaining.length; i++) {
      const distance = calculateDistance(
        current.latitude,
        current.longitude,
        remaining[i].latitude,
        remaining[i].longitude
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }
    
    optimized.push(remaining[nearestIndex]);
    remaining.splice(nearestIndex, 1);
  }
  
  // Add locations without coordinates at the end
  return [...optimized, ...withoutCoords];
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate total distance for route
 */
function calculateTotalDistance(route) {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const current = route[i];
    const next = route[i + 1];
    
    if (current.latitude && current.longitude && next.latitude && next.longitude) {
      total += calculateDistance(
        current.latitude,
        current.longitude,
        next.latitude,
        next.longitude
      );
    }
  }
  return total;
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(optimizedRoute, savings) {
  const recommendations = [];
  
  if (savings.distanceSaved > 100) {
    recommendations.push({
      type: 'significant_savings',
      message: `Optimizing this route saves ${savings.distanceSaved.toFixed(0)} miles and approximately $${savings.costSaved.toFixed(2)} in travel costs.`,
      priority: 'high'
    });
  }
  
  // Check for long gaps
  for (let i = 0; i < optimizedRoute.length - 1; i++) {
    const current = optimizedRoute[i];
    const next = optimizedRoute[i + 1];
    
    if (current.latitude && next.latitude) {
      const distance = calculateDistance(
        current.latitude,
        current.longitude,
        next.latitude,
        next.longitude
      );
      
      if (distance > 500) {
        recommendations.push({
          type: 'long_distance',
          message: `Long travel distance (${distance.toFixed(0)} miles) between ${current.city} and ${next.city}. Consider adding a show in between.`,
          priority: 'medium',
          from: current.city,
          to: next.city,
          distance: distance.toFixed(0)
        });
      }
    }
  }
  
  return recommendations;
}

