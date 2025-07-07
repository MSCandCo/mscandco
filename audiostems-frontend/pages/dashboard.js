import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';

export default function ArtistDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    fetchArtistProfile();
  }, [session, status]);

  const fetchArtistProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/artists?filters[user][id][$eq]=${session.user.id}&populate=*`);
      
      if (response.data.data && response.data.data.length > 0) {
        setArtist(response.data.data[0]);
      } else {
        // If no artist profile exists, redirect to profile setup
        router.push('/artist-setup');
        return;
      }
    } catch (err) {
      console.error('Error fetching artist profile:', err);
      setError('Failed to load artist profile');
    } finally {
      setLoading(false);
    }
  };

  const getContractStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      signed: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      renewal: 'bg-orange-100 text-orange-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getArtistTypeLabel = (type) => {
    const labels = {
      solo_artist: 'Solo Artist',
      band_group: 'Band/Group',
      dj: 'DJ',
      duo: 'Duo',
      orchestra: 'Orchestra',
      ensemble: 'Ensemble',
      collective: 'Collective'
    };
    return labels[type] || type;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchArtistProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!artist) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Artist Dashboard - AudioStems</title>
        <meta name="description" content="Your artist dashboard for music distribution and publishing" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Artist Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => router.push('/artist-profile')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => router.push('/projects')}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Projects & Releases
                </button>
                <button 
                  onClick={() => router.push('/artist-earnings')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Earnings
                </button>
                <button 
                  onClick={() => router.push('/upload-music')}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  Upload Music
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Artist Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  {artist.attributes.profilePhoto ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}${artist.attributes.profilePhoto.data.attributes.url}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-4xl">🎵</span>
                    </div>
                  )}
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {artist.attributes.stageName}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {artist.attributes.firstName} {artist.attributes.lastName}
                  </p>
                  
                  <div className="mb-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {getArtistTypeLabel(artist.attributes.artistType)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>📧 {artist.attributes.email}</p>
                    {artist.attributes.phoneNumber && (
                      <p>📞 {artist.attributes.phoneNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contract Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Status</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getContractStatusColor(artist.attributes.contractStatus)}`}>
                      {artist.attributes.contractStatus.charAt(0).toUpperCase() + artist.attributes.contractStatus.slice(1)}
                    </span>
                    {artist.attributes.dateSigned && (
                      <p className="text-sm text-gray-600 mt-1">
                        Signed: {new Date(artist.attributes.dateSigned).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => router.push('/contract-details')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </div>

              {/* Genres */}
              {artist.attributes.genre && artist.attributes.genre.data && artist.attributes.genre.data.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {artist.attributes.genre.data.map((genre) => (
                      <span 
                        key={genre.id}
                        className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full"
                      >
                        {genre.attributes.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Media */}
              {artist.attributes.socialMediaHandles && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(artist.attributes.socialMediaHandles).map(([platform, handle]) => (
                      <div key={platform} className="flex items-center space-x-2">
                        <span className="text-gray-600 capitalize">{platform}:</span>
                        <a 
                          href={handle.startsWith('http') ? handle : `https://${handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {handle}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manager Information */}
              {artist.attributes.manager && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Manager</h3>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {artist.attributes.manager.name}</p>
                    <p><strong>Email:</strong> {artist.attributes.manager.email}</p>
                    {artist.attributes.manager.phoneNumber && (
                      <p><strong>Phone:</strong> {artist.attributes.manager.phoneNumber}</p>
                    )}
                    {artist.attributes.manager.company && (
                      <p><strong>Company:</strong> {artist.attributes.manager.company}</p>
                    )}
                    {artist.attributes.manager.website && (
                      <p><strong>Website:</strong> 
                        <a 
                          href={artist.attributes.manager.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 ml-1"
                        >
                          {artist.attributes.manager.website}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {artist.attributes.furtherInformation && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {artist.attributes.furtherInformation}
                  </p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => router.push('/upload-music')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎵</div>
                      <p className="font-medium">Upload New Music</p>
                      <p className="text-sm text-gray-600">Add your latest tracks</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/analytics')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📊</div>
                      <p className="font-medium">View Analytics</p>
                      <p className="text-sm text-gray-600">Track your performance</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/earnings')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">💰</div>
                      <p className="font-medium">Earnings</p>
                      <p className="text-sm text-gray-600">View your revenue</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/support')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">💬</div>
                      <p className="font-medium">Get Support</p>
                      <p className="text-sm text-gray-600">Contact our team</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 