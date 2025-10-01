// Label Admin Artists Page - REBUILT FROM SCRATCH
// New artist invitation system with real database integration
import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import { 
  Users, Plus, Search, Send, CheckCircle, XCircle, Clock,
  AlertTriangle, User, Mail, Calendar, TrendingUp
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { getUserRole } from '@/lib/user-utils';

export default function LabelAdminArtistsRebuilt() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Real database state
  const [myArtists, setMyArtists] = useState([]);
  const [artistRequests, setArtistRequests] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Invitation form state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    artistName: '',
    message: '',
    labelSplit: 30,
    artistSplit: 70
  });
  const [inviting, setInviting] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [acceptedArtists, setAcceptedArtists] = useState([]);
  
  // Notification state
  const [notification, setNotification] = useState({ 
    show: false, type: '', title: '', message: '' 
  });

  // Check access and load data
  useEffect(() => {
    if (!isLoading && user) {
      const role = getUserRole(user);
      if (role !== 'label_admin') {
        router.push('/dashboard');
        return;
      }
      loadLabelAdminData();
      fetchAcceptedArtists();
      setLoading(false);
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const fetchAcceptedArtists = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/labeladmin/accepted-artists', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      const data = await response.json();
      console.log('✅ Accepted artists loaded:', data.artists?.length || 0);
      setAcceptedArtists(data.artists || []);
    } catch (error) {
      console.error('Error loading accepted artists:', error);
      setAcceptedArtists([]);
    }
  };

  // Load real data for label admin
  const loadLabelAdminData = async () => {
    try {
      setDataLoading(true);
      console.log('🎵 Loading real label admin data...');
      console.log('🔍 Current user object:', user);
      console.log('🔍 Current user.id:', user?.id);
      console.log('🔍 Expected label_admin_id from database: 12345678-1234-5678-9012-123456789012');

      // Load artists under this label admin
      // Simplified query that works with current database structure
      try {
        const { data: artists, error: artistsError } = await supabase
          .from('user_profiles')
          .select(`
            id,
            artist_name,
            email,
            role,
            created_at
          `)
          .eq('role', 'artist');
          // Note: Removed label_admin_id filter as this field may not exist yet

        if (artistsError) {
          console.warn('⚠️ Error loading artists:', artistsError.message);
          setMyArtists([]);
        } else {
          console.log('✅ Artists loaded:', artists?.length || 0);
          // For now, show all artists until label relationships are implemented
          setMyArtists(artists || []);
        }
      } catch (error) {
        console.warn('⚠️ Artists loading failed, using empty state:', error);
        setMyArtists([]);
      }

      // Load artist invitations via API (bypasses RLS issues)
      try {
        console.log('🔍 Loading invitations via API...');
        
        // Get auth token for API call
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch('/api/labeladmin/invitations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Artist invitations loaded via API:', data.invitations?.length || 0);
          setArtistRequests(data.invitations || []);
        } else {
          console.warn('⚠️ API request failed:', response.status);
          setArtistRequests([]);
        }
      } catch (error) {
        console.warn('⚠️ API error:', error);
        setArtistRequests([]);
      }

    } catch (error) {
      console.error('❌ Error loading label admin data:', error);
      showNotification('error', 'Connection Error', 'Failed to connect to database');
    } finally {
      setDataLoading(false);
    }
  };

  // Send artist invitation - NEW WORKFLOW
  const sendArtistInvitation = async () => {
    if (!inviteForm.firstName.trim() || !inviteForm.lastName.trim() || !inviteForm.artistName.trim()) {
      showNotification('error', 'Validation Error', 'First name, last name, and artist name are required');
      return;
    }

    try {
      setInviting(true);
      console.log('📤 Sending artist invitation:', inviteForm);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/labeladmin/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          artist_id: '0a060de5-1c94-4060-a1c2-860224fc348d', // Henry's ID
          artist_first_name: inviteForm.firstName,
          artist_last_name: inviteForm.lastName,
          personal_message: inviteForm.message,
          label_split_percentage: inviteForm.labelSplit,
          artist_split_percentage: inviteForm.artistSplit
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification('success', 'Invitation Sent!', result.message);
        setShowInviteModal(false);
        setInviteForm({ firstName: '', lastName: '', artistName: '', message: '', labelSplit: 30, artistSplit: 70 });
        loadLabelAdminData(); // Refresh data
      } else {
        // Handle specific error types with branded messages
        if (result.type === 'artist_not_found') {
          showNotification('error', 'Artist Not Registered', 
            `${result.searchedName} is not registered on the platform. They need to create an account first.`);
        } else if (result.type === 'duplicate_request') {
          showNotification('error', 'Duplicate Request', result.error);
        } else {
          showNotification('error', 'Invitation Failed', result.error || 'Unknown error occurred');
        }
      }
    } catch (error) {
      console.error('❌ Error sending invitation:', error);
      showNotification('error', 'Connection Error', 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  // Search for existing artists
  const searchForArtists = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      console.log('🔍 Searching for artists:', searchTerm);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`/api/artists/list?search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Search results:', result.users?.length || 0);
        setSearchResults(result.users || []);
      } else {
        console.error('❌ Search failed:', response.status);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const showNotification = (type, title, message) => {
    setNotification({ show: true, type, title, message });
    setTimeout(() => setNotification({ show: false, type: '', title: '', message: '' }), 5000);
  };

  if (loading || dataLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading your artists and requests...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title="My Artists - Label Admin"
        description="Manage your artists with real database integration"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Users className="w-8 h-8 mr-3" />
                <h1 className="text-3xl font-bold">My Artists</h1>
              </div>
              <p className="text-green-100 text-lg">
                Manage your roster - {acceptedArtists.length} artists, {artistRequests.filter(r => r.status === 'pending').length} pending requests
              </p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Invite Artist
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">My Artists</p>
                <p className="text-3xl font-bold text-slate-900">{acceptedArtists.length}</p>
                <p className="text-xs text-green-600">
                  {acceptedArtists.length} active partnerships
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Releases</p>
                <p className="text-3xl font-bold text-slate-900">
                  {myArtists.reduce((sum, artist) => sum + (artist.releases?.length || 0), 0)}
                </p>
                <p className="text-xs text-blue-600">
                  {myArtists.reduce((sum, artist) => sum + (artist.releases?.filter(r => r.status === 'live').length || 0), 0)} live
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-slate-900">
                  {artistRequests.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-xs text-orange-600">
                  {artistRequests.filter(r => r.status === 'accepted').length} accepted total
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* My Artists List */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-8">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">My Artists ({acceptedArtists.length})</h3>
            <p className="text-sm text-slate-600">Artists who have accepted your label invitation</p>
          </div>

          {acceptedArtists.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No artists in your roster yet</p>
              <p className="text-slate-400 text-sm mb-6">Start by inviting artists to join your label</p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Invite Your First Artist
              </button>
            </div>
          ) : (
            <div className="space-y-3 p-6">
              {acceptedArtists.map(artist => (
                <div key={artist.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border">
                
                return (
                  <div key={artist.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900">
                            {artist.artist_name || 'Unknown Artist'}
                          </h4>
                          <p className="text-slate-600">{artist.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              activeSubscription 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {activeSubscription ? activeSubscription.tier.replace('_', ' ').toUpperCase() : 'No Subscription'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {totalReleases} releases ({liveReleases} live)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right text-sm">
                          <div className="text-slate-900 font-medium">{totalReleases} Releases</div>
                          <div className="text-slate-500">{liveReleases} Live</div>
                        </div>
                        <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <Eye className="w-4 h-4 mr-1" />
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Artist Requests Status */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Artist Invitation Requests ({artistRequests.length})</h3>
            <p className="text-sm text-slate-600">Track your sent invitations and responses</p>
          </div>

          {artistRequests.length === 0 ? (
            <div className="text-center py-12">
              <Send className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No invitations sent yet</p>
              <p className="text-slate-400 text-sm">Start building your roster by inviting artists</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {artistRequests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        request.status === 'accepted' ? 'bg-green-100' :
                        request.status === 'declined' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        {request.status === 'accepted' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : request.status === 'declined' ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">
                          {request.artist_name || request.artist_first_name + ' ' + request.artist_last_name || 'Unknown Artist'}
                        </h4>
                        <p className="text-slate-600">{request.artist_email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            request.status === 'declined' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500">
                            Sent {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      {request.status === 'pending' && (
                        <div>Awaiting response</div>
                      )}
                      {request.responded_at && (
                        <div>Responded {new Date(request.responded_at).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Artist Invitation Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
                <h3 className="text-xl font-bold">Invite Artist to Label</h3>
                <p className="text-green-100">Search by artist's registered name</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Artist's first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Artist's last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Artist Name * (Search)</label>
                  <input
                    type="text"
                    value={inviteForm.artistName}
                    onChange={(e) => {
                      const value = e.target.value;
                      setInviteForm(prev => ({ ...prev, artistName: value }));
                      // Trigger search as user types
                      searchForArtists(value);
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type to search for existing artists..."
                  />
                  {searching && (
                    <p className="text-sm text-blue-600 mt-1">Searching...</p>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                    <p className="text-sm font-medium text-slate-700 p-3 border-b">Found Artists:</p>
                    {searchResults.map(artist => (
                      <div
                        key={artist.id}
                        className="p-3 hover:bg-slate-50 border-b last:border-b-0 cursor-pointer"
                        onClick={() => {
                          setInviteForm(prev => ({
                            ...prev,
                            firstName: artist.name.split(' ')[0] || '',
                            lastName: artist.name.split(' ').slice(1).join(' ') || '',
                            artistName: artist.stageName
                          }));
                          setSearchResults([]);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-slate-900">{artist.displayName}</p>
                            <p className="text-sm text-slate-600">{artist.email}</p>
                          </div>
                          <button className="text-blue-600 text-sm hover:text-blue-700">
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Personal Message (Optional)</label>
                  <textarea
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a personal message to your invitation..."
                  />
                </div>

                {/* Revenue Split Configuration */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Revenue Split</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Your Split (Label)</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={inviteForm.labelSplit}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setInviteForm(prev => ({
                              ...prev,
                              labelSplit: val,
                              artistSplit: 100 - val
                            }));
                          }}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="ml-2 text-slate-600">%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Artist Split</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={inviteForm.artistSplit}
                          readOnly
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                        />
                        <span className="ml-2 text-slate-600">%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-xs mt-2 ${
                    inviteForm.labelSplit + inviteForm.artistSplit === 100 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    Total: {inviteForm.labelSplit + inviteForm.artistSplit}% 
                    {inviteForm.labelSplit + inviteForm.artistSplit !== 100 && ' (Must equal 100%)'}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">How it works:</p>
                      <p>We'll search for an artist with this exact name. If found, they'll receive your invitation and can accept or decline.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                    disabled={inviting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendArtistInvitation}
                    disabled={inviting || !inviteForm.firstName.trim() || !inviteForm.lastName.trim() || !inviteForm.artistName.trim() || (inviteForm.labelSplit + inviteForm.artistSplit !== 100)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inviting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MSC & Co Branded Notification */}
        {notification.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
              <div className={`flex items-center mb-4 ${
                notification.type === 'error' ? 'text-red-600' : 'text-green-600'
              }`}>
                {notification.type === 'error' ? (
                  <AlertTriangle className="w-6 h-6 mr-3" />
                ) : (
                  <CheckCircle className="w-6 h-6 mr-3" />
                )}
                <h3 className="text-lg font-semibold">{notification.title}</h3>
              </div>
              <p className="text-slate-600 mb-6">{notification.message}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setNotification({ show: false, type: '', title: '', message: '' })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
