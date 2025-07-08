import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Label, TextInput, Textarea, Select, Alert, Card, Badge } from 'flowbite-react';
import { 
  HiUser, HiGlobe, HiMusic, HiInformationCircle, HiCamera, 
  HiMail, HiPhone, HiCalendar, HiLink, HiSave, HiX,
  HiInstagram, HiTwitter, HiFacebook, HiYoutube, HiSpotify
} from 'react-icons/hi';

// Validation Schema
const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  stageName: Yup.string().required('Stage name is required'),
  email: Yup.string().email('Please enter a valid email').required('Email is required'),
  phone: Yup.string(),
  artistType: Yup.string().required('Artist type is required'),
  genre: Yup.string().required('Genre is required'),
  contractStatus: Yup.string().required('Contract status is required'),
  dateSigned: Yup.date(),
  socialMedia: Yup.object({
    instagram: Yup.string().url('Please enter a valid Instagram URL'),
    twitter: Yup.string().url('Please enter a valid Twitter URL'),
    facebook: Yup.string().url('Please enter a valid Facebook URL'),
    spotify: Yup.string().url('Please enter a valid Spotify URL'),
    appleMusic: Yup.string().url('Please enter a valid Apple Music URL'),
    soundcloud: Yup.string().url('Please enter a valid SoundCloud URL'),
    youtube: Yup.string().url('Please enter a valid YouTube URL'),
    tiktok: Yup.string().url('Please enter a valid TikTok URL')
  }),
  manager: Yup.string(),
  furtherInformation: Yup.string().max(1000, 'Additional information must be less than 1000 characters')
});

// Data Constants
const ARTIST_TYPES = [
  'Solo Artist', 'Band', 'Group', 'DJ', 'Duo', 'Orchestra', 'Ensemble', 'Collective',
  'Producer', 'Composer', 'Songwriter', 'Session Musician', 'Backing Vocalist',
  'Instrumentalist', 'Vocalist', 'Multi-Instrumentalist', 'Arranger', 'Conductor'
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
  'Pending', 'Signed', 'Active', 'Expired', 'Renewal', 'Inactive', 'Terminated'
];

