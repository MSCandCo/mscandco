import { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Layout from '../../components/layouts/mainLayout';
import { FaPlus, FaMusic, FaChartLine, FaDollarSign } from 'react-icons/fa';
import { Plus, Music, TrendingUp, DollarSign } from 'lucide-react';
import { getEmptyArtists, getEmptyReleases, EMPTY_STATES } from '../../lib/emptyStates';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import SuccessModal from '../../components/shared/SuccessModal';

export default function LabelAdminArtists() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showAddArtist, setShowAddArtist] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [artistFilter, setArtistFilter] = useState('all');
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [selectedArtistForForm, setSelectedArtistForForm] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [labelPlan, setLabelPlan] = useState('starter'); // 'starter' or 'pro'

  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Detect Label Admin plan for artist limits
  useEffect(() => {
    if (user?.sub) {
      const hasUpgraded = localStorage.getItem(`label_admin_upgraded_${user.sub}`) === 'true';
      setLabelPlan(hasUpgraded ? 'pro' : 'starter');
      console.log('🎯 LABEL ADMIN PLAN CHECK:', { userId: user.sub, hasUpgraded, plan: hasUpgraded ? 'pro' : 'starter' });
    }
  }, [user?.sub]);

  // Available artists data for the dropdown
  const availableArtists = {
    'gospel-collective': {
      firstName: 'Marcus',
      lastName: 'Johnson',
      artistName: 'Gospel Voices Collective',
      name: 'Gospel Voices Collective',
      email: 'contact@gospelvoices.com',
      genre: 'Gospel',
      location: 'Atlanta, GA',
      bio: 'A powerful gospel collective bringing traditional and contemporary sounds together.',
      joinDate: '2022-03-15',
      status: 'Available'
    },
    'harmony-group': {
      firstName: 'Sophia',
      lastName: 'Williams',
      artistName: 'Vocal Harmony',
      name: 'Vocal Harmony',
      email: 'bookings@vocalharmony.com',
      genre: 'R&B/Soul',
      location: 'Detroit, MI',
      bio: 'Smooth R&B harmonies with a modern twist on classic soul music.',
      joinDate: '2021-11-20',
      status: 'Available'
    },
    'jazz-ensemble': {
      firstName: 'Antoine',
      lastName: 'Baptiste',
      artistName: 'Jazz Ensemble Pro',
      name: 'Jazz Ensemble Pro',
      email: 'info@jazzensemblepro.com',
      genre: 'Jazz',
      location: 'New Orleans, LA',
      bio: 'Professional jazz ensemble specializing in contemporary and traditional jazz.',
      joinDate: '2020-08-10',
      status: 'Available'
    },
    'hip-hop-artist': {
      firstName: 'Jaylen',
      lastName: 'Rodriguez',
      artistName: 'Urban Flow Artist',
      name: 'Urban Flow Artist',
      email: 'contact@urbanflow.com',
      genre: 'Hip Hop',
      location: 'Los Angeles, CA',
      bio: 'Rising hip hop artist with innovative flow and conscious lyrics.',
      joinDate: '2023-01-05',
      status: 'Available'
    },
    'classical-performer': {
      firstName: 'Elena',
      lastName: 'Petrov',
      artistName: 'Classical Symphony',
      name: 'Classical Symphony',
      email: 'bookings@classicalsymphony.com',
      genre: 'Classical',
      location: 'Boston, MA',
      bio: 'Elite classical performer with expertise in orchestral and solo performances.',
      joinDate: '2019-06-30',
      status: 'Available'
    },
    'rnb-singer': {
      firstName: 'Keisha',
      lastName: 'Thompson',
      artistName: 'R&B Soul Singer',
      name: 'R&B Soul Singer',
      email: 'management@rnbsoul.com',
      genre: 'R&B',
      location: 'Chicago, IL',
      bio: 'Soulful R&B vocalist with powerful range and emotional depth.',
      joinDate: '2022-09-12',
      status: 'Available'
    },
    'pop-artist': {
      firstName: 'Madison',
      lastName: 'Carter',
      artistName: 'Pop Star Rising',
      name: 'Pop Star Rising',
      email: 'team@popstarrising.com',
      genre: 'Pop',
      location: 'Nashville, TN',
      bio: 'Emerging pop artist with catchy melodies and mainstream appeal.',
      joinDate: '2023-04-18',
      status: 'Available'
    },
    'rock-band': {
      firstName: 'Jake',
      lastName: 'Morrison',
      artistName: 'Rock Revolution',
      name: 'Rock Revolution',
      email: 'contact@rockrevolution.com',
      genre: 'Rock',
      location: 'Seattle, WA',
      bio: 'High-energy rock band bringing fresh sound to classic rock traditions.',
      joinDate: '2021-07-22',
      status: 'Available'
    },
    'electronic-producer': {
      firstName: 'Carlos',
      lastName: 'Mendez',
      artistName: 'Electronic Beats',
      name: 'Electronic Beats',
      email: 'bookings@electronicbeats.com',
      genre: 'Electronic',
      location: 'Miami, FL',
      bio: 'Electronic music producer creating innovative soundscapes and dance tracks.',
      joinDate: '2022-12-03',
      status: 'Available'
    },
    'indie-artist': {
      firstName: 'Luna',
      lastName: 'Mitchell',
      artistName: 'Indie Folk Artist',
      name: 'Indie Folk Artist',
      email: 'hello@indiefolk.com',
      genre: 'Indie Folk',
      location: 'Portland, OR',
      bio: 'Authentic indie folk artist with heartfelt lyrics and acoustic arrangements.',
      joinDate: '2023-02-14',
      status: 'Available'
    },
    'country-singer': {
      firstName: 'Blake',
      lastName: 'Henderson',
      artistName: 'Country Roads Singer',
      name: 'Country Roads Singer',
      email: 'booking@countryroads.com',
      genre: 'Country',
      location: 'Austin, TX',
      bio: 'Traditional country singer with modern storytelling and authentic sound.',
      joinDate: '2021-05-08',
      status: 'Available'
    },
    'reggae-band': {
      firstName: 'Damian',
      lastName: 'Brown',
      artistName: 'Reggae Vibes Band',
      name: 'Reggae Vibes Band',
      email: 'contact@reggaevibes.com',
      genre: 'Reggae',
      location: 'Kingston, Jamaica',
      bio: 'Authentic reggae band spreading positive vibes and conscious messages.',
      joinDate: '2020-10-25',
      status: 'Available'
    }
  };

  // Get label artists from centralized data
  const labelArtists = useMemo(() => {
    const users = getUsers();
    const releases = getReleases();
    const userLabelId = userBrand?.id || 'yhwh_msc';
    
    const filteredArtists = users.filter(artist => 
      artist.role === 'artist' &&
      (artist.approvalStatus === 'approved' || artist.approvalStatus === 'pending') && 
      artist.labelId === userLabelId
    );
    
    return filteredArtists.map(artist => {
      // Only calculate sensitive data for approved artists
      if (artist.approvalStatus === 'approved') {
        const artistReleases = releases.filter(release => release.artistId === artist.id);
        const totalEarnings = artistReleases.reduce((sum, release) => sum + (release.earnings || 0), 0);
        const totalStreams = artistReleases.reduce((sum, release) => sum + (release.streams || 0), 0);
        
        return {
          ...artist,
          releases: artistReleases.length,
          totalEarnings,
          totalStreams,
          followers: artist.followers || 0,
          lastRelease: artistReleases.length > 0 ? 
            artistReleases.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))[0].submissionDate : 
            null,
          avatar: artist.avatar || '🎤'
        };
      } else {
        // For pending artists, hide sensitive information
        return {
          ...artist,
          releases: null,
          totalEarnings: null,
          totalStreams: null,
          followers: null,
          lastRelease: null,
          avatar: artist.avatar || '🎤'
        };
      }
    });
  }, [userBrand]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || userRole !== 'label_admin') {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  // Filter artists based on search and filters
  const filteredArtists = labelArtists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (artist.primaryGenre && artist.primaryGenre.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (artist.genres && artist.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStatus = statusFilter === 'all' || artist.approvalStatus === statusFilter;
    const matchesArtist = artistFilter === 'all' || artist.name === artistFilter;
    
    return matchesSearch && matchesStatus && matchesArtist;
  });

  // Calculate label totals (only approved artists)
  const approvedArtists = labelArtists.filter(a => a.approvalStatus === 'approved');
  const pendingArtists = labelArtists.filter(a => a.approvalStatus === 'pending');
  
  const labelTotals = {
    totalArtists: labelArtists.length,
    approvedArtists: approvedArtists.length,
    pendingArtists: pendingArtists.length,
    totalEarnings: approvedArtists.reduce((sum, artist) => sum + (artist.totalEarnings || 0), 0),
    totalStreams: approvedArtists.reduce((sum, artist) => sum + (artist.totalStreams || 0), 0),
    totalFollowers: approvedArtists.reduce((sum, artist) => sum + (artist.followers || 0), 0),
    totalReleases: approvedArtists.reduce((sum, artist) => sum + (artist.releases || 0), 0)
  };

  // 🎯 Calculate artist counts for starter plan limits
  const artistCount = useMemo(() => {
    const currentArtists = labelArtists.length;
    const maxArtists = labelPlan === 'starter' ? 5 : Infinity;
    const remaining = Math.max(0, maxArtists - currentArtists);
    
    return {
      current: currentArtists,
      remaining: remaining,
      maxArtists: maxArtists,
      isLimited: labelPlan === 'starter'
    };
  }, [labelArtists, labelPlan]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Artists</h1>
                <p className="text-sm text-gray-500">Manage your label's artists and their releases</p>
                {artistCount.isLimited && (
                  <div className="mt-3 flex items-center space-x-2">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      artistCount.remaining > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <span>Artists Remaining: {artistCount.remaining} / {artistCount.maxArtists}</span>
                    </div>
                    {artistCount.remaining === 0 && (
                      <span className="text-sm text-red-600">
                        Upgrade to Pro for unlimited artists
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAddArtist(true)}
                disabled={artistCount.isLimited && artistCount.remaining === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  artistCount.isLimited && artistCount.remaining === 0
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add Artist
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Artists</p>
                  <p className="text-2xl font-bold text-gray-900">{labelTotals.totalArtists}</p>
                </div>
                <Music className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Artists</p>
                  <p className="text-2xl font-bold text-gray-900">{labelTotals.approvedArtists}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-gray-900">{labelTotals.pendingArtists}</p>
                </div>
                <div className="w-8 h-8 text-yellow-600">⏳</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(labelTotals.totalEarnings, selectedCurrency)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Streams</p>
                  <p className="text-2xl font-bold text-gray-900">{labelTotals.totalStreams.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Followers</p>
                  <p className="text-2xl font-bold text-gray-900">{labelTotals.totalFollowers.toLocaleString()}</p>
                </div>
                <Music className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search artists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Approval Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Artists</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Artist</label>
                <select
                  value={artistFilter}
                  onChange={(e) => setArtistFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Artists</option>
                  {labelArtists.map(artist => (
                    <option key={artist.id} value={artist.name}>{artist.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setArtistFilter('all');
                  }}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Artists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => (
              <div key={artist.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                      {artist.avatar}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{artist.name}</h3>
                      <p className="text-sm text-gray-500">{artist.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    artist.approvalStatus === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {artist.approvalStatus === 'approved' ? 'Approved' : 'Pending Approval'}
                  </span>
                </div>
                
                {artist.approvalStatus === 'approved' ? (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Releases</p>
                      <p className="text-lg font-semibold text-gray-900">{artist.releases}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Earnings</p>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(artist.totalEarnings, selectedCurrency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Streams</p>
                      <p className="text-lg font-semibold text-gray-900">{artist.totalStreams.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Followers</p>
                      <p className="text-lg font-semibold text-gray-900">{artist.followers.toLocaleString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <div className="text-yellow-400 mr-3">⏳</div>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Pending Approval</h4>
                        <p className="text-sm text-yellow-700">
                          Artist information will be available after approval is completed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Genre:</span>
                    <span className="font-medium">{artist.genre}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-medium">{artist.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Release:</span>
                    <span className="font-medium">{artist.lastRelease}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">Joined: {artist.joinDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Artist Modal */}
      {showAddArtist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Artist</h2>
                <button
                  onClick={() => {
                    setShowAddArtist(false);
                    setSelectedArtistForForm('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {/* Artist Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Artist *
                  </label>
                  <select 
                    required
                    value={selectedArtistForForm}
                    onChange={(e) => setSelectedArtistForForm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-sans"
                  >
                    <option value="">Choose an artist to add to your label</option>
                    <option value="gospel-collective">Gospel Voices Collective</option>
                    <option value="harmony-group">Vocal Harmony</option>
                    <option value="jazz-ensemble">Jazz Ensemble Pro</option>
                    <option value="hip-hop-artist">Urban Flow Artist</option>
                    <option value="classical-performer">Classical Symphony</option>
                    <option value="rnb-singer">R&B Soul Singer</option>
                    <option value="pop-artist">Pop Star Rising</option>
                    <option value="rock-band">Rock Revolution</option>
                    <option value="electronic-producer">Electronic Beats</option>
                    <option value="indie-artist">Indie Folk Artist</option>
                    <option value="country-singer">Country Roads Singer</option>
                    <option value="reggae-band">Reggae Vibes Band</option>
                  </select>
                </div>

                {/* Selected Artist Information */}
                {selectedArtistForForm && availableArtists[selectedArtistForForm] && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Artist Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">First Name</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 border border-gray-200 rounded">
                          {availableArtists[selectedArtistForForm].firstName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Last Name</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 border border-gray-200 rounded">
                          {availableArtists[selectedArtistForForm].lastName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Artist Name</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 border border-gray-200 rounded">
                          {availableArtists[selectedArtistForForm].artistName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Genre</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 border border-gray-200 rounded">
                          {availableArtists[selectedArtistForForm].genre}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Location</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 border border-gray-200 rounded">
                          {availableArtists[selectedArtistForForm].location}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Member Since</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 border border-gray-200 rounded">
                          {availableArtists[selectedArtistForForm].joinDate}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Status</label>
                        <p className="text-sm text-gray-900 bg-white px-3 py-2 border border-gray-200 rounded">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {availableArtists[selectedArtistForForm].status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-600">Bio</label>
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 border border-gray-200 rounded mt-1">
                        {availableArtists[selectedArtistForForm].bio}
                      </p>
                    </div>
                  </div>
                )}

                {/* Contract Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Type *
                    </label>
                    <select 
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-sans"
                    >
                      <option value="">Select Contract Type</option>
                      <option value="recording">Recording Contract</option>
                      <option value="distribution">Distribution Deal</option>
                      <option value="management">Management Contract</option>
                      <option value="publishing">Publishing Deal</option>
                      <option value="360">360 Deal</option>
                      <option value="licensing">Licensing Agreement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Royalty Split (%) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-sans"
                      placeholder="50.0"
                    />
                  </div>
                </div>

                {/* Other Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Information
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-sans"
                    placeholder="Additional notes, contract details, special terms, or other relevant information..."
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddArtist(false);
                      setSelectedArtistForForm('');
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      // Here you would normally submit the form data to assign artist to label
                      if (selectedArtistForForm) {
                        const artistName = availableArtists[selectedArtistForForm].name;
                        setSuccessMessage(`${artistName} has been successfully added to your label!`);
                      } else {
                        setSuccessMessage('Artist has been successfully added to your label!');
                      }
                      setShowAddArtist(false);
                      setSelectedArtistForForm('');
                      setShowSuccessModal(true);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-sans"
                  >
                    Add Artist
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - Temporarily Disabled for Debugging */}
      {false && (
        <SuccessModal
          isOpen={showSuccessModal && successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessMessage('');
          }}
          title="Success!"
          message={successMessage}
          buttonText="Close"
        />
      )}
    </Layout>
  );
} 