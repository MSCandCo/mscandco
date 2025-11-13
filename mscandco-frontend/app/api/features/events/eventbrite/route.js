import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import {
  getCurrentUser,
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  getEventAttendees,
  listVenues,
  createVenue,
  getTicketClasses,
  createTicketClass,
} from '@/lib/integrations/eventbrite';

/**
 * GET /api/features/events/eventbrite
 * List events or get event details
 * 
 * POST /api/features/events/eventbrite
 * Create a new event
 * 
 * PUT /api/features/events/eventbrite
 * Update an event
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
    const action = searchParams.get('action') || 'list'; // list, get, attendees, venues, ticket-classes
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const orderBy = searchParams.get('orderBy');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    switch (action) {
      case 'me':
        // Get current user info
        const userInfo = await getCurrentUser();
        return NextResponse.json({ success: true, data: userInfo });

      case 'get':
        // Get specific event
        if (!eventId) {
          return NextResponse.json(
            { error: 'eventId is required' },
            { status: 400 }
          );
        }
        const event = await getEventById(eventId);
        return NextResponse.json({ success: true, data: event });

      case 'attendees':
        // Get event attendees
        if (!eventId) {
          return NextResponse.json(
            { error: 'eventId is required' },
            { status: 400 }
          );
        }
        const attendees = await getEventAttendees(eventId, { page_size: pageSize });
        return NextResponse.json({ success: true, data: attendees });

      case 'venues':
        // List venues
        const venues = await listVenues({ page_size: pageSize });
        return NextResponse.json({ success: true, data: venues });

      case 'ticket-classes':
        // Get ticket classes for event
        if (!eventId) {
          return NextResponse.json(
            { error: 'eventId is required' },
            { status: 400 }
          );
        }
        const ticketClasses = await getTicketClasses(eventId);
        return NextResponse.json({ success: true, data: ticketClasses });

      case 'list':
      default:
        // List events
        const events = await listEvents({
          status,
          order_by: orderBy,
          page_size: pageSize,
        });
        return NextResponse.json({ success: true, data: events });
    }
  } catch (error) {
    console.error('Eventbrite API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Eventbrite data',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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
    const action = searchParams.get('action') || 'event'; // event, venue, ticket-class
    const eventId = searchParams.get('eventId');
    const body = await request.json();

    switch (action) {
      case 'event':
        // Create event
        const event = await createEvent(body);
        return NextResponse.json({ success: true, data: event }, { status: 201 });

      case 'venue':
        // Create venue
        const venue = await createVenue(body);
        return NextResponse.json({ success: true, data: venue }, { status: 201 });

      case 'ticket-class':
        // Create ticket class
        if (!eventId) {
          return NextResponse.json(
            { error: 'eventId is required for ticket class creation' },
            { status: 400 }
          );
        }
        const ticketClass = await createTicketClass(eventId, body);
        return NextResponse.json({ success: true, data: ticketClass }, { status: 201 });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Eventbrite API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create Eventbrite resource',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
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
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updatedEvent = await updateEvent(eventId, body);

    return NextResponse.json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error('Eventbrite API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update event',
        message: error.message,
      },
      { status: 500 }
    );
  }
}


