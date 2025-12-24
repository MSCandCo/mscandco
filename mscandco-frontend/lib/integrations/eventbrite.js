/**
 * Eventbrite API Integration
 * 
 * API Documentation: https://www.eventbrite.com/platform/api/
 * Base URL: https://www.eventbriteapi.com/v3/
 * Authentication: OAuth 2.0 Bearer Token
 */

const EVENTBRITE_OAUTH_TOKEN = process.env.EVENTBRITE_OAUTH_TOKEN;
const EVENTBRITE_BASE_URL = 'https://www.eventbriteapi.com/v3';

/**
 * Make authenticated request to Eventbrite API
 * @param {string} endpoint - API endpoint (e.g., '/users/me/')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response
 */
async function apiRequest(endpoint, options = {}) {
  if (!EVENTBRITE_OAUTH_TOKEN) {
    throw new Error('EVENTBRITE_OAUTH_TOKEN is not configured');
  }

  const url = `${EVENTBRITE_BASE_URL}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${EVENTBRITE_OAUTH_TOKEN}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Eventbrite API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Eventbrite API error:', error);
    throw error;
  }
}

/**
 * Get authenticated user info
 * @returns {Promise<Object>} User data
 */
export async function getCurrentUser() {
  return apiRequest('/users/me/');
}

/**
 * List events
 * @param {Object} params - Query parameters
 * @param {string} params.status - Event status (draft, live, started, ended, cancelled)
 * @param {string} params.order_by - Sort order (start_asc, start_desc, created_asc, created_desc)
 * @param {number} params.page_size - Results per page (default: 50, max: 100)
 * @param {string} params.continuation - Pagination token
 * @returns {Promise<Object>} Events data
 */
export async function listEvents(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.set('status', params.status);
  if (params.order_by) queryParams.set('order_by', params.order_by);
  if (params.page_size) queryParams.set('page_size', params.page_size.toString());
  if (params.continuation) queryParams.set('continuation', params.continuation);

  const queryString = queryParams.toString();
  const endpoint = `/events/${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest(endpoint);
}

/**
 * Get event details by ID
 * @param {string} eventId - Eventbrite event ID
 * @returns {Promise<Object>} Event data
 */
export async function getEventById(eventId) {
  return apiRequest(`/events/${eventId}/`);
}

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @param {Object} eventData.event - Event object
 * @param {string} eventData.event.name - Event name
 * @param {string} eventData.event.description - Event description (HTML)
 * @param {string} eventData.event.start - Start time (ISO 8601)
 * @param {string} eventData.event.end - End time (ISO 8601)
 * @param {string} eventData.event.currency - Currency code (e.g., 'GBP', 'USD')
 * @param {boolean} eventData.event.online_event - Is online event
 * @param {string} eventData.event.organizer_id - Organizer ID
 * @returns {Promise<Object>} Created event data
 */
export async function createEvent(eventData) {
  return apiRequest('/events/', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
}

/**
 * Update an event
 * @param {string} eventId - Eventbrite event ID
 * @param {Object} eventData - Updated event data
 * @returns {Promise<Object>} Updated event data
 */
export async function updateEvent(eventId, eventData) {
  return apiRequest(`/events/${eventId}/`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  });
}

/**
 * Get attendees for an event
 * @param {string} eventId - Eventbrite event ID
 * @param {Object} params - Query parameters
 * @param {number} params.page_size - Results per page
 * @param {string} params.continuation - Pagination token
 * @returns {Promise<Object>} Attendees data
 */
export async function getEventAttendees(eventId, params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page_size) queryParams.set('page_size', params.page_size.toString());
  if (params.continuation) queryParams.set('continuation', params.continuation);

  const queryString = queryParams.toString();
  const endpoint = `/events/${eventId}/attendees/${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest(endpoint);
}

/**
 * List venues
 * @param {Object} params - Query parameters
 * @param {number} params.page_size - Results per page
 * @returns {Promise<Object>} Venues data
 */
export async function listVenues(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page_size) queryParams.set('page_size', params.page_size.toString());
  if (params.continuation) queryParams.set('continuation', params.continuation);

  const queryString = queryParams.toString();
  const endpoint = `/venues/${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest(endpoint);
}

/**
 * Create a venue
 * @param {Object} venueData - Venue data
 * @param {Object} venueData.venue - Venue object
 * @param {string} venueData.venue.name - Venue name
 * @param {string} venueData.venue.address - Address object
 * @returns {Promise<Object>} Created venue data
 */
export async function createVenue(venueData) {
  return apiRequest('/venues/', {
    method: 'POST',
    body: JSON.stringify(venueData),
  });
}

/**
 * Get ticket classes for an event
 * @param {string} eventId - Eventbrite event ID
 * @returns {Promise<Object>} Ticket classes data
 */
export async function getTicketClasses(eventId) {
  return apiRequest(`/events/${eventId}/ticket_classes/`);
}

/**
 * Create a ticket class for an event
 * @param {string} eventId - Eventbrite event ID
 * @param {Object} ticketData - Ticket class data
 * @returns {Promise<Object>} Created ticket class data
 */
export async function createTicketClass(eventId, ticketData) {
  return apiRequest(`/events/${eventId}/ticket_classes/`, {
    method: 'POST',
    body: JSON.stringify(ticketData),
  });
}


