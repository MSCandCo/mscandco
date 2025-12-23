'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LivePerformanceTracking() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, create, analytics
  const [performances, setPerformances] = useState([]);
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [venues, setVenues] = useState([]);

  // Create performance state
  const [formData, setFormData] = useState({
    event_name: '',
    venue_name: '',
    venue_address: '',
    venue_city: '',
    venue_country: '',
    venue_capacity: '',
    performance_date: '',
    doors_open_time: '',
    performance_start_time: '',
    performance_end_time: '',
    ticket_price: '',
    ticket_url: '',
    expected_attendance: '',
    set_list: '',
    notes: '',
  });

  // Event search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadPerformances();
        await loadVenues();
      }
      setLoading(false);
    }
    loadData();
  }, []);

  async function loadPerformances() {
    try {
      const response = await fetch('/api/features/performances/list');
      const data = await response.json();
      setPerformances(data.performances || []);
    } catch (error) {
      console.error('Failed to load performances:', error);
    }
  }

  async function loadVenues() {
    try {
      const { data } = await supabase
        .from('live_performances')
        .select('venue_name, venue_city, venue_country')
        .not('venue_name', 'is', null)
        .order('performance_date', { ascending: false })
        .limit(50);

      // Get unique venues
      const uniqueVenues = [];
      const seen = new Set();
      data?.forEach(v => {
        const key = `${v.venue_name}-${v.venue_city}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueVenues.push(v);
        }
      });
      setVenues(uniqueVenues);
    } catch (error) {
      console.error('Failed to load venues:', error);
    }
  }

  async function searchEvents() {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    setSearching(true);
    try {
      const response = await fetch('/api/features/performances/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          include_ticketmaster: true,
          include_eventbrite: true,
        }),
      });

      const data = await response.json();
      setSearchResults(data.events || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed: ' + error.message);
    } finally {
      setSearching(false);
    }
  }

  async function importEvent(event) {
    setFormData({
      event_name: event.name || '',
      venue_name: event.venue?.name || '',
      venue_address: event.venue?.address || '',
      venue_city: event.venue?.city || '',
      venue_country: event.venue?.country || '',
      venue_capacity: event.venue?.capacity || '',
      performance_date: event.date ? event.date.split('T')[0] : '',
      doors_open_time: event.doors_time || '',
      performance_start_time: event.start_time || '',
      performance_end_time: '',
      ticket_price: event.ticket_price || '',
      ticket_url: event.url || '',
      expected_attendance: '',
      set_list: '',
      notes: `Imported from ${event.source}`,
    });
    setActiveTab('create');
  }

  async function createPerformance() {
    if (!formData.event_name || !formData.performance_date) {
      alert('Please fill in required fields: Event Name and Date');
      return;
    }

    try {
      const response = await fetch('/api/features/performances/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Performance created successfully!');
        setFormData({
          event_name: '',
          venue_name: '',
          venue_address: '',
          venue_city: '',
          venue_country: '',
          venue_capacity: '',
          performance_date: '',
          doors_open_time: '',
          performance_start_time: '',
          performance_end_time: '',
          ticket_price: '',
          ticket_url: '',
          expected_attendance: '',
          set_list: '',
          notes: '',
        });
        await loadPerformances();
        setActiveTab('upcoming');
      } else {
        alert('Failed to create performance: ' + data.error);
      }
    } catch (error) {
      console.error('Create error:', error);
      alert('Failed to create performance: ' + error.message);
    }
  }

  async function updatePerformance(performanceId, updates) {
    try {
      const response = await fetch(`/api/features/performances/${performanceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        alert('Performance updated!');
        await loadPerformances();
      } else {
        alert('Failed to update performance');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update: ' + error.message);
    }
  }

  async function deletePerformance(performanceId) {
    if (!confirm('Are you sure you want to delete this performance?')) return;

    try {
      const response = await fetch(`/api/features/performances/${performanceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Performance deleted successfully');
        await loadPerformances();
      } else {
        alert('Failed to delete performance');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete: ' + error.message);
    }
  }

  const upcomingPerformances = performances.filter(p => new Date(p.performance_date) >= new Date());
  const pastPerformances = performances.filter(p => new Date(p.performance_date) < new Date());

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🎤 Live Performance Tracking</h1>
          <p className="text-gray-600">
            Manage your live shows, track attendance, and analyze performance data
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'upcoming'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            📅 Upcoming ({upcomingPerformances.length})
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'past'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('past')}
          >
            📊 Past Shows ({pastPerformances.length})
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'search'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Find Events
          </button>
          <button
            className={`pb-3 px-4 font-medium ${
              activeTab === 'create'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('create')}
          >
            ➕ Add Performance
          </button>
        </div>

        {/* TAB: Upcoming Performances */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingPerformances.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 mb-4">No upcoming performances</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Your First Performance
                </button>
              </div>
            ) : (
              upcomingPerformances.map(performance => (
                <div key={performance.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{performance.event_name}</h3>
                      <div className="space-y-1 text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span>
                            {performance.venue_name}
                            {performance.venue_city && `, ${performance.venue_city}`}
                            {performance.venue_country && `, ${performance.venue_country}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{new Date(performance.performance_date).toLocaleDateString()}</span>
                          {performance.performance_start_time && (
                            <span>• {performance.performance_start_time}</span>
                          )}
                        </div>
                        {performance.venue_capacity && (
                          <div className="flex items-center gap-2">
                            <span>👥</span>
                            <span>Capacity: {performance.venue_capacity}</span>
                            {performance.expected_attendance && (
                              <span>• Expected: {performance.expected_attendance}</span>
                            )}
                          </div>
                        )}
                        {performance.ticket_price && (
                          <div className="flex items-center gap-2">
                            <span>💰</span>
                            <span>Tickets: £{performance.ticket_price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {performance.ticket_url && (
                        <a
                          href={performance.ticket_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Get Tickets
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedPerformance(performance)}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => deletePerformance(performance.id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {performance.set_list && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-2">Set List:</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{performance.set_list}</p>
                    </div>
                  )}

                  {performance.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-2">Notes:</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{performance.notes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: Past Performances */}
        {activeTab === 'past' && (
          <div className="space-y-4">
            {pastPerformances.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                No past performances recorded
              </div>
            ) : (
              pastPerformances.map(performance => (
                <div key={performance.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{performance.event_name}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>{performance.venue_name} - {new Date(performance.performance_date).toLocaleDateString()}</div>
                        {performance.actual_attendance && (
                          <div className="text-green-600 font-semibold">
                            Attendance: {performance.actual_attendance}
                            {performance.venue_capacity && (
                              <span className="text-gray-500 ml-2">
                                ({Math.round((performance.actual_attendance / performance.venue_capacity) * 100)}% capacity)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPerformance(performance)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: Search Events */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">🔍 Find Events on Ticketmaster & Eventbrite</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by artist name, venue, or city..."
                  className="flex-1 px-4 py-3 border rounded-md"
                  onKeyPress={(e) => e.key === 'Enter' && searchEvents()}
                />
                <button
                  onClick={searchEvents}
                  disabled={searching}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Search Results ({searchResults.length})</h3>
                <div className="space-y-3">
                  {searchResults.map((event, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{event.name}</h4>
                          <div className="text-sm text-gray-600 space-y-1 mt-2">
                            <div>📍 {event.venue?.name} - {event.venue?.city}</div>
                            <div>📅 {new Date(event.date).toLocaleDateString()}</div>
                            {event.ticket_price && <div>💰 From £{event.ticket_price}</div>}
                            <div className="text-xs text-gray-500">Source: {event.source}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => importEvent(event)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Import
                          </button>
                          {event.url && (
                            <a
                              href={event.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              View
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: Create Performance */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">➕ Add New Performance</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.event_name}
                  onChange={(e) => setFormData({...formData, event_name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="Summer Festival 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Venue Name</label>
                <input
                  type="text"
                  value={formData.venue_name}
                  onChange={(e) => setFormData({...formData, venue_name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  list="venues-list"
                  placeholder="O2 Arena"
                />
                <datalist id="venues-list">
                  {venues.map((v, idx) => (
                    <option key={idx} value={v.venue_name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Venue City</label>
                <input
                  type="text"
                  value={formData.venue_city}
                  onChange={(e) => setFormData({...formData, venue_city: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="London"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Venue Address</label>
                <input
                  type="text"
                  value={formData.venue_address}
                  onChange={(e) => setFormData({...formData, venue_address: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="Peninsula Square"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <input
                  type="text"
                  value={formData.venue_country}
                  onChange={(e) => setFormData({...formData, venue_country: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="United Kingdom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Venue Capacity</label>
                <input
                  type="number"
                  value={formData.venue_capacity}
                  onChange={(e) => setFormData({...formData, venue_capacity: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="20000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Performance Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.performance_date}
                  onChange={(e) => setFormData({...formData, performance_date: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Doors Open</label>
                <input
                  type="time"
                  value={formData.doors_open_time}
                  onChange={(e) => setFormData({...formData, doors_open_time: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Performance Start</label>
                <input
                  type="time"
                  value={formData.performance_start_time}
                  onChange={(e) => setFormData({...formData, performance_start_time: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Performance End</label>
                <input
                  type="time"
                  value={formData.performance_end_time}
                  onChange={(e) => setFormData({...formData, performance_end_time: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ticket Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ticket_price}
                  onChange={(e) => setFormData({...formData, ticket_price: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="25.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expected Attendance</label>
                <input
                  type="number"
                  value={formData.expected_attendance}
                  onChange={(e) => setFormData({...formData, expected_attendance: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="15000"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Ticket URL</label>
                <input
                  type="url"
                  value={formData.ticket_url}
                  onChange={(e) => setFormData({...formData, ticket_url: e.target.value})}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="https://www.ticketmaster.co.uk/..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Set List</label>
                <textarea
                  value={formData.set_list}
                  onChange={(e) => setFormData({...formData, set_list: e.target.value})}
                  className="w-full h-32 px-4 py-2 border rounded-md"
                  placeholder="1. Opening Song&#10;2. Hit Single&#10;3. ..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full h-24 px-4 py-2 border rounded-md"
                  placeholder="Additional notes, special guests, etc."
                />
              </div>
            </div>

            <button
              onClick={createPerformance}
              className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
            >
              Create Performance
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
