import { NextResponse } from 'next/server';
import { eventricClient } from '@/lib/eventric/client';

/**
 * Apollo → Eventric API Bridge
 *
 * This endpoint allows Apollo to access Eventric tour management features
 * through a unified interface
 */

export async function POST(request) {
  try {
    const { action, params } = await request.json();

    // Validate action
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    let result;

    // Route to appropriate Eventric API method
    switch (action) {
      // ==================== TOUR MANAGEMENT ====================
      case 'getTours':
        result = await eventricClient.getTours();
        break;

      case 'getTour':
        if (!params?.tourId) {
          return NextResponse.json(
            { success: false, error: 'tourId is required' },
            { status: 400 }
          );
        }
        result = await eventricClient.getTour(params.tourId);
        break;

      case 'getTourCrew':
        if (!params?.tourId) {
          return NextResponse.json(
            { success: false, error: 'tourId is required' },
            { status: 400 }
          );
        }
        result = await eventricClient.getTourCrew(params.tourId);
        break;

      case 'getDailySummary':
        if (!params?.tourId || !params?.date) {
          return NextResponse.json(
            { success: false, error: 'tourId and date are required' },
            { status: 400 }
          );
        }
        result = await eventricClient.getDailySummary(params.tourId, params.date);
        break;

      case 'getTourOverview':
        if (!params?.tourId) {
          return NextResponse.json(
            { success: false, error: 'tourId is required' },
            { status: 400 }
          );
        }
        result = await eventricClient.getTourOverview(params.tourId);
        break;

      // ==================== DAY MANAGEMENT ====================
      case 'getDay':
        if (!params?.dayId) {
          return NextResponse.json(
            { success: false, error: 'dayId is required' },
            { status: 400 }
          );
        }
        result = await eventricClient.getDay(params.dayId);
        break;

      case 'getDayOverview':
        if (!params?.dayId) {
          return NextResponse.json(
            { success: false, error: 'dayId is required' },
            { status: 400 }
          );
        }
        result = await eventricClient.getDayOverview(params.dayId);
        break;

      case 'updateDayNotes':
        if (!params?.dayId || !params?.notes) {
          return NextResponse.json(
            { success: false, error: 'dayId and notes are required' },
            { status: 400 }
          );
        }
        result = await eventricClient.updateDayNotes(params.dayId, params.notes);
        break;

      // ==================== ITINERARY MANAGEMENT ====================
      case 'createItineraryItem':
        if (!params?.itemData) {
          return NextResponse.json(
            { success: false, error: 'itemData is required' },
            { status: 400 }
          );
        }
        result = await eventricClient.createItineraryItem(params.itemData);
        break;

      case 'updateItineraryItem':
        if (!params?.itemId || !params?.itemData) {
          return NextResponse.json(
            { success: false, error: 'itemId and itemData are required' },
            { status: 400 }
          );
        }
        result = await eventricClient.updateItineraryItem(params.itemId, params.itemData);
        break;

      case 'deleteItineraryItem':
        if (!params?.itemId) {
          return NextResponse.json(
            { success: false, error: 'itemId is required' },
            { status: 400 }
          );
        }
        result = await eventricClient.deleteItineraryItem(params.itemId);
        break;

      // ==================== EVENT MANAGEMENT ====================
      case 'getDayEvents':
        if (!params?.dayId) {
          return NextResponse.json(
            { success: false, error: 'dayId is required' },
            { status: 400 }
          );
        }
        result = await eventricClient.getDayEvents(params.dayId);
        break;

      case 'getEventSetlist':
        if (!params?.eventId) {
          return NextResponse.json(
            { success: false, error: 'eventId is required' },
            { status: 400 }
          );
        }
        result = await eventricClient.getEventSetlist(params.eventId);
        break;

      // ==================== HOTEL MANAGEMENT ====================
      case 'getDayHotels':
        if (!params?.dayId) {
          return NextResponse.json(
            { success: false, error: 'dayId is required' },
            { status: 400 }
          );
        }
        result = await eventricClient.getDayHotels(params.dayId);
        break;

      case 'getHotelContacts':
        if (!params?.hotelId) {
          return NextResponse.json(
            { success: false, error: 'hotelId is required' },
            { status: 400 }
          );
        }
        result = await eventricClient.getHotelContacts(params.hotelId);
        break;

      case 'getHotelRoomList':
        if (!params?.hotelId) {
          return NextResponse.json(
            { success: false, error: 'hotelId is required' },
            { status: 400 }
          );
        }
        result = await eventricClient.getHotelRoomList(params.hotelId);
        break;

      // ==================== GUEST LIST MANAGEMENT ====================
      case 'getEventGuestList':
        if (!params?.eventId) {
          return NextResponse.json(
            { success: false, error: 'eventId is required' },
            { status: 400 }
          );
        }
        result = await eventricClient.getEventGuestList(params.eventId);
        break;

      case 'createGuestListRequest':
        if (!params?.guestData) {
          return NextResponse.json(
            { success: false, error: 'guestData is required' },
            { status: 400 }
          );
        }
        result = await eventricClient.createGuestListRequest(params.guestData);
        break;

      case 'updateGuestListRequest':
        if (!params?.guestListId || !params?.guestData) {
          return NextResponse.json(
            { success: false, error: 'guestListId and guestData are required' },
            { status: 400 }
          );
        }
        result = await eventricClient.updateGuestListRequest(params.guestListId, params.guestData);
        break;

      // ==================== PUSH NOTIFICATIONS ====================
      case 'getPushHistory':
        result = await eventricClient.getPushHistory();
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      data: result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Apollo Eventric API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to execute Eventric action',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET method for simple queries
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    // Only allow read-only actions via GET
    const allowedActions = ['getTours', 'getTour', 'getTourCrew', 'getDay', 'getDayEvents', 'getDayHotels'];

    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'This action requires POST method' },
        { status: 405 }
      );
    }

    // For simple GET requests, extract params from query string
    const params = {};
    searchParams.forEach((value, key) => {
      if (key !== 'action') {
        params[key] = value;
      }
    });

    // Forward to POST handler
    return POST({
      json: async () => ({ action, params })
    });

  } catch (error) {
    console.error('Apollo Eventric GET error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to execute Eventric action',
      },
      { status: 500 }
    );
  }
}
