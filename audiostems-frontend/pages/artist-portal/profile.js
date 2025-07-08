import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { Button, Card, Alert, Label, TextInput, Select, Textarea } from 'flowbite-react';
import { HiUser, HiCamera, HiCheck, HiX } from 'react-icons/hi';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ArtistProfilePage() {
  const { user, getAccessTokenSilently } = useAuth0();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [imagePreview, setImagePreview] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    stageName: '',
    email: '',
    phoneNumber: '',
    artistType: '',
    genre: '',
    contractStatus: '',
    dateSigned: '',
    socialMedia: {
      instagram: '',
      twitter: '',
      facebook: '',
      youtube: '',
      tiktok: '',
      spotify: ''
    },
    managerInfo: {
      name: '',
      email: '',
      phone: ''
    },
    additionalInfo: ''
  });

  const ARTIST_TYPES = [
    'Solo Artist', 'Band', 'Group', 'DJ', 'Duo', 'Orchestra', 'Ensemble', 'Collective'
  ];

  const GENRES = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Country', 'Jazz', 'Classical',
    'Blues', 'Folk', 'Reggae', 'Latin', 'Metal', 'Punk', 'Indie', 'Alternative',
    'Dance', 'House', 'Techno', 'Trap', 'Dubstep', 'Ambient', 'World', 'Gospel',
    'Soul', 'Funk', 'Disco', 'New Wave', 'Post-Punk', 'Grunge', 'Britpop', 'Trip Hop',
    'Drum & Bass', 'Garage', 'UK Garage', 'Dub', 'Roots Reggae', 'Ska', 'Punk Rock',
    'Hardcore Punk', 'Emo', 'Screamo', 'Metalcore', 'Death Metal', 'Black Metal',
    'Thrash Metal', 'Progressive Metal', 'Power Metal', 'Folk Metal', 'Symphonic Metal',
    'Industrial', 'Gothic', 'Darkwave', 'Synthwave', 'Vaporwave', 'Lo-Fi', 'Chillwave',
    'Dream Pop', 'Shoegaze', 'Post-Rock', 'Math Rock', 'Progressive Rock', 'Psychedelic Rock',
    'Blues Rock', 'Southern Rock', 'Country Rock', 'Folk Rock', 'Celtic', 'World Music',
    'Afrobeat', 'Highlife', 'Juju', 'Mbalax', 'Kizomba', 'Semba', 'Kuduro', 'Batuque',
    'Fado', 'Flamenco', 'Tango', 'Salsa', 'Merengue', 'Bachata', 'Cumbia', 'Vallenato',
    'Bossa Nova', 'Samba', 'MPB', 'Tropicalia', 'Choro', 'Forro', 'Axé', 'Pagode',
    'Funk Carioca', 'Baile Funk', 'Trap Latino', 'Reggaeton', 'Dembow', 'Bachatón',
    'Urbano Latino', 'Latin Pop', 'Latin Rock', 'Latin Alternative', 'Nueva Trova',
    'Nueva Canción', 'Trova', 'Son', 'Bolero', 'Ranchera', 'Mariachi', 'Norteño',
    'Banda', 'Corrido', 'Narcocorrido', 'Duranguense', 'Quebradita', 'Cumbia Norteña',
    'Tejano', 'Conjunto', 'Tex-Mex', 'Chicano Rock', 'Latin Jazz', 'Afro-Cuban Jazz',
    'Cuban Son', 'Rumba', 'Guaguancó', 'Yoruba', 'Santería', 'Palo', 'Arará', 'Abakuá',
    'Other'
  ];

  const CONTRACT_STATUSES = [
    'Pending', 'Signed', 'Active', 'Expired', 'Renewal', 'Inactive'
  ];

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('/api/auth/get-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.profile);
        if (data.profile.profileImage) {
          setImagePreview(data.profile.profileImage);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('Failed to load profile data');
      setMessageType('failure');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setMessageType('success');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
      setMessageType('failure');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <SEO pageTitle="Profile Management - AudioStems" />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Profile Management
                  </h1>
                  <p className="text-gray-600">
                    Update your artist information and contact details
                  </p>
                </div>
                <Button
                  color="gray"
                  onClick={() => router.push('/artist-portal')}
                >
                  Back to Portal
                </Button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <Alert color={messageType} className="mb-6">
                <div className="flex items-center">
                  {messageType === 'success' ? (
                    <HiCheck className="w-5 h-5 mr-2" />
                  ) : (
                    <HiX className="w-5 h-5 mr-2" />
                  )}
                  <span>{message}</span>
                </div>
              </Alert>
            )}

            {/* Profile Form */}
            <Card className="shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" value="First Name" />
                      <TextInput
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" value="Last Name" />
                      <TextInput
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stageName" value="Stage Name" />
                      <TextInput
                        id="stageName"
                        value={profileData.stageName}
                        onChange={(e) => handleInputChange('stageName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" value="Email" />
                      <TextInput
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber" value="Phone Number" />
                      <TextInput
                        id="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Photo */}
                <div>
                  <Label value="Profile Photo" />
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                      ) : (
                        <HiUser className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: Square image, 400x400px or larger
                      </p>
                    </div>
                  </div>
                </div>

                {/* Artist Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Artist Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="artistType" value="Artist Type" />
                      <Select
                        id="artistType"
                        value={profileData.artistType}
                        onChange={(e) => handleInputChange('artistType', e.target.value)}
                        required
                      >
                        <option value="">Select artist type</option>
                        {ARTIST_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="genre" value="Genre" />
                      <Select
                        id="genre"
                        value={profileData.genre}
                        onChange={(e) => handleInputChange('genre', e.target.value)}
                        required
                      >
                        <option value="">Select a genre</option>
                        {GENRES.map(genre => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="contractStatus" value="Contract Status" />
                      <Select
                        id="contractStatus"
                        value={profileData.contractStatus}
                        onChange={(e) => handleInputChange('contractStatus', e.target.value)}
                        required
                      >
                        <option value="">Select contract status</option>
                        {CONTRACT_STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dateSigned" value="Date Signed" />
                      <TextInput
                        id="dateSigned"
                        type="date"
                        value={profileData.dateSigned}
                        onChange={(e) => handleInputChange('dateSigned', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Social Media Handles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instagram" value="Instagram" />
                      <TextInput
                        id="instagram"
                        type="url"
                        value={profileData.socialMedia.instagram}
                        onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                        placeholder="https://instagram.com/yourusername"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter" value="Twitter" />
                      <TextInput
                        id="twitter"
                        type="url"
                        value={profileData.socialMedia.twitter}
                        onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                        placeholder="https://twitter.com/yourusername"
                      />
                    </div>
                    <div>
                      <Label htmlFor="facebook" value="Facebook" />
                      <TextInput
                        id="facebook"
                        type="url"
                        value={profileData.socialMedia.facebook}
                        onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                    <div>
                      <Label htmlFor="youtube" value="YouTube" />
                      <TextInput
                        id="youtube"
                        type="url"
                        value={profileData.socialMedia.youtube}
                        onChange={(e) => handleInputChange('socialMedia.youtube', e.target.value)}
                        placeholder="https://youtube.com/yourchannel"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tiktok" value="TikTok" />
                      <TextInput
                        id="tiktok"
                        type="url"
                        value={profileData.socialMedia.tiktok}
                        onChange={(e) => handleInputChange('socialMedia.tiktok', e.target.value)}
                        placeholder="https://tiktok.com/@yourusername"
                      />
                    </div>
                    <div>
                      <Label htmlFor="spotify" value="Spotify" />
                      <TextInput
                        id="spotify"
                        type="url"
                        value={profileData.socialMedia.spotify}
                        onChange={(e) => handleInputChange('socialMedia.spotify', e.target.value)}
                        placeholder="https://open.spotify.com/artist/yourid"
                      />
                    </div>
                  </div>
                </div>

                {/* Manager Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Manager Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="managerName" value="Manager Name" />
                      <TextInput
                        id="managerName"
                        value={profileData.managerInfo.name}
                        onChange={(e) => handleInputChange('managerInfo.name', e.target.value)}
                        placeholder="Manager's full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="managerEmail" value="Manager Email" />
                      <TextInput
                        id="managerEmail"
                        type="email"
                        value={profileData.managerInfo.email}
                        onChange={(e) => handleInputChange('managerInfo.email', e.target.value)}
                        placeholder="manager@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="managerPhone" value="Manager Phone" />
                      <TextInput
                        id="managerPhone"
                        value={profileData.managerInfo.phone}
                        onChange={(e) => handleInputChange('managerInfo.phone', e.target.value)}
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <Label htmlFor="additionalInfo" value="Additional Information" />
                  <Textarea
                    id="additionalInfo"
                    value={profileData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    placeholder="Any additional information about your music, career, or special requirements..."
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button
                    color="gray"
                    onClick={() => router.push('/artist-portal')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    color="blue"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
} 