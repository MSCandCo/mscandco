import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      event_name,
      venue_name,
      venue_address,
      city,
      country,
      event_date,
      doors_time,
      show_time,
      ticket_tiers = [],
      use_ticketmaster = false,
      use_eventbrite = false,
      external_ticket_url,
    } = await request.json();

    if (!event_name || !venue_name || !city || !event_date) {
      return NextResponse.json({
        error: 'event_name, venue_name, city, and event_date required',
      }, { status: 400 });
    }

    // Create performance record
    const { data: performance, error: perfError } = await supabase
      .from('live_performances')
      .insert({
        user_id: user.id,
        event_name,
        venue_name,
        venue_address,
        city,
        country: country || 'United Kingdom',
        event_date,
        doors_time,
        show_time,
        status: 'upcoming',
        ticket_tiers,
        external_ticket_url,
      })
      .select()
      .single();

    if (perfError) throw perfError;

    // Capture baseline metrics (14 days before show)
    const baselineMetrics = await captureBaselineMetrics(user.id, city, supabase);

    await supabase
      .from('performance_metrics')
      .insert({
        performance_id: performance.id,
        user_id: user.id,
        metric_type: 'baseline',
        streams_count: baselineMetrics.streams,
        followers_count: baselineMetrics.followers,
        playlist_adds: baselineMetrics.playlist_adds,
        captured_at: new Date().toISOString(),
      });

    // Create Ticketmaster event if requested
    if (use_ticketmaster && process.env.TICKETMASTER_API_KEY) {
      try {
        const tmEvent = await createTicketmasterEvent(performance);

        await supabase
          .from('live_performances')
          .update({
            ticketmaster_event_id: tmEvent.id,
            ticketmaster_url: tmEvent.url,
          })
          .eq('id', performance.id);
      } catch (tmError) {
        console.error('Ticketmaster creation failed:', tmError);
        // Continue even if Ticketmaster fails
      }
    }

    // Create Eventbrite event if requested
    if (use_eventbrite && process.env.EVENTBRITE_API_KEY) {
      try {
        const ebEvent = await createEventbriteEvent(performance);

        await supabase
          .from('live_performances')
          .update({
            eventbrite_event_id: ebEvent.id,
            eventbrite_url: ebEvent.url,
          })
          .eq('id', performance.id);
      } catch (ebError) {
        console.error('Eventbrite creation failed:', ebError);
      }
    }

    return NextResponse.json({
      success: true,
      performance,
      baseline_metrics: baselineMetrics,
    });

  } catch (error) {
    console.error('Create performance error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function captureBaselineMetrics(userId, city, supabase) {
  // Get user's current streaming stats
  const { data: artist } = await supabase
    .from('user_profiles')
    .select('spotify_stats, apple_music_stats')
    .eq('id', userId)
    .single();

  const spotifyStats = artist?.spotify_stats || {};

  // Get city-specific metrics if available
  const { data: cityMetrics } = await supabase
    .from('geographic_metrics')
    .select('*')
    .eq('user_id', userId)
    .eq('city', city)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return {
    streams: spotifyStats.monthly_listeners || 0,
    followers: spotifyStats.followers || 0,
    playlist_adds: spotifyStats.playlist_reach || 0,
    city_specific_streams: cityMetrics?.monthly_streams || 0,
  };
}

async function createTicketmasterEvent(performance) {
  // Ticketmaster API integration
  const response = await fetch(
    'https://app.ticketmaster.com/discovery-commerce/v2/events',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TICKETMASTER_API_KEY}`,
      },
      body: JSON.stringify({
        name: performance.event_name,
        date: {
          start: {
            localDate: performance.event_date.split('T')[0],
            localTime: performance.show_time || '20:00:00',
          },
        },
        venue: {
          name: performance.venue_name,
          address: {
            line1: performance.venue_address,
          },
          city: {
            name: performance.city,
          },
          country: {
            name: performance.country,
            countryCode: performance.country === 'United Kingdom' ? 'GB' : 'US',
          },
        },
        classifications: [
          {
            segment: { name: 'Music' },
            genre: { name: 'Rock' }, // Would be dynamic based on artist genre
          },
        ],
        priceRanges: performance.ticket_tiers.map(tier => ({
          type: tier.name,
          currency: 'GBP',
          min: tier.price,
          max: tier.price,
        })),
      }),
    }
  );

  const data = await response.json();

  if (!data.id) {
    throw new Error('Failed to create Ticketmaster event');
  }

  return {
    id: data.id,
    url: data._links?.self?.href || data.url,
  };
}

async function createEventbriteEvent(performance) {
  // Eventbrite API integration
  const response = await fetch('https://www.eventbriteapi.com/v3/events/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.EVENTBRITE_API_KEY}`,
    },
    body: JSON.stringify({
      event: {
        name: {
          html: performance.event_name,
        },
        start: {
          timezone: 'Europe/London',
          utc: new Date(performance.event_date).toISOString(),
        },
        end: {
          timezone: 'Europe/London',
          utc: new Date(
            new Date(performance.event_date).getTime() + 3 * 60 * 60 * 1000
          ).toISOString(), // +3 hours
        },
        currency: 'GBP',
      },
      venue: {
        name: performance.venue_name,
        address: {
          address_1: performance.venue_address,
          city: performance.city,
          country: performance.country === 'United Kingdom' ? 'GB' : 'US',
        },
      },
    }),
  });

  const data = await response.json();

  if (!data.id) {
    throw new Error('Failed to create Eventbrite event');
  }

  // Create ticket classes
  for (const tier of performance.ticket_tiers) {
    await fetch(
      `https://www.eventbriteapi.com/v3/events/${data.id}/ticket_classes/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EVENTBRITE_API_KEY}`,
        },
        body: JSON.stringify({
          ticket_class: {
            name: tier.name,
            quantity_total: tier.quantity,
            cost: {
              currency: 'GBP',
              value: tier.price * 100, // Convert to cents
            },
          },
        }),
      }
    );
  }

  return {
    id: data.id,
    url: data.url,
  };
}

// GET endpoint for performances
export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 50;

    let query = supabase
      .from('live_performances')
      .select('*')
      .eq('user_id', user.id)
      .order('event_date', { ascending: true })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: performances, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, performances });

  } catch (error) {
    console.error('Get performances error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
