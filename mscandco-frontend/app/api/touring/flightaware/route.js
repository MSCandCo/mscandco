/**
 * Touring Platform - FlightAware Integration
 * Real-time flight tracking for tour travel
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * GET - Track flight status
 */
export async function GET(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { searchParams } = new URL(request.url);
    const flightNumber = searchParams.get('flightNumber');
    const travelItemId = searchParams.get('travelItemId');
    
    if (!flightNumber && !travelItemId) {
      return NextResponse.json(
        { error: 'flightNumber or travelItemId required' },
        { status: 400 }
      );
    }
    
    let flightNum = flightNumber;
    
    // If travelItemId provided, get flight number from travel item
    if (travelItemId && !flightNumber) {
      const { data: travelItem } = await supabaseAdmin
        .from('travel_items')
        .select('flight_number')
        .eq('id', travelItemId)
        .single();
      
      if (travelItem?.flight_number) {
        flightNum = travelItem.flight_number;
      } else {
        return NextResponse.json(
          { error: 'Flight number not found for travel item' },
          { status: 404 }
        );
      }
    }
    
    // FlightAware API integration
    // Note: Requires FlightAware API key in environment variables
    const flightAwareApiKey = process.env.FLIGHTAWARE_API_KEY;
    const flightAwareUsername = process.env.FLIGHTAWARE_USERNAME;
    
    if (!flightAwareApiKey || !flightAwareUsername) {
      // Return mock data for development
      return NextResponse.json({
        success: true,
        flight: {
          flightNumber: flightNum,
          status: 'on_time',
          departure: {
            airport: 'LAX',
            scheduled: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            actual: null,
            gate: 'A12',
            terminal: '1'
          },
          arrival: {
            airport: 'JFK',
            scheduled: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
            actual: null,
            gate: 'B5',
            terminal: '4'
          },
          aircraft: {
            type: 'Boeing 737',
            registration: 'N12345'
          },
          tracking: {
            lastUpdate: new Date().toISOString(),
            source: 'mock'
          }
        },
        message: 'FlightAware API not configured. Showing mock data.'
      });
    }
    
    // Real FlightAware API call
    try {
      const response = await fetch(`https://flightxml.flightaware.com/json/FlightXML3/FlightInfoStatus?ident=${flightNum}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${flightAwareUsername}:${flightAwareApiKey}`).toString('base64')}`
        }
      });
      
      const data = await response.json();
      
      if (data.FlightInfoStatusResult) {
        const flight = data.FlightInfoStatusResult.flights[0];
        
        return NextResponse.json({
          success: true,
          flight: {
            flightNumber: flightNum,
            status: flight.status || 'unknown',
            departure: {
              airport: flight.origin?.code || '',
              scheduled: flight.scheduled_out || null,
              actual: flight.actual_out || null,
              gate: flight.origin?.gate || null,
              terminal: flight.origin?.terminal || null
            },
            arrival: {
              airport: flight.destination?.code || '',
              scheduled: flight.scheduled_in || null,
              actual: flight.actual_in || null,
              gate: flight.destination?.gate || null,
              terminal: flight.destination?.terminal || null
            },
            aircraft: {
              type: flight.aircrafttype || null,
              registration: flight.registration || null
            },
            tracking: {
              lastUpdate: new Date().toISOString(),
              source: 'flightaware'
            }
          }
        });
      }
    } catch (apiError) {
      console.error('FlightAware API error:', apiError);
      // Fallback to mock data
    }
    
    // Fallback mock data
    return NextResponse.json({
      success: true,
      flight: {
        flightNumber: flightNum,
        status: 'on_time',
        departure: {
          airport: 'LAX',
          scheduled: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          actual: null,
          gate: 'A12'
        },
        arrival: {
          airport: 'JFK',
          scheduled: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          actual: null,
          gate: 'B5'
        },
        tracking: {
          lastUpdate: new Date().toISOString(),
          source: 'fallback'
        }
      },
      message: 'Using fallback flight data'
    });
    
  } catch (error) {
    console.error('Flight tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track flight', details: error.message },
      { status: 500 }
    );
  }
}

