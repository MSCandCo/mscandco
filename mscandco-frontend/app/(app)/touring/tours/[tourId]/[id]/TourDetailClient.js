'use client';

/**
 * Touring Platform - Tour Detail Client Component
 * Comprehensive tour management with all features
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Users,
  FileText,
  DollarSign,
  Music,
  Hotel,
  Plane,
  UserPlus,
  Package,
  ShoppingCart,
  ArrowLeft,
  Settings,
  Clock,
  Phone,
  Wrench
} from 'lucide-react';
import Link from 'next/link';
import CurrencySelector, { useCurrencySync, formatCurrency } from '@/components/shared/CurrencySelector';

export default function TourDetailClient({ tourId }) {
  const router = useRouter();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [activeTab, setActiveTab] = useState('overview');
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states for each feature
  const [tourDates, setTourDates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [daySheets, setDaySheets] = useState([]);
  const [technicalDocs, setTechnicalDocs] = useState([]);
  const [productionReqs, setProductionReqs] = useState([]);
  const [merchandise, setMerchandise] = useState([]);
  const [merchandiseSales, setMerchandiseSales] = useState([]);

  useEffect(() => {
    fetchTourData();
  }, [tourId]);

  const fetchTourData = async () => {
    try {
      setLoading(true);

      // Fetch tour details
      const tourRes = await fetch(`/api/touring/tours/${tourId}`, {
        credentials: 'include'
      });

      if (!tourRes.ok) throw new Error('Failed to fetch tour');
      const tourData = await tourRes.json();
      setTour(tourData.tour);

      // Fetch tour dates
      const datesRes = await fetch(`/api/touring/tours/${tourId}/dates`, {
        credentials: 'include'
      });
      if (datesRes.ok) {
        const datesData = await datesRes.json();
        setTourDates(datesData.dates || []);
      }

    } catch (err) {
      console.error('Error fetching tour data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch(`/api/touring/contacts?tour_id=${tourId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const fetchDaySheets = async () => {
    try {
      const res = await fetch(`/api/touring/day-sheets?tour_date_id=${tourId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setDaySheets(data.daySheets || []);
      }
    } catch (err) {
      console.error('Error fetching day sheets:', err);
    }
  };

  const fetchTechnicalDocs = async () => {
    try {
      const res = await fetch(`/api/touring/technical-docs?tour_id=${tourId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setTechnicalDocs(data.docs || []);
      }
    } catch (err) {
      console.error('Error fetching technical docs:', err);
    }
  };

  const fetchProductionReqs = async () => {
    try {
      const res = await fetch(`/api/touring/production-requirements?tour_id=${tourId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setProductionReqs(data.requirements || []);
      }
    } catch (err) {
      console.error('Error fetching production requirements:', err);
    }
  };

  const fetchMerchandise = async () => {
    try {
      const res = await fetch(`/api/touring/merchandise?tour_id=${tourId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setMerchandise(data.merchandise || []);
      }
    } catch (err) {
      console.error('Error fetching merchandise:', err);
    }
  };

  // Load tab data when switching tabs
  useEffect(() => {
    if (!tour) return;

    switch (activeTab) {
      case 'contacts':
        if (contacts.length === 0) fetchContacts();
        break;
      case 'daysheets':
        if (daySheets.length === 0) fetchDaySheets();
        break;
      case 'technical':
        if (technicalDocs.length === 0) fetchTechnicalDocs();
        break;
      case 'production':
        if (productionReqs.length === 0) fetchProductionReqs();
        break;
      case 'merchandise':
        if (merchandise.length === 0) fetchMerchandise();
        break;
    }
  }, [activeTab, tour]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Tour</h3>
            <p className="text-red-700">{error || 'Tour not found'}</p>
            <Link href="/touring" className="text-red-600 hover:underline mt-4 inline-block">
              ← Back to Tours
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Calendar },
    { id: 'dates', label: 'Tour Dates', icon: MapPin },
    { id: 'contacts', label: 'Contacts', icon: Phone },
    { id: 'daysheets', label: 'Day Sheets', icon: Clock },
    { id: 'technical', label: 'Technical Docs', icon: FileText },
    { id: 'production', label: 'Production', icon: Wrench },
    { id: 'merchandise', label: 'Merchandise', icon: Package },
    { id: 'setlists', label: 'Set Lists', icon: Music },
    { id: 'travel', label: 'Travel & Hotels', icon: Plane },
    { id: 'guestlists', label: 'Guest Lists', icon: UserPlus },
    { id: 'finances', label: 'Finances', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/touring" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={24} />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{tour.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tour.status)}`}>
                  {tour.status}
                </span>
              </div>
              <p className="text-gray-600">{tour.artist_name}</p>
              <div className="flex items-center gap-4 mt-2">
                <CurrencySelector
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={updateCurrency}
                  compact={true}
                  showExchangeRate={true}
                />
              </div>
              {tour.start_date && tour.end_date && (
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(tour.start_date).toLocaleDateString()} - {new Date(tour.end_date).toLocaleDateString()}
                </p>
              )}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Settings size={18} />
              Settings
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-bold mb-4">Tour Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tour Type</p>
                  <p className="font-semibold">{tour.tour_type || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-semibold">
                    {tour.budget ? formatCurrency(parseFloat(tour.budget), selectedCurrency) : 'Not set'}
                  </p>
                </div>
                {tour.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="mt-1">{tour.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
                <Calendar className="w-8 h-8 text-gray-900 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{tourDates.length}</p>
                <p className="text-sm text-gray-600">Tour Dates</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
                <Phone className="w-8 h-8 text-gray-900 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{contacts.length}</p>
                <p className="text-sm text-gray-600">Contacts</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
                <Package className="w-8 h-8 text-gray-900 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{merchandise.length}</p>
                <p className="text-sm text-gray-600">Merchandise Items</p>
              </div>
            </div>
          </div>
        )}

        {/* Tour Dates Tab */}
        {activeTab === 'dates' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Tour Dates</h2>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                Add Date
              </button>
            </div>
            {tourDates.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>No tour dates added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tourDates.map((date) => (
                  <div key={date.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{date.venue_name}</h3>
                        <p className="text-sm text-gray-600">{date.city}, {date.country}</p>
                        <p className="text-sm text-gray-500">{new Date(date.date).toLocaleDateString()}</p>
                      </div>
                      {date.status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(date.status)}`}>
                          {date.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Tour Contacts</h2>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                Add Contact
              </button>
            </div>
            {contacts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Phone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>No contacts added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{contact.name}</h3>
                      {contact.emergency_contact && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Emergency</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{contact.company}</p>
                    <p className="text-sm text-gray-600">{contact.position}</p>
                    {contact.phone && (
                      <p className="text-sm text-gray-700 mt-2">{contact.phone}</p>
                    )}
                    {contact.email && (
                      <p className="text-sm text-gray-700">{contact.email}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Day Sheets Tab */}
        {activeTab === 'daysheets' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Day Sheets</h2>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                Create Day Sheet
              </button>
            </div>
            {daySheets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>No day sheets created yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {daySheets.map((sheet) => (
                  <div key={sheet.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{new Date(sheet.date).toLocaleDateString()}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(sheet.status)}`}>
                        {sheet.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {sheet.crew_call && (
                        <div>
                          <p className="text-gray-600">Crew Call</p>
                          <p className="font-semibold">{sheet.crew_call}</p>
                        </div>
                      )}
                      {sheet.soundcheck && (
                        <div>
                          <p className="text-gray-600">Soundcheck</p>
                          <p className="font-semibold">{sheet.soundcheck}</p>
                        </div>
                      )}
                      {sheet.doors_time && (
                        <div>
                          <p className="text-gray-600">Doors</p>
                          <p className="font-semibold">{sheet.doors_time}</p>
                        </div>
                      )}
                      {sheet.show_time && (
                        <div>
                          <p className="text-gray-600">Show Time</p>
                          <p className="font-semibold">{sheet.show_time}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Technical Docs Tab */}
        {activeTab === 'technical' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Technical Documents</h2>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                Upload Document
              </button>
            </div>
            {technicalDocs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>No technical documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {technicalDocs.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{doc.title}</h3>
                        <p className="text-sm text-gray-600">{doc.doc_type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-xs text-gray-500">v{doc.version}</p>
                      </div>
                      <button className="text-blue-600 hover:underline text-sm">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Production Requirements Tab */}
        {activeTab === 'production' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Production Requirements</h2>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                Add Requirements
              </button>
            </div>
            {productionReqs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>No production requirements set yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {productionReqs.map((req) => (
                  <div key={req.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {req.stage_size && (
                        <div>
                          <p className="text-gray-600">Stage Size</p>
                          <p className="font-semibold">{req.stage_size}</p>
                        </div>
                      )}
                      {req.power_requirements && (
                        <div>
                          <p className="text-gray-600">Power</p>
                          <p className="font-semibold">{req.power_requirements}</p>
                        </div>
                      )}
                      {req.dressing_rooms_needed && (
                        <div>
                          <p className="text-gray-600">Dressing Rooms</p>
                          <p className="font-semibold">{req.dressing_rooms_needed}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Merchandise Tab */}
        {activeTab === 'merchandise' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Merchandise</h2>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                Add Item
              </button>
            </div>
            {merchandise.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>No merchandise items added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {merchandise.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{item.product_name}</h3>
                        <p className="text-sm text-gray-600">
                          {item.size && `${item.size} - `}
                          {item.color}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Stock: {item.current_inventory} / Sold: {item.sold}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">${parseFloat(item.price).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Cost: ${parseFloat(item.cost).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Placeholder tabs for existing features */}
        {['setlists', 'travel', 'guestlists', 'finances'].includes(activeTab) && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold mb-4">{tabs.find(t => t.id === activeTab)?.label}</h2>
            <div className="text-center py-12 text-gray-500">
              <p>This feature is being integrated from existing systems...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
