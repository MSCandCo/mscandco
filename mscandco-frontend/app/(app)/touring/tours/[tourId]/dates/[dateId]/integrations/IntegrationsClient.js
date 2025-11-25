'use client';

/**
 * Touring Platform - External Integrations
 * Connect Eventbrite, sync ticket sales, manage Revolut payments
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Link2, RefreshCw, CheckCircle, XCircle, DollarSign, Users } from 'lucide-react';

export default function IntegrationsClient({ tourId, dateId, userId }) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [eventbriteConnected, setEventbriteConnected] = useState(false);
  const [eventbriteEvent, setEventbriteEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [ticketSales, setTicketSales] = useState(null);
  
  useEffect(() => {
    checkEventbriteConnection();
  }, [dateId]);
  
  const checkEventbriteConnection = async () => {
    try {
      // Check if tour date has Eventbrite event ID
      const response = await fetch(`/api/touring/tours/${tourId}/dates`);
      const data = await response.json();
      
      if (data.success) {
        const date = data.dates.find(d => d.id === dateId);
        if (date?.eventbrite_event_id) {
          setEventbriteConnected(true);
          setEventbriteEvent({
            id: date.eventbrite_event_id,
            url: date.eventbrite_url
          });
          
          // Fetch event details
          fetchEventbriteEvent(date.eventbrite_event_id);
        }
      }
    } catch (err) {
      console.error('Error checking Eventbrite connection:', err);
    }
  };
  
  const fetchEventbriteEvent = async (eventId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/touring/integrations/eventbrite?action=get&eventId=${eventId}`);
      const data = await response.json();
      
      if (data.success) {
        setEventbriteEvent(data.event);
        setAttendees(data.attendees || []);
        
        // Calculate ticket sales
        if (data.ticketClasses) {
          let totalSales = 0;
          let totalTickets = 0;
          
          data.ticketClasses.forEach(ticket => {
            if (ticket.quantity_sold) {
              totalTickets += ticket.quantity_sold;
              if (ticket.cost) {
                totalSales += parseFloat(ticket.cost.major_value) * ticket.quantity_sold;
              }
            }
          });
          
          setTicketSales({
            totalTickets,
            totalRevenue: totalSales
          });
        }
      }
    } catch (err) {
      console.error('Error fetching Eventbrite event:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const syncEventbrite = async () => {
    if (!eventbriteEvent?.id) return;
    
    try {
      setSyncing(true);
      const response = await fetch(`/api/touring/integrations/eventbrite?action=sync&tourDateId=${dateId}&eventId=${eventbriteEvent.id}`, {
        method: 'GET'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh data
        await fetchEventbriteEvent(eventbriteEvent.id);
        alert('Eventbrite data synced successfully!');
      } else {
        alert('Failed to sync: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error syncing Eventbrite:', err);
      alert('Failed to sync Eventbrite data');
    } finally {
      setSyncing(false);
    }
  };
  
  const createEventbriteEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/touring/integrations/eventbrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourDateId: dateId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEventbriteConnected(true);
        setEventbriteEvent(data.event);
        alert('Eventbrite event created successfully!');
      } else {
        alert('Failed to create event: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error creating Eventbrite event:', err);
      alert('Failed to create Eventbrite event');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/touring/tours/${tourId}/dates/${dateId}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">External Integrations</h1>
              <p className="text-gray-600 mt-1">Connect with Eventbrite and manage payments</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Eventbrite Integration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link2 className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Eventbrite</h2>
              {eventbriteConnected ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1">
                  <CheckCircle size={12} />
                  Connected
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold flex items-center gap-1">
                  <XCircle size={12} />
                  Not Connected
                </span>
              )}
            </div>
            {eventbriteConnected && (
              <button
                onClick={syncEventbrite}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
          </div>
          
          {!eventbriteConnected ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">
                Connect Eventbrite to sync ticket sales and attendance data
              </p>
              <button
                onClick={createEventbriteEvent}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <Link2 size={20} />
                {loading ? 'Creating...' : 'Create Eventbrite Event'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {eventbriteEvent && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">Event</p>
                    {eventbriteEvent.url && (
                      <a
                        href={eventbriteEvent.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline text-sm"
                      >
                        View on Eventbrite →
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Event ID: {eventbriteEvent.id}</p>
                </div>
              )}
              
              {ticketSales && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-5 h-5 text-blue-600" />
                      <p className="text-sm text-gray-600">Tickets Sold</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{ticketSales.totalTickets}</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      £{ticketSales.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              
              {attendees.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Recent Attendees ({attendees.length})
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {attendees.slice(0, 10).map((attendee, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <p className="font-semibold text-gray-900">
                          {attendee.profile?.first_name} {attendee.profile?.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{attendee.profile?.email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Payment Integration Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Revolut Payments</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1">
              <CheckCircle size={12} />
              Available
            </span>
          </div>
          
          <p className="text-gray-600 mb-4">
            Revolut payment integration is available for tour expenses and revenue. 
            Payments can be processed directly from the Financial Tracking page.
          </p>
          
          <Link
            href={`/touring/tours/${tourId}/financial`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            <DollarSign size={18} />
            Go to Financial Tracking
          </Link>
        </div>
      </div>
    </div>
  );
}

