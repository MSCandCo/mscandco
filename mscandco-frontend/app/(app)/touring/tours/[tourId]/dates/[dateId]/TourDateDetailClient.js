'use client';

/**
 * Touring Platform - Tour Date Detail View
 * Complete management interface for a single show date
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, MapPin, Clock, Users, DollarSign, Plus, 
  CheckCircle, XCircle, Clock as ClockIcon, Hotel, Plane, Music,
  Edit, Trash2, Car, Train, Ship, Link2, FileText
} from 'lucide-react';
import CurrencySelector, { useCurrencySync, formatCurrency } from '@/components/shared/CurrencySelector';

export default function TourDateDetailClient({ tourId, dateId, userId }) {
  const router = useRouter();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(null);
  const [guests, setGuests] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [travel, setTravel] = useState([]);
  const [setlist, setSetlist] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchDateData();
  }, [dateId]);
  
  const fetchDateData = async () => {
    try {
      setLoading(true);
      
      // Fetch date details
      const dateRes = await fetch(`/api/touring/tours/${tourId}/dates`);
      const dateData = await dateRes.json();
      
      if (dateData.success) {
        const foundDate = dateData.dates.find(d => d.id === dateId);
        setDate(foundDate);
      }
      
      // Fetch guest list
      const guestRes = await fetch(`/api/touring/tour-dates/${dateId}/guest-list`);
      const guestData = await guestRes.json();
      
      if (guestData.success) {
        setGuests(guestData.guests || []);
      }
      
      // Fetch itinerary
      const itineraryRes = await fetch(`/api/touring/tour-dates/${dateId}/itinerary`);
      const itineraryData = await itineraryRes.json();
      
      if (itineraryData.success) {
        setItinerary(itineraryData.items || []);
      }
      
      // Fetch hotels
      const hotelsRes = await fetch(`/api/touring/tour-dates/${dateId}/hotels`);
      const hotelsData = await hotelsRes.json();
      
      if (hotelsData.success) {
        setHotels(hotelsData.hotels || []);
      }
      
      // Fetch travel
      const travelRes = await fetch(`/api/touring/tour-dates/${dateId}/travel`);
      const travelData = await travelRes.json();
      
      if (travelData.success) {
        setTravel(travelData.travelItems || []);
      }
      
      // Fetch setlist
      const setlistRes = await fetch(`/api/touring/tour-dates/${dateId}/setlist`);
      const setlistData = await setlistRes.json();
      
      if (setlistData.success && setlistData.setlist) {
        setSetlist(setlistData);
      }
    } catch (err) {
      console.error('Error fetching date data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveGuest = async (guestId) => {
    try {
      const response = await fetch(`/api/touring/guest-lists/${guestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', approved_by: userId })
      });
      
      if (response.ok) {
        fetchDateData();
      }
    } catch (err) {
      console.error('Error approving guest:', err);
    }
  };
  
  const handleDeclineGuest = async (guestId) => {
    try {
      const response = await fetch(`/api/touring/guest-lists/${guestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined', declined_reason: 'Declined by tour manager' })
      });
      
      if (response.ok) {
        fetchDateData();
      }
    } catch (err) {
      console.error('Error declining guest:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tour date...</p>
        </div>
      </div>
    );
  }
  
  if (error || !date) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Tour date not found'}</p>
          <Link href={`/touring/tours/${tourId}`} className="text-blue-600 hover:underline">
            Back to Tour
          </Link>
        </div>
      </div>
    );
  }
  
  const pendingGuests = guests.filter(g => g.status === 'pending');
  const approvedGuests = guests.filter(g => g.status === 'approved');
  const declinedGuests = guests.filter(g => g.status === 'declined');
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/touring/tours/${tourId}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {new Date(date.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <MapPin size={16} />
                  {date.city}, {date.country}
                  {date.venues && ` • ${date.venues.name}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={updateCurrency}
                compact={true}
                showExchangeRate={true}
              />
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                date.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                date.status === 'hold' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {date.status}
              </span>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors">
                <Edit size={18} />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {['overview', 'guest-list', 'itinerary', 'hotels', 'travel', 'setlist', 'integrations', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {date.show_time && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <ClockIcon className="w-6 h-6 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Show Time</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date(`2000-01-01T${date.show_time}`).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                </div>
              )}
              
              {date.doors_time && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <ClockIcon className="w-6 h-6 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Doors</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date(`2000-01-01T${date.doors_time}`).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                </div>
              )}
              
              {date.capacity && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">Capacity</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{date.capacity.toLocaleString()}</p>
                </div>
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Guest List</p>
                <p className="text-3xl font-bold text-gray-900">{guests.length}</p>
                <p className="text-xs text-gray-500 mt-1">{pendingGuests.length} pending</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Itinerary Items</p>
                <p className="text-3xl font-bold text-gray-900">{itinerary.length}</p>
              </div>
              
              {date.revenue && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Revenue</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(parseFloat(date.revenue), selectedCurrency)}
                  </p>
                </div>
              )}
              
              {date.expenses && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Expenses</p>
                  <p className="text-3xl font-bold text-red-600">
                    {formatCurrency(parseFloat(date.expenses), selectedCurrency)}
                  </p>
                </div>
              )}
            </div>
            
            {/* Notes */}
            {date.notes && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{date.notes}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Guest List Tab */}
        {activeTab === 'guest-list' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Guest List</h2>
              <Link
                href={`/touring/tours/${tourId}/dates/${dateId}/guest-list/add`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                <Plus size={18} />
                Add Guest
              </Link>
            </div>
            
            {/* Pending Guests */}
            {pendingGuests.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-yellow-600" />
                  Pending Approval ({pendingGuests.length})
                </h3>
                <div className="space-y-3">
                  {pendingGuests.map((guest) => (
                    <div key={guest.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{guest.guest_name}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {guest.guest_email} • {guest.pass_type} • {guest.total_guests} {guest.total_guests === 1 ? 'guest' : 'guests'}
                        </p>
                        {guest.notes && (
                          <p className="text-sm text-gray-500 mt-1">{guest.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveGuest(guest.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleDeclineGuest(guest.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Decline"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Approved Guests */}
            {approvedGuests.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Approved ({approvedGuests.length})
                </h3>
                <div className="space-y-3">
                  {approvedGuests.map((guest) => (
                    <div key={guest.id} className="p-4 border border-gray-200 rounded-lg bg-green-50">
                      <p className="font-semibold text-gray-900">{guest.guest_name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {guest.guest_email} • {guest.pass_type} • {guest.total_guests} {guest.total_guests === 1 ? 'guest' : 'guests'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {guests.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No guests yet</h3>
                <p className="text-gray-600 mb-6">Start building your guest list</p>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                  <Plus size={20} />
                  Add First Guest
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Itinerary</h2>
              <Link
                href={`/touring/tours/${tourId}/dates/${dateId}/itinerary/add`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                <Plus size={18} />
                Add Item
              </Link>
            </div>
            
            {itinerary.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No itinerary items yet</h3>
                <p className="text-gray-600 mb-6">Start building your day schedule</p>
              <Link
                href={`/touring/tours/${tourId}/dates/${dateId}/itinerary/add`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                <Plus size={20} />
                Add First Item
              </Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                  {itinerary.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ClockIcon className="w-6 h-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(item.start_time).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                              {item.end_time && ` - ${new Date(item.end_time).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}`}
                            </p>
                            {item.location && (
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                <MapPin size={14} />
                                {item.location}
                              </p>
                            )}
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <Edit size={18} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Hotels Tab */}
        {activeTab === 'hotels' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Hotels</h2>
              <Link
                href={`/touring/tours/${tourId}/dates/${dateId}/hotels/add`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                <Plus size={18} />
                Add Hotel
              </Link>
            </div>
            
            {hotels.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Hotel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hotels booked yet</h3>
                <p className="text-gray-600 mb-6">Add hotel accommodations for this show</p>
                <Link
                  href={`/touring/tours/${tourId}/dates/${dateId}/hotels/add`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                >
                  <Plus size={20} />
                  Add Hotel
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {hotels.map((hotel) => (
                  <div key={hotel.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {hotel.address && `${hotel.address}, `}
                          {hotel.city}, {hotel.country}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Check-In</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(hotel.check_in).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Check-Out</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(hotel.check_out).toLocaleDateString()}
                            </p>
                          </div>
                          {hotel.confirmation_number && (
                            <div>
                              <p className="text-gray-500">Confirmation</p>
                              <p className="font-semibold text-gray-900">{hotel.confirmation_number}</p>
                            </div>
                          )}
                          {hotel.total_cost && (
                            <div>
                              <p className="text-gray-500">Total Cost</p>
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(parseFloat(hotel.total_cost), selectedCurrency)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Travel Tab */}
        {activeTab === 'travel' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Travel</h2>
              <Link
                href={`/touring/tours/${tourId}/dates/${dateId}/travel/add`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                <Plus size={18} />
                Add Travel
              </Link>
            </div>
            
            {travel.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No travel arrangements yet</h3>
                <p className="text-gray-600 mb-6">Add flights, ground transport, or other travel</p>
                <Link
                  href={`/touring/tours/${tourId}/dates/${dateId}/travel/add`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                >
                  <Plus size={20} />
                  Add Travel
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {travel.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {item.travel_type === 'air' && <Plane className="w-5 h-5 text-blue-600" />}
                          {item.travel_type === 'ground' && <Car className="w-5 h-5 text-green-600" />}
                          {item.travel_type === 'rail' && <Train className="w-5 h-5 text-purple-600" />}
                          {item.travel_type === 'sea' && <Ship className="w-5 h-5 text-indigo-600" />}
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 capitalize">
                            {item.travel_type}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 mb-2">
                          {item.departure_location} → {item.arrival_location}
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Departure</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(item.departure_time).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Arrival</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(item.arrival_time).toLocaleString()}
                            </p>
                          </div>
                          {item.airline && item.flight_number && (
                            <div>
                              <p className="text-gray-500">Flight</p>
                              <p className="font-semibold text-gray-900">
                                {item.airline} {item.flight_number}
                              </p>
                            </div>
                          )}
                          {item.confirmation_number && (
                            <div>
                              <p className="text-gray-500">Confirmation</p>
                              <p className="font-semibold text-gray-900">{item.confirmation_number}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Reports & Exports</h2>
              <Link
                href={`/touring/tours/${tourId}/dates/${dateId}/reports`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                <FileText size={18} />
                Generate Reports
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Reports</h3>
              <p className="text-gray-600 mb-6">Create day sheets, financial reports, and calendar exports</p>
              <Link
                href={`/touring/tours/${tourId}/dates/${dateId}/reports`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                <FileText size={20} />
                Generate Reports
              </Link>
            </div>
          </div>
        )}
        
        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">External Integrations</h2>
              <Link
                href={`/touring/tours/${tourId}/dates/${dateId}/integrations`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                <Link2 size={18} />
                Manage Integrations
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Link2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect External Services</h3>
              <p className="text-gray-600 mb-6">Sync with Eventbrite, manage payments with Revolut</p>
              <Link
                href={`/touring/tours/${tourId}/dates/${dateId}/integrations`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                <Link2 size={20} />
                Manage Integrations
              </Link>
            </div>
          </div>
        )}
        
        {/* Setlist Tab */}
        {activeTab === 'setlist' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Set List</h2>
              <Link
                href={`/touring/tours/${tourId}/dates/${dateId}/setlist`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                <Music size={18} />
                Build Set List
              </Link>
            </div>
            
            {!setlist ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No set list yet</h3>
                <p className="text-gray-600 mb-6">Create your set list for this show</p>
                <Link
                  href={`/touring/tours/${tourId}/dates/${dateId}/setlist`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                >
                  <Plus size={20} />
                  Create Set List
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{setlist.setlist.name}</h3>
                    {setlist.setlist.description && (
                      <p className="text-sm text-gray-600 mt-1">{setlist.setlist.description}</p>
                    )}
                  </div>
                  <Link
                    href={`/touring/tours/${tourId}/dates/${dateId}/setlist`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm"
                  >
                    <Edit size={16} />
                    Edit
                  </Link>
                </div>
                
                <div className="space-y-2">
                  {setlist.songs.map((song, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
                    >
                      <span className="text-sm font-semibold text-gray-500 w-8">#{index + 1}</span>
                      {song.is_break ? (
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Break</p>
                          <p className="text-sm text-gray-600">{song.break_duration || 5} minutes</p>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{song.songs?.title || 'Unknown Song'}</p>
                          {song.songs?.artist && (
                            <p className="text-sm text-gray-600">{song.songs.artist}</p>
                          )}
                          {song.songs?.duration && (
                            <p className="text-xs text-gray-500 mt-1">
                              {Math.floor(song.songs.duration / 60)}:{(song.songs.duration % 60).toString().padStart(2, '0')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

