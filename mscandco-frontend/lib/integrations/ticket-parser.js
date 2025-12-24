/**
 * Ticket Link Parser
 * Extracts event information from various ticket platform URLs
 */

/**
 * Parse ticket URL and extract event information
 * Supports: Eventbrite, Ticketmaster, Bandsintown, Songkick, etc.
 */
export async function parseTicketUrl(url) {
  try {
    // Extract event ID from URL
    const eventbriteMatch = url.match(/eventbrite\.(?:com|co\.uk)\/e\/([^\/\?]+)/i);
    const ticketmasterMatch = url.match(/ticketmaster\.(?:com|co\.uk)\/event\/([^\/\?]+)/i);
    const bandsintownMatch = url.match(/bandsintown\.com\/e\/([^\/\?]+)/i);
    const songkickMatch = url.match(/songkick\.com\/concerts\/(\d+)/i);
    
    if (eventbriteMatch) {
      return await parseEventbriteUrl(url, eventbriteMatch[1]);
    } else if (ticketmasterMatch) {
      return await parseTicketmasterUrl(url, ticketmasterMatch[1]);
    } else if (bandsintownMatch) {
      return await parseBandsintownUrl(url, bandsintownMatch[1]);
    } else if (songkickMatch) {
      return await parseSongkickUrl(url, songkickMatch[1]);
    } else {
      // Try to fetch and parse generic event page
      return await parseGenericEventUrl(url);
    }
  } catch (error) {
    console.error('Error parsing ticket URL:', error);
    throw new Error(`Failed to parse ticket URL: ${error.message}`);
  }
}

/**
 * Parse Eventbrite URL
 */
async function parseEventbriteUrl(url, eventId) {
  const { getEventById } = await import('./eventbrite');
  
  try {
    const event = await getEventById(eventId);
    
    return {
      platform: 'eventbrite',
      eventId: event.id,
      url: event.url,
      name: event.name?.text || event.name,
      description: event.description?.text || event.description?.html || '',
      start: event.start?.utc || event.start?.local,
      end: event.end?.utc || event.end?.local,
      timezone: event.start?.timezone || 'UTC',
      venue: {
        name: event.venue?.name,
        address: event.venue?.address?.localized_area_display || '',
        city: event.venue?.address?.city || '',
        country: event.venue?.address?.country || '',
        latitude: event.venue?.latitude,
        longitude: event.venue?.longitude
      },
      capacity: event.capacity,
      currency: event.currency,
      ticketClasses: event.ticket_classes || [],
      organizer: event.organizer?.name
    };
  } catch (error) {
    throw new Error(`Failed to fetch Eventbrite event: ${error.message}`);
  }
}

/**
 * Parse Ticketmaster URL (placeholder - would need API integration)
 */
async function parseTicketmasterUrl(url, eventId) {
  // Ticketmaster API would go here
  // For now, return basic structure
  return {
    platform: 'ticketmaster',
    eventId: eventId,
    url: url,
    name: 'Event from Ticketmaster',
    description: '',
    start: null,
    end: null,
    venue: {
      name: '',
      city: '',
      country: ''
    }
  };
}

/**
 * Parse Bandsintown URL (placeholder)
 */
async function parseBandsintownUrl(url, eventId) {
  return {
    platform: 'bandsintown',
    eventId: eventId,
    url: url,
    name: 'Event from Bandsintown',
    description: '',
    start: null,
    end: null,
    venue: {
      name: '',
      city: '',
      country: ''
    }
  };
}

/**
 * Parse Songkick URL (placeholder)
 */
async function parseSongkickUrl(url, eventId) {
  return {
    platform: 'songkick',
    eventId: eventId,
    url: url,
    name: 'Event from Songkick',
    description: '',
    start: null,
    end: null,
    venue: {
      name: '',
      city: '',
      country: ''
    }
  };
}

/**
 * Parse generic event URL by fetching and scraping
 */
async function parseGenericEventUrl(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ApolloBot/1.0; +https://mscandco.com)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Basic HTML parsing to extract event info
    // This is a simplified version - could use cheerio or similar for better parsing
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    
    return {
      platform: 'generic',
      url: url,
      name: titleMatch ? titleMatch[1] : 'Event',
      description: metaDescMatch ? metaDescMatch[1] : '',
      start: null,
      end: null,
      venue: {
        name: '',
        city: '',
        country: ''
      }
    };
  } catch (error) {
    throw new Error(`Failed to parse generic URL: ${error.message}`);
  }
}

