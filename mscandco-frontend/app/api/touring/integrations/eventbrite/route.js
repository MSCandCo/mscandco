/**
 * Touring Platform - Eventbrite Integration
 * Sync tour dates with Eventbrite events and ticket sales
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  getEventAttendees,
  listVenues,
  getTicketClasses,
} from '@/lib/integrations/eventbrite';

/**
 * GET - Sync Eventbrite events with tour dates
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const eventId = searchParams.get('eventId');
    const tourDateId = searchParams.get('tourDateId');
    
    switch (action) {
      case 'sync':
        // Sync Eventbrite event with tour date
        if (!tourDateId || !eventId) {
          return NextResponse.json(
            { error: 'tourDateId and eventId required' },
            { status: 400 }
          );
        }
        
        // Get tour date
        const { data: tourDate } = await supabase
          .from('tour_dates')
          .select('*, tours(*)')
          .eq('id', tourDateId)
          .single();
        
        if (!tourDate) {
          return NextResponse.json(
            { error: 'Tour date not found' },
            { status: 404 }
          );
        }
        
        // Get Eventbrite event
        const eventbriteEvent = await getEventById(eventId);
        
        // Get attendees
        const attendees = await getEventAttendees(eventId);
        
        // Get ticket classes
        const ticketClasses = await getTicketClasses(eventId);
        
        // Update tour date with Eventbrite data
        await supabase
          .from('tour_dates')
          .update({
            eventbrite_event_id: eventId,
            eventbrite_url: eventbriteEvent.url,
            capacity: eventbriteEvent.capacity || tourDate.capacity,
            actual_attendance: attendees.attendees?.length || null,
            metadata: {
              ...tourDate.metadata,
              eventbrite: {
                event_id: eventId,
                url: eventbriteEvent.url,
                ticket_classes: ticketClasses.ticket_classes,
                attendee_count: attendees.attendees?.length || 0
              }
            }
          })
          .eq('id', tourDateId);
        
        // Sync revenue from ticket sales
        if (ticketClasses.ticket_classes) {
          let totalRevenue = 0;
          
          for (const ticketClass of ticketClasses.ticket_classes) {
            if (ticketClass.quantity_sold && ticketClass.cost) {
              totalRevenue += parseFloat(ticketClass.cost.major_value) * ticketClass.quantity_sold;
            }
          }
          
          if (totalRevenue > 0) {
            // Check if revenue record exists
            const { data: existingRevenue } = await supabase
              .from('tour_revenue')
              .select('*')
              .eq('tour_date_id', tourDateId)
              .eq('source', 'eventbrite')
              .maybeSingle();
            
            if (existingRevenue) {
              await supabase
                .from('tour_revenue')
                .update({
                  amount: totalRevenue,
                  description: `Eventbrite ticket sales - ${attendees.attendees?.length || 0} tickets sold`
                })
                .eq('id', existingRevenue.id);
            } else {
              await supabase
                .from('tour_revenue')
                .insert({
                  tour_date_id: tourDateId,
                  source: 'eventbrite',
                  amount: totalRevenue,
                  description: `Eventbrite ticket sales - ${attendees.attendees?.length || 0} tickets sold`,
                  payment_method: 'eventbrite',
                  reference_number: eventId,
                  recorded_by: user.id
                });
            }
          }
        }
        
        return NextResponse.json({
          success: true,
          event: eventbriteEvent,
          attendees: attendees.attendees || [],
          ticketClasses: ticketClasses.ticket_classes || [],
          synced: true
        });
        
      case 'list':
        // List Eventbrite events
        const events = await listEvents({
          status: 'live',
          order_by: 'start_asc',
          page_size: 50
        });
        
        return NextResponse.json({
          success: true,
          events: events.events || []
        });
        
      case 'get':
        // Get specific event
        if (!eventId) {
          return NextResponse.json(
            { error: 'eventId required' },
            { status: 400 }
          );
        }
        
        const event = await getEventById(eventId);
        const eventAttendees = await getEventAttendees(eventId);
        const eventTicketClasses = await getTicketClasses(eventId);
        
        return NextResponse.json({
          success: true,
          event,
          attendees: eventAttendees.attendees || [],
          ticketClasses: eventTicketClasses.ticket_classes || []
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Eventbrite integration error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync with Eventbrite',
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create Eventbrite event from tour date
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { tourDateId, eventData } = body;
    
    if (!tourDateId) {
      return NextResponse.json(
        { error: 'tourDateId required' },
        { status: 400 }
      );
    }
    
    // Get tour date
    const { data: tourDate } = await supabase
      .from('tour_dates')
      .select('*, tours(*)')
      .eq('id', tourDateId)
      .single();
    
    if (!tourDate) {
      return NextResponse.json(
        { error: 'Tour date not found' },
        { status: 404 }
      );
    }
    
    // Prepare event data
    const eventbriteEventData = eventData || {
      name: {
        html: `${tourDate.tours.artist_name} - ${tourDate.city}, ${tourDate.country}`
      },
      description: {
        html: tourDate.tours.description || `Live performance by ${tourDate.tours.artist_name}`
      },
      start: {
        timezone: 'UTC',
        utc: new Date(`${tourDate.date}T${tourDate.show_time || '20:00'}:00`).toISOString()
      },
      end: {
        timezone: 'UTC',
        utc: new Date(`${tourDate.date}T${tourDate.show_time || '20:00'}:00`).toISOString()
      },
      currency: 'GBP',
      online_event: false,
      venue_id: null, // Would need to match with Eventbrite venue
      capacity: tourDate.capacity || null
    };
    
    // Create Eventbrite event
    const eventbriteEvent = await createEvent(eventbriteEventData);
    
    // Update tour date with Eventbrite event ID
    await supabase
      .from('tour_dates')
      .update({
        eventbrite_event_id: eventbriteEvent.id,
        eventbrite_url: eventbriteEvent.url,
        metadata: {
          ...tourDate.metadata,
          eventbrite: {
            event_id: eventbriteEvent.id,
            url: eventbriteEvent.url,
            created_at: new Date().toISOString()
          }
        }
      })
      .eq('id', tourDateId);
    
    return NextResponse.json({
      success: true,
      event: eventbriteEvent
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create Eventbrite event error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create Eventbrite event',
        message: error.message
      },
      { status: 500 }
    );
  }
}

