/**
 * Touring Platform - Calendar Export
 * iCal export for Google Calendar, Apple Calendar, Outlook
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'


/**
 * GET - Export tour dates as iCal
 */
export async function GET(request) {
  try {
    // Lazy load Supabase client
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = await createServiceRoleClient();

    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tourId');
    const tourDateId = searchParams.get('tourDateId');
    
    if (!tourId && !tourDateId) {
      return NextResponse.json(
        { error: 'tourId or tourDateId required' },
        { status: 400 }
      );
    }
    
    let tourDates = [];
    
    if (tourDateId) {
      // Single date
      const { data: date } = await supabaseAdmin
        .from('tour_dates')
        .select('*, tours(*)')
        .eq('id', tourDateId)
        .single();
      
      if (date) tourDates = [date];
    } else {
      // All dates for tour
      const { data: dates } = await supabaseAdmin
        .from('tour_dates')
        .select('*, tours(*)')
        .eq('tour_id', tourId)
        .order('date', { ascending: true });
      
      tourDates = dates || [];
    }
    
    if (tourDates.length === 0) {
      return NextResponse.json(
        { error: 'No tour dates found' },
        { status: 404 }
      );
    }
    
    // Generate iCal content
    const ical = generateICal(tourDates);
    
    return new NextResponse(ical, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="tour-dates.ics"`
      }
    });
    
  } catch (error) {
    console.error('Calendar export error:', error);
    return NextResponse.json(
      { error: 'Failed to export calendar', details: error.message },
      { status: 500 }
    );
  }
}

function generateICal(tourDates) {
  const now = new Date();
  const uid = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@mscandco.com`;
  
  let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//MSC & Co//Touring Platform//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;
  
  tourDates.forEach(tourDate => {
    const tour = tourDate.tours;
    const date = new Date(tourDate.date);
    
    // Set start time
    let startDateTime = date;
    if (tourDate.show_time) {
      const [hours, minutes] = tourDate.show_time.split(':');
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
    } else {
      startDateTime.setHours(20, 0, 0); // Default 8 PM
    }
    
    // Set end time (default 3 hours after start)
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + 3);
    
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const summary = `${tour?.artist_name || 'Artist'} - ${tourDate.city || 'Show'}`;
    const description = [
      `Tour: ${tour?.name || 'Tour'}`,
      `Venue: ${tourDate.venues?.name || tourDate.city || 'TBA'}`,
      tourDate.doors_time ? `Doors: ${tourDate.doors_time}` : '',
      tourDate.show_time ? `Show: ${tourDate.show_time}` : '',
      tourDate.capacity ? `Capacity: ${tourDate.capacity}` : '',
      tourDate.notes ? `Notes: ${tourDate.notes}` : ''
    ].filter(Boolean).join('\\n');
    
    const location = [
      tourDate.venues?.name || '',
      tourDate.city || '',
      tourDate.country || ''
    ].filter(Boolean).join(', ');
    
    ical += `BEGIN:VEVENT
UID:${uid()}
DTSTAMP:${formatDate(now)}
DTSTART:${formatDate(startDateTime)}
DTEND:${formatDate(endDateTime)}
SUMMARY:${summary}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${location}
STATUS:CONFIRMED
`;
    
    if (tourDate.eventbrite_url) {
      ical += `URL:${tourDate.eventbrite_url}\n`;
    }
    
    ical += `END:VEVENT
`;
  });
  
  ical += `END:VCALENDAR`;
  
  return ical;
}

