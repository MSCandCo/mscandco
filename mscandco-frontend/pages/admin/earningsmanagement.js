// Company Admin Earnings Management Page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { requirePermission } from '@/lib/serverSidePermissions';
import { useUser } from '@/components/providers/SupabaseProvider';
import Layout from '../../components/layouts/mainLayout';
import AddEarningsForm from '../../components/admin/AddEarningsForm';
import { 
  Users, 
  DollarSign, 
  Music, 
  Search,
  TrendingUp
} from 'lucide-react';


// Server-side permission check BEFORE page renders
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, 'finance:earnings_management:read');

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

export default function EarningsManagement() {
  const router = useRouter();
  const { user, isLoading } = useUser();
    const [artists, setArtists] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Check permission
  
  // Fetch artists and label admins
  useEffect(() => {
    const fetchArtistsAndLabelAdmins = async () => {
      if (!user) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          console.error('No auth token available');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/admin/get-artists', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.success) {
          console.log('💰 Found artists/label admins for earnings management:', result.breakdown);
          setArtists(result.users || []);
          setSearchResults(result.users?.slice(0, 10) || []);
        } else {
          console.error('Failed to fetch artists:', result.error);
        }
      } catch (error) {
        console.error('Error loading artists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistsAndLabelAdmins();
  }, [user]);

  // Search functionality
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        setSearchResults(artists.slice(0, 10));
        setShowDropdown(false);
        return;
      }

      setSearching(true);
      setShowDropdown(true);

      const filtered = artists.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim().toLowerCase();
        const artistName = (user.artist_name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();

        return (
          fullName.includes(searchLower) ||
          artistName.includes(searchLower) ||
          email.includes(searchLower) ||
          (user.first_name || '').toLowerCase().includes(searchLower) ||
          (user.last_name || '').toLowerCase().includes(searchLower)
        );
      });

      setSearchResults(filtered.slice(0, 50));
      setSearching(false);
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, artists]);

  const handleDataUpdated = () => {
    console.log('💰 Earnings data updated for artist:', selectedArtist?.first_name);
    // Refresh earnings history when data is updated
    if (selectedArtist) {
      fetchEarningsHistory(selectedArtist.id);
    }
  };

  const handleEditStatus = (entry) => {
    setEditingEntry(entry);
    setShowEditModal(true);
  };

  const handleStatusUpdate = async (entryId, newStatus, paymentDate, notes) => {
    try {
      const response = await fetch('/api/admin/earnings/update-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry_id: entryId,
          status: newStatus,
          payment_date: paymentDate,
          notes: notes
        })
      });

      if (response.ok) {
        // Show success notification
        const successDiv = document.createElement('div');
        successDiv.innerHTML = `
          <div style="
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: #f0fdf4; 
            border-left: 4px solid #065f46; 
            padding: 16px 24px; 
            color: #065f46; 
            border-radius: 8px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
          ">
            Status updated successfully!
          </div>
        `;
        document.body.appendChild(successDiv);
        setTimeout(() => document.body.removeChild(successDiv), 3000);

        // Refresh earnings history
        fetchEarningsHistory(selectedArtist.id);
        setShowEditModal(false);
        setEditingEntry(null);
      } else {
        console.error('Failed to update status:', response.status);
        // Show error notification
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
          <div style="
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: #fef2f2; 
            border-left: 4px solid #991b1b; 
            padding: 16px 24px; 
            color: #991b1b; 
            border-radius: 8px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
          ">
            Failed to update status. Please try again.
          </div>
        `;
        document.body.appendChild(errorDiv);
        setTimeout(() => document.body.removeChild(errorDiv), 5000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Fetch earnings history for selected artist
  const fetchEarningsHistory = async (artistId) => {
    try {
      const response = await fetch(`/api/admin/earnings/list?artist_id=${artistId}`);
      const data = await response.json();
      
      if (data.success) {
        setEarningsHistory(data.earnings || []);
        console.log(`📊 Loaded ${data.earnings?.length || 0} earnings entries for artist`);
      } else {
        console.error('Failed to load earnings history:', data.error);
        setEarningsHistory([]);
      }
    } catch (error) {
      console.error('Error fetching earnings history:', error);
      setEarningsHistory([]);
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Earnings Management
              </h1>
              <p className="text-xl text-green-100 max-w-3xl mx-auto">
                Manage artist earnings data, financial metrics, platform revenue, and territory breakdowns
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Artist Selection Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center mb-6">
                  <Users className="w-6 h-6 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Select Artist</h2>
                </div>

                {/* Search Dropdown */}
                <div className="relative">
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
                    <input
                      type="text"
                      placeholder="Search by name, artist name, or email..."
                      value={selectedArtist ? 
                        `${selectedArtist.artist_name || `${selectedArtist.first_name || ''} ${selectedArtist.last_name || ''}`.trim() || selectedArtist.email}` 
                        : searchTerm
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchTerm(value);
                        if (selectedArtist) {
                          setSelectedArtist(null);
                        }
                      }}
                      onFocus={() => {
                        if (!selectedArtist && searchTerm.trim()) {
                          setShowDropdown(true);
                        }
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    />
                    {searching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Dropdown Results */}
                  {showDropdown && searchTerm && !selectedArtist && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-lg shadow-lg mt-1 z-50 max-h-80 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        <>
                          <div className="px-3 py-2 text-xs text-slate-500 bg-slate-50 border-b">
                            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                          </div>
                          {searchResults.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => {
                                setSelectedArtist(user);
                                setSearchTerm('');
                                setShowDropdown(false);
                                fetchEarningsHistory(user.id);
                              }}
                              className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                  <Music className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-slate-900 truncate">
                                    {user.artist_name || 
                                     (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email)
                                    }
                                  </p>
                                  <div className="flex items-center text-xs text-slate-600 space-x-2">
                                    <span className="truncate">{user.email}</span>
                                    <span className={`px-2 py-1 rounded-full whitespace-nowrap text-xs font-medium ${
                                      user.role === 'artist' 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {user.role === 'artist' ? 'Artist' : 'Label Admin'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="p-4 text-center text-slate-500">
                          <Music className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm">No users found</p>
                          <p className="text-xs mt-1">Try searching by name, artist name, or email</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected User Display */}
                {selectedArtist && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <Music className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {selectedArtist.artist_name || 
                             (selectedArtist.first_name && selectedArtist.last_name 
                               ? `${selectedArtist.first_name} ${selectedArtist.last_name}` 
                               : selectedArtist.email)
                            }
                          </p>
                          <p className="text-sm text-slate-600">{selectedArtist.email}</p>
                          <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                            selectedArtist.role === 'artist' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {selectedArtist.role === 'artist' ? 'Artist Profile' : 'Label Admin Profile'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedArtist(null);
                          setSearchTerm('');
                          setShowDropdown(false);
                        }}
                        className="text-slate-400 hover:text-slate-600 p-1 text-xl"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Recent Users */}
                {!searchTerm && !selectedArtist && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Users ({Math.min(artists.length, 10)})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {artists.slice(0, 10).map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            setSelectedArtist(user);
                            fetchEarningsHistory(user.id);
                          }}
                          className="w-full text-left p-3 rounded-lg transition-colors bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-200"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <Music className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900 truncate">
                                {user.artist_name || 
                                 (user.first_name && user.last_name 
                                   ? `${user.first_name} ${user.last_name}` 
                                   : user.email)
                                }
                              </p>
                              <p className="text-xs text-slate-600 truncate">{user.email}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ml-2 font-medium ${
                              user.role === 'artist' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {user.role === 'artist' ? 'Artist' : 'Label Admin'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {artists.length > 10 && (
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Type to search {artists.length - 10} more users...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Earnings Management Panel */}
            <div className="lg:col-span-2">
              {selectedArtist ? (
                <div className="space-y-6">
                  {/* Selected Artist Header */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                          <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">
                            {selectedArtist.first_name} {selectedArtist.last_name}
                          </h2>
                          <p className="text-slate-600">{selectedArtist.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Earnings Management
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Wallet History */}
                  <div className="mb-8 bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <h3 className="text-lg font-bold mb-4" style={{color: '#1f2937'}}>
                      Wallet History ({earningsHistory.length} entries)
                    </h3>
                    {earningsHistory.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {earningsHistory.map(entry => (
                          <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-1">
                                <span className="font-semibold" style={{color: '#1f2937'}}>{entry.platform}</span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                                  background: entry.status === 'paid' ? '#f0fdf4' : '#fef3c7',
                                  color: entry.status === 'paid' ? '#065f46' : '#78350f'
                                }}>
                                  {entry.earning_type}
                                </span>
                              </div>
                              <p className="text-sm" style={{color: '#64748b'}}>
                                {entry.territory} • {new Date(entry.created_at).toLocaleDateString()}
                              </p>
                              {entry.notes && (
                                <p className="text-xs mt-1" style={{color: '#9ca3af'}}>{entry.notes}</p>
                              )}
                            </div>
                            <div className="text-right flex items-center space-x-3">
                              <div>
                                <p className="font-bold" style={{color: '#1f2937'}}>
                                  £{Math.abs(entry.amount).toFixed(2)}
                                </p>
                                <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                                  background: entry.status === 'paid' ? '#f0fdf4' : entry.status === 'pending' ? '#fef3c7' : '#fee2e2',
                                  color: entry.status === 'paid' ? '#065f46' : entry.status === 'pending' ? '#78350f' : '#991b1b'
                                }}>
                                  {entry.status}
                                </span>
                              </div>
                              <button
                                onClick={() => handleEditStatus(entry)}
                                className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs font-medium"
                                title="Edit Status"
                              >
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.828-2.828z" />
                                </svg>
                                Edit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <DollarSign className="w-12 h-12 mx-auto mb-3" style={{color: '#9ca3af'}} />
                        <p style={{color: '#64748b'}}>No wallet history found</p>
                        <p className="text-sm mt-1" style={{color: '#9ca3af'}}>
                          Earnings and payouts will appear here after being added
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Add Earnings Form */}
                  <AddEarningsForm 
                    selectedArtistId={selectedArtist.id}
                    selectedArtistData={selectedArtist}
                    onDataUpdated={handleDataUpdated}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Select an Artist</h2>
                  <p className="text-slate-600 mb-8">
                    Choose an artist from the left panel to manage their earnings data, 
                    financial metrics, platform revenue, and territory breakdowns.
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Earnings Metrics
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Platform Revenue
                    </div>
                    <div className="flex items-center">
                      <Music className="w-4 h-4 mr-1" />
                      Territory Data
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Status Modal */}
      {showEditModal && editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Entry Status</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <EditStatusForm 
              entry={editingEntry}
              onSubmit={handleStatusUpdate}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}

// Status Edit Form Component
function EditStatusForm({ entry, onSubmit, onCancel }) {
  const [status, setStatus] = useState(entry.status);

  // Format payment_date to YYYY-MM-DD for date input
  const formatDateForInput = (dateStr) => {
    // Return empty string for null/undefined/empty
    if (!dateStr || dateStr === '' || dateStr === 'null' || dateStr === 'undefined') {
      return '';
    }

    // If it's already in YYYY-MM-DD format, return as-is
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (datePattern.test(dateStr)) {
      return dateStr;
    }

    // Try to parse and format
    try {
      const date = new Date(dateStr);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateStr);
        return '';
      }
      const formatted = date.toISOString().split('T')[0];
      // Final validation
      if (!datePattern.test(formatted)) {
        console.warn('Formatted date invalid:', formatted);
        return '';
      }
      return formatted;
    } catch (error) {
      console.error('Error formatting date:', dateStr, error);
      return '';
    }
  };

  // Initialize with formatted date using lazy initializer
  const [paymentDate, setPaymentDate] = useState(() => formatDateForInput(entry.payment_date));
  const [notes, setNotes] = useState(entry.notes || '');
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-700' },
    { value: 'processing', label: 'Processing', color: 'text-blue-700' },
    { value: 'paid', label: 'Paid', color: 'text-green-700' },
    { value: 'held', label: 'Held', color: 'text-red-700' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-gray-700' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    await onSubmit(entry.id, status, paymentDate, notes);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm font-medium text-gray-700">{entry.platform}</p>
        <p className="text-lg font-bold text-gray-900">£{Math.abs(entry.amount).toFixed(2)}</p>
        <p className="text-xs text-gray-600">{entry.earning_type} • {entry.territory}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {status === 'paid' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
          <input
            type="date"
            value={paymentDate || ''}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add any notes about this status change..."
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Status'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
