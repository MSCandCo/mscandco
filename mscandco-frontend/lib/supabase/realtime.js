/**
 * Supabase Real-time Sync Utilities
 * Enables live updates for touring platform features
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Subscribe to real-time changes on a table
 * @param {string} table - Table name to subscribe to
 * @param {Function} callback - Callback function to handle changes
 * @param {Object} filter - Optional filter (e.g., { column: 'tour_id', value: '123' })
 * @returns {Object} Subscription object with unsubscribe method
 */
export function subscribeToTable(table, callback, filter = null) {
  const supabase = createClient();

  let channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        ...(filter && { filter: `${filter.column}=eq.${filter.value}` })
      },
      (payload) => {
        console.log(`[Real-time] ${table} change:`, payload);
        callback(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
}

/**
 * Subscribe to tour-related changes
 * @param {string} tourId - Tour ID to filter by
 * @param {Object} callbacks - Callbacks for different tables
 * @returns {Object} Subscription object with unsubscribe method
 */
export function subscribeToTour(tourId, callbacks = {}) {
  const subscriptions = [];

  // Subscribe to tour updates
  if (callbacks.onTourUpdate) {
    subscriptions.push(
      subscribeToTable('tours', callbacks.onTourUpdate, { column: 'id', value: tourId })
    );
  }

  // Subscribe to tour dates
  if (callbacks.onTourDatesChange) {
    subscriptions.push(
      subscribeToTable('tour_dates', callbacks.onTourDatesChange, { column: 'tour_id', value: tourId })
    );
  }

  // Subscribe to contacts
  if (callbacks.onContactsChange) {
    subscriptions.push(
      subscribeToTable('tour_contacts', callbacks.onContactsChange, { column: 'tour_id', value: tourId })
    );
  }

  // Subscribe to day sheets
  if (callbacks.onDaySheetsChange) {
    subscriptions.push(
      subscribeToTable('tour_day_sheets', (payload) => {
        // Day sheets are filtered by tour_date_id, need to check if it belongs to this tour
        callbacks.onDaySheetsChange(payload);
      })
    );
  }

  // Subscribe to technical docs
  if (callbacks.onTechnicalDocsChange) {
    subscriptions.push(
      subscribeToTable('tour_technical_docs', callbacks.onTechnicalDocsChange, { column: 'tour_id', value: tourId })
    );
  }

  // Subscribe to production requirements
  if (callbacks.onProductionReqsChange) {
    subscriptions.push(
      subscribeToTable('tour_production_requirements', callbacks.onProductionReqsChange, { column: 'tour_id', value: tourId })
    );
  }

  // Subscribe to merchandise
  if (callbacks.onMerchandiseChange) {
    subscriptions.push(
      subscribeToTable('tour_merchandise', callbacks.onMerchandiseChange, { column: 'tour_id', value: tourId })
    );
  }

  // Subscribe to merchandise sales
  if (callbacks.onMerchandiseSalesChange) {
    subscriptions.push(
      subscribeToTable('tour_merchandise_sales', callbacks.onMerchandiseSalesChange)
    );
  }

  return {
    unsubscribe: () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    }
  };
}

/**
 * Helper to handle real-time payload and update state
 * @param {Object} payload - Real-time payload from Supabase
 * @param {Array} currentData - Current state array
 * @param {Function} setState - State setter function
 */
export function handleRealtimeUpdate(payload, currentData, setState) {
  switch (payload.eventType) {
    case 'INSERT':
      setState([...currentData, payload.new]);
      break;
    case 'UPDATE':
      setState(currentData.map(item =>
        item.id === payload.new.id ? payload.new : item
      ));
      break;
    case 'DELETE':
      setState(currentData.filter(item => item.id !== payload.old.id));
      break;
    default:
      console.log('[Real-time] Unknown event type:', payload.eventType);
  }
}

/**
 * React hook for subscribing to real-time updates
 * Usage:
 *
 * import { useRealtimeSubscription } from '@/lib/supabase/realtime';
 *
 * const [data, setData] = useState([]);
 *
 * useRealtimeSubscription('tour_contacts',
 *   (payload) => handleRealtimeUpdate(payload, data, setData),
 *   { column: 'tour_id', value: tourId }
 * );
 */
export function useRealtimeSubscription(table, callback, filter = null, dependencies = []) {
  if (typeof window === 'undefined') return; // Skip on server

  const { useEffect } = require('react');

  useEffect(() => {
    const subscription = subscribeToTable(table, callback, filter);

    return () => {
      subscription.unsubscribe();
    };
  }, [table, ...(dependencies || [])]);
}
