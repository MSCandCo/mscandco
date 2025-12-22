/**
 * Touring Platform - Apollo AI Multi-Date Tour Creation
 * Create tour from multiple ticket links
 */

import { NextResponse } from 'next/server';
import { parseTicketUrl } from '@/lib/integrations/ticket-parser';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * POST - Create tour from multiple ticket links
 */
export async function POST(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { ticketUrls, userId, tourData } = await request.json();
    
    if (!ticketUrls || !Array.isArray(ticketUrls) || ticketUrls.length === 0 || !userId) {
      return NextResponse.json(
        { error: 'ticketUrls array and userId required' },
        { status: 400 }
      );
    }
    
    // Parse all ticket URLs
    const events = [];
    const missingData = [];
    
    for (const url of ticketUrls) {
      try {
        const eventInfo = await parseTicketUrl(url);
        
        // Check for missing data
        const missing = [];
        if (!eventInfo.name) missing.push('name');
        if (!eventInfo.start) missing.push('date');
        if (!eventInfo.venue?.city) missing.push('city');
        
        if (missing.length > 0) {
          missingData.push({
            url,
            eventInfo,
            missingFields: missing
          });
        } else {
          events.push(eventInfo);
        }
      } catch (error) {
        missingData.push({
          url,
          error: error.message
        });
      }
    }
    
    // If we have missing data, return questions
    if (missingData.length > 0) {
      const questions = [];
      missingData.forEach((item, index) => {
        if (item.missingFields) {
          item.missingFields.forEach(field => {
            questions.push(`For event ${index + 1} (${item.url}): What is the ${field}?`);
          });
        }
      });
      
      return NextResponse.json({
        success: false,
        needsQuestions: true,
        events: events,
        missingData: missingData,
        questions: questions,
        message: `I found ${events.length} complete events, but need more information for ${missingData.length} events.`
      });
    }
    
    // Get user profile
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('artist_name, label_name, role')
      .eq('id', userId)
      .single();
    
    const artistName = userProfile?.artist_name || userProfile?.label_name || 'Artist';
    
    // Sort events by date
    events.sort((a, b) => new Date(a.start) - new Date(b.start));
    
    // Create tour
    const tourName = tourData?.tourName || `${artistName} - ${new Date(events[0].start).getFullYear()} Tour`;
    const tourDescription = tourData?.description || `Tour created from ${events.length} events`;
    
    const { data: tour, error: tourError } = await supabaseAdmin
      .from('tours')
      .insert({
        user_id: userId,
        name: tourName,
        artist_name: artistName,
        description: tourDescription,
        status: 'planning',
        start_date: events[0].start ? new Date(events[0].start).toISOString().split('T')[0] : null,
        end_date: events[events.length - 1].start ? new Date(events[events.length - 1].start).toISOString().split('T')[0] : null,
        budget: tourData?.budget || null,
        currency: events[0].currency || 'GBP',
        metadata: {
          created_from_tickets: true,
          ticket_urls: ticketUrls,
          event_count: events.length
        }
      })
      .select()
      .single();
    
    if (tourError) {
      throw new Error(`Failed to create tour: ${tourError.message}`);
    }
    
    // Create tour dates for each event
    const createdDates = [];
    for (const event of events) {
      const eventDate = new Date(event.start);
      const showTime = eventDate.toTimeString().slice(0, 5);
      
      const { data: tourDate } = await supabaseAdmin
        .from('tour_dates')
        .insert({
          tour_id: tour.id,
          date: eventDate.toISOString().split('T')[0],
          city: event.venue?.city || null,
          state_province: event.venue?.state || null,
          country: event.venue?.country || null,
          show_time: showTime,
          status: 'pending',
          capacity: event.capacity || null,
          eventbrite_event_id: event.platform === 'eventbrite' ? event.eventId : null,
          eventbrite_url: event.platform === 'eventbrite' ? event.url : null,
          metadata: {
            created_from_ticket: true,
            platform: event.platform,
            venue_info: event.venue
          }
        })
        .select()
        .single();
      
      if (tourDate) {
        createdDates.push(tourDate);
      }
    }
    
    return NextResponse.json({
      success: true,
      tour: {
        id: tour.id,
        name: tour.name,
        artist_name: tour.artist_name,
        status: tour.status,
        start_date: tour.start_date,
        end_date: tour.end_date
      },
      tourDates: createdDates.map(date => ({
        id: date.id,
        date: date.date,
        city: date.city,
        country: date.country
      })),
      eventCount: events.length,
      message: `Successfully created tour "${tour.name}" with ${createdDates.length} dates from ${events.length} events.`
    }, { status: 201 });
    
  } catch (error) {
    console.error('Multi-date tour creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create tour from ticket links',
        details: error.message
      },
      { status: 500 }
    );
  }
}

