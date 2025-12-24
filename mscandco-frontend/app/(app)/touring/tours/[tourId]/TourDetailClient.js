'use client';

/**
 * Touring Platform - Tour Detail View
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Plus, Edit, Music, TrendingUp, Route, MoreVertical, Archive, Trash2, Copy, FileText, X } from 'lucide-react';
import { subscribeToTable, handleRealtimeUpdate } from '@/lib/supabase/realtime';
import CurrencySelector, { useCurrencySync, formatCurrency, convertCurrency } from '@/components/shared/CurrencySelector';
import { TOUR_TYPES } from '@/lib/constants';

export default function TourDetailClient({ tourId, userId }) {
  const router = useRouter();
  const [tour, setTour] = useState(null);
  const [dates, setDates] = useState([]);
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Currency selector with sync across platform
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  useEffect(() => {
    fetchTourData();
  }, [tourId]);

  // Real-time subscriptions
  useEffect(() => {
    if (!tourId) return;

    const subscriptions = [];

    // Subscribe to tour updates
    subscriptions.push(
      subscribeToTable('tours', (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new.id === tourId) {
          setTour(payload.new);
        }
      }, { column: 'id', value: tourId })
    );

    // Subscribe to tour dates
    subscriptions.push(
      subscribeToTable('tour_dates', (payload) => {
        handleRealtimeUpdate(payload, dates, setDates);
      }, { column: 'tour_id', value: tourId })
    );

    // Subscribe to crew changes
    subscriptions.push(
      subscribeToTable('tour_crew', (payload) => {
        // Only update if crew member is active
        if (payload.eventType === 'INSERT' && payload.new.active) {
          setCrew([...crew, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setCrew(crew.map(member =>
            member.id === payload.new.id ? payload.new : member
          ).filter(member => member.active));
        } else if (payload.eventType === 'DELETE') {
          setCrew(crew.filter(member => member.id !== payload.old.id));
        }
      }, { column: 'tour_id', value: tourId })
    );

    console.log('[Real-time] Subscribed to tour updates:', tourId);

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
      console.log('[Real-time] Unsubscribed from tour updates');
    };
  }, [tourId]);

  const fetchTourData = async () => {
    try {
      setLoading(true);
      
      // Fetch tour
      const tourRes = await fetch(`/api/touring/tours/${tourId}`);
      const tourData = await tourRes.json();
      
      if (!tourRes.ok) {
        throw new Error(tourData.error || 'Failed to fetch tour');
      }
      
      setTour(tourData.tour);
      setDates(tourData.tour.tour_dates || []);
      setCrew(tourData.tour.crew || []);
    } catch (err) {
      console.error('Error fetching tour:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleUpdateTour = async (updates) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/touring/tours/${tourId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update tour');
      }
      
      setTour(data.tour);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating tour:', err);
      alert('Failed to update tour: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleArchiveTour = async () => {
    if (!confirm('Are you sure you want to archive this tour? You can restore it later.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      await handleUpdateTour({ status: 'completed' });
      alert('Tour archived successfully');
    } catch (err) {
      alert('Failed to archive tour: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleDeleteTour = async () => {
    if (!confirm('Are you sure you want to delete this tour? This action cannot be undone and will delete all related data (dates, crew, expenses, etc.).')) {
      return;
    }
    
    try {
      setActionLoading(true);
      const response = await fetch(`/api/touring/tours/${tourId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete tour');
      }
      
      router.push('/touring');
    } catch (err) {
      console.error('Error deleting tour:', err);
      alert('Failed to delete tour: ' + err.message);
      setActionLoading(false);
    }
  };
  
  const handleDuplicateTour = async () => {
    if (!confirm('This will create a copy of this tour with all dates and crew. Continue?')) {
      return;
    }
    
    try {
      setActionLoading(true);
      
      // Create new tour with same data but new name
      const response = await fetch('/api/touring/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: `${tour.name} (Copy)`,
          artist_name: tour.artist_name,
          start_date: tour.start_date,
          end_date: tour.end_date,
          description: tour.description,
          budget: tour.budget,
          currency: tour.currency || 'GBP',
          tour_type: tour.tour_type,
          status: 'planning'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to duplicate tour');
      }
      
      const newTourId = data.tour.id;
      
      // Duplicate tour dates
      for (const date of dates) {
        await fetch(`/api/touring/tours/${newTourId}/dates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: date.date,
            venue_id: date.venue_id,
            city: date.city,
            state_province: date.state_province,
            country: date.country,
            status: 'pending'
          })
        });
      }
      
      // Duplicate crew
      for (const member of crew) {
        await fetch(`/api/touring/tours/${newTourId}/crew`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: member.name,
            role: member.role,
            email: member.email,
            phone: member.phone
          })
        });
      }
      
      router.push(`/touring/tours/${newTourId}`);
      alert('Tour duplicated successfully!');
    } catch (err) {
      console.error('Error duplicating tour:', err);
      alert('Failed to duplicate tour: ' + err.message);
      setActionLoading(false);
    }
  };
  
  const handleSaveAsTemplate = async () => {
    const templateName = prompt('Enter a name for this template:');
    if (!templateName) return;
    
    try {
      setActionLoading(true);
      
      // Save to localStorage as template (or you could create an API endpoint for templates)
      const template = {
        id: `template_${Date.now()}`,
        name: templateName,
        created_at: new Date().toISOString(),
        tour_data: {
          artist_name: tour.artist_name,
          tour_type: tour.tour_type,
          description: tour.description,
          crew_roles: crew.map(m => ({ role: m.role, name: m.name })),
          default_settings: {
            budget: tour.budget
          }
        }
      };
      
      const existingTemplates = JSON.parse(localStorage.getItem('tour_templates') || '[]');
      existingTemplates.push(template);
      localStorage.setItem('tour_templates', JSON.stringify(existingTemplates));
      
      alert(`Template "${templateName}" saved successfully!`);
    } catch (err) {
      console.error('Error saving template:', err);
      alert('Failed to save template: ' + err.message);
      setActionLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tour...</p>
        </div>
      </div>
    );
  }
  
  if (error || !tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Tour not found'}</p>
          <Link href="/touring" className="text-blue-600 hover:underline">
            Back to Tours
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/touring"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{tour.name}</h1>
                <p className="text-gray-600 mt-1">{tour.artist_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={updateCurrency}
                compact={true}
                showExchangeRate={false}
              />
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(tour.status)}`}>
                {tour.status}
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href={`/touring/tours/${tourId}/route-optimization`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Route size={18} />
                  Optimize Route
                </Link>
                <Link
                  href={`/touring/tours/${tourId}/financial`}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  <DollarSign size={18} />
                  Financial
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <MoreVertical size={18} />
                    Actions
                  </button>
                  
                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="py-1">
                          <button
                            onClick={() => { setShowMenu(false); setShowEditModal(true); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Edit size={18} />
                            Edit Tour
                          </button>
                          {tour.status !== 'completed' && (
                            <button
                              onClick={() => { setShowMenu(false); handleArchiveTour(); }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Archive size={18} />
                              Archive Tour
                            </button>
                          )}
                          <button
                            onClick={() => { setShowMenu(false); handleDuplicateTour(); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Copy size={18} />
                            Duplicate Tour
                          </button>
                          <button
                            onClick={() => { setShowMenu(false); handleSaveAsTemplate(); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <FileText size={18} />
                            Save as Template
                          </button>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={18} />
                            Delete Tour
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tour Dates</p>
                <p className="text-3xl font-bold text-gray-900">{dates.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Crew Members</p>
                <p className="text-3xl font-bold text-gray-900">{crew.length}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          {tour.budget && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(parseFloat(tour.budget), selectedCurrency)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          )}
          
          {tour.start_date && tour.end_date && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="text-lg font-bold text-gray-900">
                    {Math.ceil((new Date(tour.end_date) - new Date(tour.start_date)) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          )}
        </div>
        
        {/* Tour Dates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={20} />
              Tour Dates
            </h2>
            <Link
              href={`/touring/tours/${tourId}/dates/create`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              <Plus size={18} />
              Add Date
            </Link>
          </div>
          
          {dates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No tour dates yet</p>
              <Link href={`/touring/tours/${tourId}/dates/create`} className="mt-4 inline-block text-blue-600 hover:underline">Add your first date</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {dates.map((date) => (
                <Link
                  key={date.id}
                  href={`/touring/tours/${tourId}/dates/${date.id}`}
                  className="block"
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {new Date(date.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <MapPin size={14} />
                          {date.city}, {date.country}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {date.venue_id && (
                        <span className="text-sm text-gray-600">Venue: {date.venues?.name || 'Unknown'}</span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        date.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        date.status === 'hold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {date.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Crew */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users size={20} />
              Crew
            </h2>
            <Link
              href={`/touring/tours/${tourId}/crew/add`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              <Plus size={18} />
              Add Crew Member
            </Link>
          </div>
          
          {crew.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No crew members yet</p>
              <Link href={`/touring/tours/${tourId}/crew/add`} className="mt-4 inline-block text-blue-600 hover:underline">Add your first crew member</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {crew.map((member) => (
                <div key={member.id} className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{member.role}</p>
                  {member.email && (
                    <p className="text-sm text-gray-500 mt-1">{member.email}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Tour Modal */}
      {showEditModal && (
        <EditTourModal
          tour={tour}
          selectedCurrency={selectedCurrency}
          updateCurrency={updateCurrency}
          onSave={(updates) => handleUpdateTour(updates)}
          onClose={() => setShowEditModal(false)}
          loading={actionLoading}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Tour</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{tour.name}"? This action cannot be undone and will delete all related data (dates, crew, expenses, revenue, etc.).
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTour}
                disabled={actionLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete Tour'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Edit Tour Modal Component
function EditTourModal({ tour, selectedCurrency, updateCurrency, onSave, onClose, loading }) {
  const [formData, setFormData] = useState({
    name: tour.name,
    artist_name: tour.artist_name,
    start_date: tour.start_date || '',
    end_date: tour.end_date || '',
    description: tour.description || '',
    budget: tour.budget ? convertCurrency(parseFloat(tour.budget), 'GBP', selectedCurrency).toFixed(2) : '',
    tour_type: tour.tour_type || 'headline',
    status: tour.status || 'planning'
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert budget back to GBP
    const budgetInGBP = formData.budget 
      ? convertCurrency(parseFloat(formData.budget), selectedCurrency, 'GBP')
      : null;
    
    onSave({
      name: formData.name,
      artist_name: formData.artist_name,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      description: formData.description || null,
      budget: budgetInGBP,
      tour_type: formData.tour_type,
      status: formData.status
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Tour</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tour Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Artist Name *
            </label>
            <input
              type="text"
              required
              value={formData.artist_name}
              onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tour Type
              </label>
              <select
                value={formData.tour_type}
                onChange={(e) => setFormData({ ...formData, tour_type: e.target.value, tour_type_custom: e.target.value === 'other' ? formData.tour_type_custom : '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
              >
                {TOUR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              {formData.tour_type === 'other' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specify Tour Type
                  </label>
                  <input
                    type="text"
                    required={formData.tour_type === 'other'}
                    value={formData.tour_type_custom}
                    onChange={(e) => setFormData({ ...formData, tour_type_custom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Enter tour type (e.g., Acoustic Tour, Unplugged Session)"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Budget <span className="text-xs text-gray-500">(in {selectedCurrency})</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
                placeholder="0.00"
              />
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onCurrencyChange={updateCurrency}
                compact={true}
                showExchangeRate={false}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900"
            />
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

