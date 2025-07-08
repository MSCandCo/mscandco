import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function ArtistPortal() {
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/get-profile', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
        setFormData(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setUserProfile(formData);
        setEditing(false);
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Artist Portal</h1>
          <p className="text-gray-600 text-center mb-6">
            Please sign in to access your artist portal.
          </p>
          <button
            onClick={() => loginWithRedirect()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Artist Portal - AudioStems</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Artist Portal</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {userProfile?.firstName || user?.name || 'User'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Artist Profile</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stage Name
                    </label>
                    <input
                      type="text"
                      name="stageName"
                      value={formData.stageName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Artist Type
                    </label>
                    <select
                      name="artistType"
                      value={formData.artistType || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Artist Type</option>
                      <option value="solo artist">Solo Artist</option>
                      <option value="band">Band</option>
                      <option value="group">Group</option>
                      <option value="dj">DJ</option>
                      <option value="duo">Duo</option>
                      <option value="orchestra">Orchestra</option>
                      <option value="ensemble">Ensemble</option>
                      <option value="collective">Collective</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <select
                      name="genre"
                      value={formData.genre || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Genre</option>
                      <option value="pop">Pop</option>
                      <option value="rock">Rock</option>
                      <option value="hip-hop">Hip-Hop</option>
                      <option value="r&b">R&B</option>
                      <option value="country">Country</option>
                      <option value="electronic">Electronic</option>
                      <option value="jazz">Jazz</option>
                      <option value="classical">Classical</option>
                      <option value="folk">Folk</option>
                      <option value="blues">Blues</option>
                      <option value="reggae">Reggae</option>
                      <option value="punk">Punk</option>
                      <option value="metal">Metal</option>
                      <option value="indie">Indie</option>
                      <option value="alternative">Alternative</option>
                      <option value="world">World</option>
                      <option value="gospel">Gospel</option>
                      <option value="soul">Soul</option>
                      <option value="funk">Funk</option>
                      <option value="disco">Disco</option>
                      <option value="house">House</option>
                      <option value="techno">Techno</option>
                      <option value="trance">Trance</option>
                      <option value="dubstep">Dubstep</option>
                      <option value="drum-and-bass">Drum & Bass</option>
                      <option value="ambient">Ambient</option>
                      <option value="experimental">Experimental</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Status
                    </label>
                    <select
                      name="contractStatus"
                      value={formData.contractStatus || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Status</option>
                      <option value="pending">Pending</option>
                      <option value="signed">Signed</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="renewal">Renewal</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Signed
                    </label>
                    <input
                      type="date"
                      name="dateSigned"
                      value={formData.dateSigned || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Social Media Handles
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="socialMedia.instagram"
                      value={formData.socialMedia?.instagram || ''}
                      onChange={handleInputChange}
                      placeholder="Instagram"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="socialMedia.twitter"
                      value={formData.socialMedia?.twitter || ''}
                      onChange={handleInputChange}
                      placeholder="Twitter"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="socialMedia.facebook"
                      value={formData.socialMedia?.facebook || ''}
                      onChange={handleInputChange}
                      placeholder="Facebook"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="socialMedia.youtube"
                      value={formData.socialMedia?.youtube || ''}
                      onChange={handleInputChange}
                      placeholder="YouTube"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="socialMedia.tiktok"
                      value={formData.socialMedia?.tiktok || ''}
                      onChange={handleInputChange}
                      placeholder="TikTok"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager Information
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      name="managerInfo.name"
                      value={formData.managerInfo?.name || ''}
                      onChange={handleInputChange}
                      placeholder="Manager Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      name="managerInfo.email"
                      value={formData.managerInfo?.email || ''}
                      onChange={handleInputChange}
                      placeholder="Manager Email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      name="managerInfo.phone"
                      value={formData.managerInfo?.phone || ''}
                      onChange={handleInputChange}
                      placeholder="Manager Phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Further Information
                  </label>
                  <textarea
                    name="furtherInfo"
                    value={formData.furtherInfo || ''}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional information about your music, achievements, or any other details..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <p className="text-gray-900">{userProfile?.firstName || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <p className="text-gray-900">{userProfile?.lastName || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stage Name</label>
                    <p className="text-gray-900">{userProfile?.stageName || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Artist Type</label>
                    <p className="text-gray-900">{userProfile?.artistType || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{userProfile?.email || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <p className="text-gray-900">{userProfile?.phoneNumber || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                    <p className="text-gray-900">{userProfile?.genre || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Status</label>
                    <p className="text-gray-900">{userProfile?.contractStatus || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Signed</label>
                    <p className="text-gray-900">
                      {userProfile?.dateSigned ? new Date(userProfile.dateSigned).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>

                {userProfile?.socialMedia && Object.values(userProfile.socialMedia).some(handle => handle) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Social Media</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(userProfile.socialMedia).map(([platform, handle]) => (
                        handle && (
                          <div key={platform}>
                            <span className="text-sm font-medium text-gray-600 capitalize">{platform}:</span>
                            <p className="text-gray-900">{handle}</p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {userProfile?.managerInfo && (userProfile.managerInfo.name || userProfile.managerInfo.email || userProfile.managerInfo.phone) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manager Information</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {userProfile.managerInfo.name && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Name:</span>
                          <p className="text-gray-900">{userProfile.managerInfo.name}</p>
                        </div>
                      )}
                      {userProfile.managerInfo.email && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Email:</span>
                          <p className="text-gray-900">{userProfile.managerInfo.email}</p>
                        </div>
                      )}
                      {userProfile.managerInfo.phone && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Phone:</span>
                          <p className="text-gray-900">{userProfile.managerInfo.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {userProfile?.furtherInfo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Further Information</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{userProfile.furtherInfo}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 