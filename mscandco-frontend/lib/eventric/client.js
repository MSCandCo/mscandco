/**
 * 🎸 EVENTRIC API CLIENT
 *
 * Tour Management & Live Event Scheduling API Integration
 * Documentation: https://my.eventric.com/portal/apidocs
 *
 * This client provides access to Eventric's tour management features:
 * - Tour scheduling and itinerary management
 * - Event coordination and logistics
 * - Hotel and accommodation booking
 * - Guest list management
 * - Crew and personnel management
 */

import crypto from 'crypto';

class EventricClient {
  constructor() {
    // Eventric credentials should be stored in environment variables
    this.baseUrl = process.env.EVENTRIC_API_URL || 'https://my.eventric.com/api/v5';

    // OAuth credentials from Eventric portal/support
    const apiKey = process.env.EVENTRIC_API_KEY;
    const apiSecret = process.env.EVENTRIC_API_SECRET;

    // Use the API key/secret as OAuth credentials
    this.consumerKey = apiKey;
    this.consumerSecret = apiSecret;
    this.accessToken = apiKey; // Use same key as token
    this.accessTokenSecret = apiSecret; // Use same secret
  }

  /**
   * Generate OAuth 1.0 signature for API requests
   */
  generateOAuthSignature(method, url, params = {}) {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomBytes(16).toString('hex');

    // Eventric uses single key/secret, no oauth_token
    const oauthParams = {
      oauth_consumer_key: this.consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_version: '1.0',
    };

    // Combine OAuth and request params
    const allParams = { ...oauthParams, ...params };

    // Create parameter string
    const paramString = Object.keys(allParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');

    // Create signature base string
    const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;

    // Create signing key (no token secret for single-key auth)
    const signingKey = `${encodeURIComponent(this.consumerSecret)}&`;

    // Generate signature
    const signature = crypto
      .createHmac('sha1', signingKey)
      .update(baseString)
      .digest('base64');

    oauthParams.oauth_signature = signature;

    return oauthParams;
  }

  /**
   * Make authenticated API request
   */
  async request(method, endpoint, params = {}, body = null) {
    try {
      // Verify we have OAuth credentials
      if (!this.accessToken || !this.consumerKey) {
        throw new Error('Eventric API credentials not configured. Please set EVENTRIC_API_KEY and EVENTRIC_API_SECRET in .env.local');
      }

      // Add version parameter to avoid 426 errors
      const allParams = { ...params, version: '7' };

      const url = `${this.baseUrl}${endpoint}`;
      const oauthParams = this.generateOAuthSignature(method, url, allParams);

      // Build Authorization header
      const authHeader = 'OAuth ' + Object.keys(oauthParams)
        .map(key => `${key}="${encodeURIComponent(oauthParams[key])}"`)
        .join(', ');

      const options = {
        method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      // Add query params to URL if GET request
      const queryString = method === 'GET' && Object.keys(allParams).length > 0
        ? '?' + new URLSearchParams(allParams).toString()
        : '';

      const response = await fetch(`${url}${queryString}`, options);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Eventric API Error Details:`);
        console.error(`  URL: ${url}${queryString}`);
        console.error(`  Method: ${method}`);
        console.error(`  Status: ${response.status} ${response.statusText}`);
        console.error(`  Response: ${errorText}`);
        throw new Error(`Eventric API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Eventric API request failed:', error);
      throw error;
    }
  }


  // ==================== TOUR MANAGEMENT ====================

  /**
   * Get all accessible tours
   */
  async getTours() {
    return this.request('GET', '/tours');
  }

  /**
   * Get specific tour details with dates
   */
  async getTour(tourId) {
    return this.request('GET', `/tour/${tourId}`);
  }

  /**
   * Get tour crew/personnel
   */
  async getTourCrew(tourId) {
    return this.request('GET', `/tour/${tourId}/crew`);
  }

  /**
   * Get daily tour summary
   */
  async getDailySummary(tourId, date) {
    // Date format: YYYY-MM-DD
    return this.request('GET', `/tour/${tourId}/summary/${date}`);
  }

  // ==================== DAY MANAGEMENT ====================

  /**
   * Get specific day details
   */
  async getDay(dayId) {
    return this.request('GET', `/day/${dayId}`);
  }

  /**
   * Update day notes
   */
  async updateDayNotes(dayId, notes) {
    return this.request('PUT', `/day/${dayId}`, {}, { notes });
  }

  // ==================== ITINERARY MANAGEMENT ====================

  /**
   * Create schedule/itinerary item
   */
  async createItineraryItem(itemData) {
    return this.request('POST', '/itinerary', {}, itemData);
  }

  /**
   * Update itinerary item
   */
  async updateItineraryItem(itemId, itemData) {
    return this.request('PUT', `/itinerary/${itemId}`, {}, itemData);
  }

  /**
   * Delete itinerary item
   */
  async deleteItineraryItem(itemId) {
    return this.request('DELETE', `/itinerary/${itemId}`);
  }

  // ==================== EVENT MANAGEMENT ====================

  /**
   * Get events for a specific day
   */
  async getDayEvents(dayId) {
    return this.request('GET', `/day/${dayId}/events`);
  }

  /**
   * Get event setlist
   */
  async getEventSetlist(eventId) {
    return this.request('GET', `/event/${eventId}/setlist`);
  }

  // ==================== HOTEL MANAGEMENT ====================

  /**
   * Get hotels for a specific day
   */
  async getDayHotels(dayId) {
    return this.request('GET', `/day/${dayId}/hotels`);
  }

  /**
   * Get hotel contacts
   */
  async getHotelContacts(hotelId) {
    return this.request('GET', `/hotel/${hotelId}/contacts`);
  }

  /**
   * Get hotel room list
   */
  async getHotelRoomList(hotelId) {
    return this.request('GET', `/hotel/${hotelId}/roomlist`);
  }

  // ==================== GUEST LIST MANAGEMENT ====================

  /**
   * Get event guest list
   */
  async getEventGuestList(eventId) {
    return this.request('GET', `/event/${eventId}/guestlist`);
  }

  /**
   * Create guest list request
   */
  async createGuestListRequest(guestData) {
    return this.request('POST', '/guestlist', {}, guestData);
  }

  /**
   * Update guest list request
   */
  async updateGuestListRequest(guestListId, guestData) {
    return this.request('PUT', `/guestlist/${guestListId}`, {}, guestData);
  }

  // ==================== PUSH NOTIFICATIONS ====================

  /**
   * Get push notification history
   */
  async getPushHistory() {
    return this.request('GET', '/push/history');
  }

  // ==================== APOLLO HELPER METHODS ====================

  /**
   * Get complete tour overview for Apollo
   */
  async getTourOverview(tourId) {
    const [tour, crew] = await Promise.all([
      this.getTour(tourId),
      this.getTourCrew(tourId),
    ]);

    return {
      tour,
      crew,
      insights: this.generateTourInsights(tour, crew),
    };
  }

  /**
   * Get complete day overview for Apollo
   */
  async getDayOverview(dayId) {
    const [day, events, hotels] = await Promise.all([
      this.getDay(dayId),
      this.getDayEvents(dayId),
      this.getDayHotels(dayId),
    ]);

    return {
      day,
      events,
      hotels,
      insights: this.generateDayInsights(day, events, hotels),
    };
  }

  /**
   * Generate AI insights for tour data
   */
  generateTourInsights(tour, crew) {
    return {
      totalDays: tour.days?.length || 0,
      totalCrew: crew?.length || 0,
      startDate: tour.start_date,
      endDate: tour.end_date,
      status: tour.status || 'active',
    };
  }

  /**
   * Generate AI insights for day data
   */
  generateDayInsights(day, events, hotels) {
    return {
      totalEvents: events?.length || 0,
      totalHotels: hotels?.length || 0,
      date: day.date,
      location: day.location,
      hasLoadIn: events?.some(e => e.type === 'load_in'),
      hasSoundcheck: events?.some(e => e.type === 'soundcheck'),
      hasShow: events?.some(e => e.type === 'show'),
    };
  }
}

// Export singleton
export const eventricClient = new EventricClient();

export default eventricClient;
