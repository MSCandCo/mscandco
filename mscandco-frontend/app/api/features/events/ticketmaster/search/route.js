import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { searchEvents, searchVenues, searchAttractions, getEventById, getEventsByAttraction } from '@/lib/integrations/ticketmaster';

/**
 * GET /api/features/events/ticketmaster/search
 * Search Ticketmaster events, venues, or attractions
 */
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'events'; // events, venues, attractions
    const keyword = searchParams.get('keyword');
    const city = searchParams.get('city');
    const countryCode = searchParams.get('countryCode');
    const startDateTime = searchParams.get('startDateTime');
    const endDateTime = searchParams.get('endDateTime');
    const size = parseInt(searchParams.get('size') || '20');
    const page = parseInt(searchParams.get('page') || '0');
    const eventId = searchParams.get('eventId');
    const attractionId = searchParams.get('attractionId');

    // Get single event by ID
    if (eventId) {
      const event = await getEventById(eventId);
      return NextResponse.json({ success: true, data: event });
    }

    // Get events by attraction ID
    if (attractionId) {
      const events = await getEventsByAttraction(attractionId, {
        size: Math.min(size, 200),
        page,
      });
      return NextResponse.json({ success: true, data: events });
    }

    // Search based on type
    let result;
    const params = {
      ...(keyword && { keyword }),
      ...(city && { city }),
      ...(countryCode && { countryCode }),
      ...(startDateTime && { startDateTime }),
      ...(endDateTime && { endDateTime }),
      size: Math.min(size, 200),
      ...(page > 0 && { page }),
    };

    switch (type) {
      case 'venues':
        result = await searchVenues(params);
        break;
      case 'attractions':
        result = await searchAttractions(params);
        break;
      case 'events':
      default:
        result = await searchEvents(params);
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
      type,
    });
  } catch (error) {
    console.error('Ticketmaster API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search Ticketmaster',
        message: error.message,
      },
      { status: 500 }
    );
  }
}


