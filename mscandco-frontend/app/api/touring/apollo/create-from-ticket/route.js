/**
 * Touring Platform - Apollo AI Tour Creation from Ticket Link
 * Conversational tour creation from ticket URLs
 */

import { NextResponse } from 'next/server';
import { parseTicketUrl } from '@/lib/integrations/ticket-parser';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * POST - Create tour from ticket link (called by Apollo AI)
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

    const { ticketUrl, userId, tourData, questions } = await request.json();
    
    if (!ticketUrl || !userId) {
      return NextResponse.json(
        { error: 'ticketUrl and userId required' },
        { status: 400 }
      );
    }
    
    // Parse ticket URL to get event information
    let eventInfo;
    try {
      eventInfo = await parseTicketUrl(ticketUrl);
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Failed to parse ticket URL',
          details: error.message,
          needsQuestions: true,
          questions: [
            'What is the name of the event?',
            'What is the date of the event?',
            'What city is the event in?',
            'What is the venue name?'
          ]
        },
        { status: 400 }
      );
    }
    
    // If we have incomplete data, return questions for Apollo to ask
    if (!eventInfo.name || !eventInfo.start || !eventInfo.venue?.city) {
      const missingQuestions = [];
      
      if (!eventInfo.name) missingQuestions.push('What is the name of this event or tour?');
      if (!eventInfo.start) missingQuestions.push('What is the date and time of the event?');
      if (!eventInfo.venue?.city) missingQuestions.push('What city is this event in?');
      if (!eventInfo.venue?.name) missingQuestions.push('What is the venue name?');
      if (!eventInfo.venue?.country) missingQuestions.push('What country is this event in?');
      
      return NextResponse.json({
        success: false,
        needsQuestions: true,
        eventInfo: eventInfo,
        questions: missingQuestions,
        partialData: {
          name: eventInfo.name || null,
          date: eventInfo.start || null,
          city: eventInfo.venue?.city || null,
          venue: eventInfo.venue?.name || null,
          country: eventInfo.venue?.country || null
        }
      });
    }
    
    // Get user profile to get artist name
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('artist_name, label_name, role')
      .eq('id', userId)
      .single();
    
    const artistName = userProfile?.artist_name || userProfile?.label_name || 'Artist';
    
    // Prepare tour data
    const tourName = tourData?.tourName || `${artistName} - ${eventInfo.venue?.city || 'Tour'} ${new Date(eventInfo.start).getFullYear()}`;
    const tourDescription = tourData?.description || eventInfo.description || `Tour created from ${eventInfo.platform} event`;
    
    // Create tour
    const { data: tour, error: tourError } = await supabaseAdmin
      .from('tours')
      .insert({
        user_id: userId,
        name: tourName,
        artist_name: artistName,
        description: tourDescription,
        status: 'planning',
        start_date: eventInfo.start ? new Date(eventInfo.start).toISOString().split('T')[0] : null,
        end_date: eventInfo.end ? new Date(eventInfo.end).toISOString().split('T')[0] : null,
        budget: tourData?.budget || null,
        currency: eventInfo.currency || 'GBP',
        metadata: {
          created_from_ticket: true,
          ticket_url: ticketUrl,
          platform: eventInfo.platform,
          event_id: eventInfo.eventId,
          original_event_info: eventInfo
        }
      })
      .select()
      .single();
    
    if (tourError) {
      throw new Error(`Failed to create tour: ${tourError.message}`);
    }
    
    // Create tour date from event
    const eventDate = eventInfo.start ? new Date(eventInfo.start) : null;
    const showTime = eventDate ? eventDate.toTimeString().slice(0, 5) : '20:00';
    
    const { data: tourDate, error: dateError } = await supabaseAdmin
      .from('tour_dates')
      .insert({
        tour_id: tour.id,
        date: eventDate ? eventDate.toISOString().split('T')[0] : null,
        city: eventInfo.venue?.city || null,
        state_province: eventInfo.venue?.state || null,
        country: eventInfo.venue?.country || null,
        show_time: showTime,
        status: 'pending',
        capacity: eventInfo.capacity || null,
        eventbrite_event_id: eventInfo.platform === 'eventbrite' ? eventInfo.eventId : null,
        eventbrite_url: eventInfo.platform === 'eventbrite' ? eventInfo.url : null,
        metadata: {
          created_from_ticket: true,
          ticket_url: ticketUrl,
          platform: eventInfo.platform,
          venue_info: eventInfo.venue
        }
      })
      .select()
      .single();
    
    if (dateError) {
      console.error('Failed to create tour date:', dateError);
      // Tour was created, so we'll continue
    }
    
    // If Eventbrite, sync ticket sales
    if (eventInfo.platform === 'eventbrite' && eventInfo.eventId && tourDate) {
      try {
        const syncResponse = await fetch(`${request.nextUrl.origin}/api/touring/integrations/eventbrite?action=sync&tourDateId=${tourDate.id}&eventId=${eventInfo.eventId}`, {
          method: 'GET'
        });
        
        if (syncResponse.ok) {
          console.log('Eventbrite event synced successfully');
        }
      } catch (syncError) {
        console.error('Failed to sync Eventbrite:', syncError);
        // Non-critical error, continue
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
      tourDate: tourDate ? {
        id: tourDate.id,
        date: tourDate.date,
        city: tourDate.city,
        country: tourDate.country
      } : null,
      eventInfo: {
        name: eventInfo.name,
        date: eventInfo.start,
        venue: eventInfo.venue?.name,
        city: eventInfo.venue?.city,
        platform: eventInfo.platform
      },
      message: `Successfully created tour "${tour.name}" with ${tourDate ? '1 date' : 'no dates'} from ${eventInfo.platform} event.`
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create tour from ticket error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create tour from ticket link',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Preview event info from ticket URL (for Apollo to ask questions)
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
    const ticketUrl = searchParams.get('ticketUrl');
    
    if (!ticketUrl) {
      return NextResponse.json(
        { error: 'ticketUrl required' },
        { status: 400 }
      );
    }
    
    // Parse ticket URL
    const eventInfo = await parseTicketUrl(ticketUrl);
    
    // Determine what questions Apollo should ask
    const questions = [];
    const missingFields = [];
    
    if (!eventInfo.name) {
      questions.push('What is the name of this event or tour?');
      missingFields.push('name');
    }
    if (!eventInfo.start) {
      questions.push('What is the date and time of the event?');
      missingFields.push('date');
    }
    if (!eventInfo.venue?.city) {
      questions.push('What city is this event in?');
      missingFields.push('city');
    }
    if (!eventInfo.venue?.name) {
      questions.push('What is the venue name?');
      missingFields.push('venue');
    }
    if (!eventInfo.venue?.country) {
      questions.push('What country is this event in?');
      missingFields.push('country');
    }
    
    return NextResponse.json({
      success: true,
      eventInfo: {
        name: eventInfo.name || null,
        description: eventInfo.description || null,
        date: eventInfo.start || null,
        venue: {
          name: eventInfo.venue?.name || null,
          city: eventInfo.venue?.city || null,
          country: eventInfo.venue?.country || null,
          address: eventInfo.venue?.address || null
        },
        platform: eventInfo.platform,
        url: eventInfo.url || ticketUrl
      },
      needsQuestions: questions.length > 0,
      questions: questions,
      missingFields: missingFields
    });
    
  } catch (error) {
    console.error('Preview ticket URL error:', error);
    return NextResponse.json(
      {
        error: 'Failed to parse ticket URL',
        details: error.message,
        needsQuestions: true,
        questions: [
          'What is the name of the event?',
          'What is the date of the event?',
          'What city is the event in?',
          'What is the venue name?',
          'What country is the event in?'
        ]
      },
      { status: 500 }
    );
  }
}

