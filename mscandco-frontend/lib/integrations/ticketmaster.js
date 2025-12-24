/**
 * Ticketmaster API Integration
 * 
 * API Documentation: https://developer.ticketmaster.com/
 * Base URL: https://app.ticketmaster.com/discovery/v2/
 */

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const TICKETMASTER_BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

/**
 * Search for events
 * @param {Object} params - Search parameters
 * @param {string} params.keyword - Search keyword (artist name, event name, etc.)
 * @param {string} params.city - City name
 * @param {string} params.countryCode - ISO 3166-1 country code (e.g., 'US', 'GB')
 * @param {string} params.startDateTime - Start date (ISO 8601 format)
 * @param {string} params.endDateTime - End date (ISO 8601 format)
 * @param {number} params.size - Number of results (default: 20, max: 200)
 * @param {number} params.page - Page number (default: 0)
 * @returns {Promise<Object>} Events data
 */
export async function searchEvents(params = {}) {
  if (!TICKETMASTER_API_KEY) {
    throw new Error('TICKETMASTER_API_KEY is not configured');
  }

  const queryParams = new URLSearchParams({
    apikey: TICKETMASTER_API_KEY,
    ...params,
  });

  // Convert size and page to strings if provided
  if (params.size) queryParams.set('size', params.size.toString());
  if (params.page !== undefined) queryParams.set('page', params.page.toString());

  const url = `${TICKETMASTER_BASE_URL}/events.json?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ticketmaster API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ticketmaster API error:', error);
    throw error;
  }
}

/**
 * Get event details by ID
 * @param {string} eventId - Ticketmaster event ID
 * @returns {Promise<Object>} Event details
 */
export async function getEventById(eventId) {
  if (!TICKETMASTER_API_KEY) {
    throw new Error('TICKETMASTER_API_KEY is not configured');
  }

  const url = `${TICKETMASTER_BASE_URL}/events/${eventId}.json?apikey=${TICKETMASTER_API_KEY}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ticketmaster API error:', error);
    throw error;
  }
}

/**
 * Search for venues
 * @param {Object} params - Search parameters
 * @param {string} params.keyword - Search keyword
 * @param {string} params.city - City name
 * @param {string} params.countryCode - ISO 3166-1 country code
 * @param {number} params.size - Number of results
 * @returns {Promise<Object>} Venues data
 */
export async function searchVenues(params = {}) {
  if (!TICKETMASTER_API_KEY) {
    throw new Error('TICKETMASTER_API_KEY is not configured');
  }

  const queryParams = new URLSearchParams({
    apikey: TICKETMASTER_API_KEY,
    ...params,
  });

  if (params.size) queryParams.set('size', params.size.toString());

  const url = `${TICKETMASTER_BASE_URL}/venues.json?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ticketmaster API error:', error);
    throw error;
  }
}

/**
 * Search for attractions (artists)
 * @param {Object} params - Search parameters
 * @param {string} params.keyword - Artist name or keyword
 * @param {string} params.classificationName - Classification (e.g., 'music', 'sports')
 * @param {number} params.size - Number of results
 * @returns {Promise<Object>} Attractions data
 */
export async function searchAttractions(params = {}) {
  if (!TICKETMASTER_API_KEY) {
    throw new Error('TICKETMASTER_API_KEY is not configured');
  }

  const queryParams = new URLSearchParams({
    apikey: TICKETMASTER_API_KEY,
    ...params,
  });

  if (params.size) queryParams.set('size', params.size.toString());

  const url = `${TICKETMASTER_BASE_URL}/attractions.json?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ticketmaster API error:', error);
    throw error;
  }
}

/**
 * Get events for a specific artist/attraction
 * @param {string} attractionId - Ticketmaster attraction ID
 * @param {Object} params - Additional parameters
 * @returns {Promise<Object>} Events data
 */
export async function getEventsByAttraction(attractionId, params = {}) {
  if (!TICKETMASTER_API_KEY) {
    throw new Error('TICKETMASTER_API_KEY is not configured');
  }

  const queryParams = new URLSearchParams({
    apikey: TICKETMASTER_API_KEY,
    ...params,
  });

  if (params.size) queryParams.set('size', params.size.toString());

  const url = `${TICKETMASTER_BASE_URL}/attractions/${attractionId}/events.json?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ticketmaster API error:', error);
    throw error;
  }
}