export default function ArtistProfile() {
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    } else if (!isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, user]);

  const fetchProfile = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`/api/artist/get-profile?user_id=${user.sub}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        if (data.profile?.profileImage) {
          setImagePreview(data.profile.profileImage);
        }
      } else {
        // If no profile exists, create initial profile from Auth0 user data
        setProfile({
          firstName: user.given_name || '',
          lastName: user.family_name || '',
          stageName: user.user_metadata?.stageName || '',
          email: user.email || '',
          phone: user.phone_number || '',
          artistType: '',
          genre: '',
          contractStatus: '',
          dateSigned: '',
          socialMedia: {
            instagram: '',
            twitter: '',
            facebook: '',
            spotify: '',
            appleMusic: '',
            soundcloud: '',
            youtube: '',
            tiktok: ''
          },
          manager: '',
          furtherInformation: '',
          profileImage: user.picture || '',
          profileComplete: false
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setSaving(true);
    try {
      const formData = new FormData();
      
      // Add user ID
      formData.append('user_id', user.sub);
      
      // Add profile image if selected
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      // Add all form data
      Object.keys(values).forEach(key => {
        if (key === 'socialMedia') {
          formData.append(key, JSON.stringify(values[key]));
        } else {
          formData.append(key, values[key]);
        }
      });

      const token = await getAccessTokenSilently();
      const response = await fetch('/api/artist/update-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setAlert({
          show: true,
          type: 'success',
          message: 'Profile updated successfully!'
        });
        
        // Update Auth0 user if email/phone changed
        if (values.email !== user.email || values.phone !== user.phone_number) {
          await updateAuth0User(values);
        }
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      setErrors({ submit: error.message });
      setAlert({
        show: true,
        type: 'failure',
        message: 'Failed to update profile. Please try again.'
      });
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  const updateAuth0User = async (values) => {
    try {
      const token = await getAccessTokenSilently();
      await fetch('/api/auth/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: user.sub,
          email: values.email,
          phone_number: values.phone
        })
      });
    } catch (error) {
      console.error('Error updating Auth0 user:', error);
    }
  };

  const initialValues = {
    firstName: profile?.firstName || user?.given_name || '',
    lastName: profile?.lastName || user?.family_name || '',
    stageName: profile?.stageName || user?.user_metadata?.stageName || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || user?.phone_number || '',
    artistType: profile?.artistType || '',
    genre: profile?.genre || '',
    contractStatus: profile?.contractStatus || '',
    dateSigned: profile?.dateSigned || '',
    socialMedia: {
      instagram: profile?.socialMedia?.instagram || '',
      twitter: profile?.socialMedia?.twitter || '',
      facebook: profile?.socialMedia?.facebook || '',
      spotify: profile?.socialMedia?.spotify || '',
      appleMusic: profile?.socialMedia?.appleMusic || '',
      soundcloud: profile?.socialMedia?.soundcloud || '',
      youtube: profile?.socialMedia?.youtube || '',
      tiktok: profile?.socialMedia?.tiktok || ''
    },
    manager: profile?.manager || '',
    furtherInformation: profile?.furtherInformation || ''
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Artist Profile - AudioStems</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Artist Portal</h1>
                <Badge color="blue" className="ml-3">Profile</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.name || 'Artist'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Alert */}
          {alert.show && (
            <Alert
              color={alert.type}
              className="mb-6"
              onDismiss={() => setAlert({ show: false, type: 'success', message: '' })}
            >
              {alert.message}
            </Alert>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, errors, touched, values }) => (
              <Form className="space-y-8">
                {/* Profile Photo Section */}
                <Card className="p-6">
                  <div className="flex items-center mb-6">
                    <HiCamera className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Profile Photo</h2>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <HiUser className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <HiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <Label htmlFor="profileImage" value="Upload Profile Photo" />
                      <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Recommended size: 400x400 pixels. Max file size: 5MB.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Personal Information */}
                <Card className="p-6">
                  <div className="flex items-center mb-6">
                    <HiUser className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" value="First Name" />
                      <Field
                        as={TextInput}
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        color={touched.firstName && errors.firstName ? "failure" : "gray"}
                        helperText={touched.firstName && errors.firstName}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="lastName" value="Last Name" />
                      <Field
                        as={TextInput}
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        color={touched.lastName && errors.lastName ? "failure" : "gray"}
                        helperText={touched.lastName && errors.lastName}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="stageName" value="Stage Name" />
                      <Field
                        as={TextInput}
                        id="stageName"
                        name="stageName"
                        placeholder="Your Artist Name"
                        color={touched.stageName && errors.stageName ? "failure" : "gray"}
                        helperText={touched.stageName && errors.stageName}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="artistType" value="Artist Type" />
                      <Field
                        as={Select}
                        id="artistType"
                        name="artistType"
                        color={touched.artistType && errors.artistType ? "failure" : "gray"}
                        helperText={touched.artistType && errors.artistType}
                      >
                        <option value="">Select Artist Type</option>
                        {ARTIST_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Field>
                    </div>
                    
                    <div>
                      <Label htmlFor="email" value="Email" />
                      <Field
                        as={TextInput}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="artist@example.com"
                        color={touched.email && errors.email ? "failure" : "gray"}
                        helperText={touched.email && errors.email}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" value="Phone Number" />
                      <Field
                        as={TextInput}
                        id="phone"
                        name="phone"
                        placeholder="+1 (555) 123-4567"
                        color={touched.phone && errors.phone ? "failure" : "gray"}
                        helperText={touched.phone && errors.phone}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="genre" value="Primary Genre" />
                      <Field
                        as={Select}
                        id="genre"
                        name="genre"
                        color={touched.genre && errors.genre ? "failure" : "gray"}
                        helperText={touched.genre && errors.genre}
                      >
                        <option value="">Select Genre</option>
                        {GENRES.map(genre => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </Field>
                    </div>
                  </div>
                </Card>

                {/* Contract Information */}
                <Card className="p-6">
                  <div className="flex items-center mb-6">
                    <HiCalendar className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Contract Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="contractStatus" value="Contract Status" />
                      <Field
                        as={Select}
                        id="contractStatus"
                        name="contractStatus"
                        color={touched.contractStatus && errors.contractStatus ? "failure" : "gray"}
                        helperText={touched.contractStatus && errors.contractStatus}
                      >
                        <option value="">Select Status</option>
                        {CONTRACT_STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </Field>
                    </div>
                    
                    <div>
                      <Label htmlFor="dateSigned" value="Date Signed" />
                      <Field
                        as={TextInput}
                        id="dateSigned"
                        name="dateSigned"
                        type="date"
                        color={touched.dateSigned && errors.dateSigned ? "failure" : "gray"}
                        helperText={touched.dateSigned && errors.dateSigned}
                      />
                    </div>
                  </div>
                </Card>

                {/* Social Media */}
                <Card className="p-6">
                  <div className="flex items-center mb-6">
                    <HiGlobe className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Social Media</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="socialMedia.instagram" value="Instagram" />
                      <Field
                        as={TextInput}
                        id="socialMedia.instagram"
                        name="socialMedia.instagram"
                        placeholder="https://instagram.com/yourusername"
                        color={touched.socialMedia?.instagram && errors.socialMedia?.instagram ? "failure" : "gray"}
                        helperText={touched.socialMedia?.instagram && errors.socialMedia?.instagram}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="socialMedia.twitter" value="Twitter" />
                      <Field
                        as={TextInput}
                        id="socialMedia.twitter"
                        name="socialMedia.twitter"
                        placeholder="https://twitter.com/yourusername"
                        color={touched.socialMedia?.twitter && errors.socialMedia?.twitter ? "failure" : "gray"}
                        helperText={touched.socialMedia?.twitter && errors.socialMedia?.twitter}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="socialMedia.facebook" value="Facebook" />
                      <Field
                        as={TextInput}
                        id="socialMedia.facebook"
                        name="socialMedia.facebook"
                        placeholder="https://facebook.com/yourpage"
                        color={touched.socialMedia?.facebook && errors.socialMedia?.facebook ? "failure" : "gray"}
                        helperText={touched.socialMedia?.facebook && errors.socialMedia?.facebook}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="socialMedia.spotify" value="Spotify" />
                      <Field
                        as={TextInput}
                        id="socialMedia.spotify"
                        name="socialMedia.spotify"
                        placeholder="https://open.spotify.com/artist/..."
                        color={touched.socialMedia?.spotify && errors.socialMedia?.spotify ? "failure" : "gray"}
                        helperText={touched.socialMedia?.spotify && errors.socialMedia?.spotify}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="socialMedia.appleMusic" value="Apple Music" />
                      <Field
                        as={TextInput}
                        id="socialMedia.appleMusic"
                        name="socialMedia.appleMusic"
                        placeholder="https://music.apple.com/artist/..."
                        color={touched.socialMedia?.appleMusic && errors.socialMedia?.appleMusic ? "failure" : "gray"}
                        helperText={touched.socialMedia?.appleMusic && errors.socialMedia?.appleMusic}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="socialMedia.soundcloud" value="SoundCloud" />
                      <Field
                        as={TextInput}
                        id="socialMedia.soundcloud"
                        name="socialMedia.soundcloud"
                        placeholder="https://soundcloud.com/yourusername"
                        color={touched.socialMedia?.soundcloud && errors.socialMedia?.soundcloud ? "failure" : "gray"}
                        helperText={touched.socialMedia?.soundcloud && errors.socialMedia?.soundcloud}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="socialMedia.youtube" value="YouTube" />
                      <Field
                        as={TextInput}
                        id="socialMedia.youtube"
                        name="socialMedia.youtube"
                        placeholder="https://youtube.com/@yourchannel"
                        color={touched.socialMedia?.youtube && errors.socialMedia?.youtube ? "failure" : "gray"}
                        helperText={touched.socialMedia?.youtube && errors.socialMedia?.youtube}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="socialMedia.tiktok" value="TikTok" />
                      <Field
                        as={TextInput}
                        id="socialMedia.tiktok"
                        name="socialMedia.tiktok"
                        placeholder="https://tiktok.com/@yourusername"
                        color={touched.socialMedia?.tiktok && errors.socialMedia?.tiktok ? "failure" : "gray"}
                        helperText={touched.socialMedia?.tiktok && errors.socialMedia?.tiktok}
                      />
                    </div>
                  </div>
                </Card>

                {/* Additional Information */}
                <Card className="p-6">
                  <div className="flex items-center mb-6">
                    <HiInformationCircle className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Additional Information</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="manager" value="Manager (Optional)" />
                      <Field
                        as={TextInput}
                        id="manager"
                        name="manager"
                        placeholder="Manager name or company"
                        color={touched.manager && errors.manager ? "failure" : "gray"}
                        helperText={touched.manager && errors.manager}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="furtherInformation" value="Additional Information" />
                      <Field
                        as={Textarea}
                        id="furtherInformation"
                        name="furtherInformation"
                        placeholder="Tell us more about your music, achievements, or any additional information..."
                        rows={4}
                        color={touched.furtherInformation && errors.furtherInformation ? "failure" : "gray"}
                        helperText={touched.furtherInformation && errors.furtherInformation}
                      />
                    </div>
                  </div>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    color="blue"
                    size="lg"
                    disabled={isSubmitting || saving}
                    className="flex items-center gap-2"
                  >
                    <HiSave className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
} 