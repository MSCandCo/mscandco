import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Label, TextInput, Textarea, Select, Alert } from 'flowbite-react';
import { HiUser, HiGlobe, HiMusic, HiInformationCircle } from 'react-icons/hi';

const validationSchema = Yup.object({
  artistType: Yup.string()
    .required('Artist type is required'),
  genre: Yup.string()
    .required('Genre is required'),
  contractStatus: Yup.string()
    .required('Contract status is required'),
  dateSigned: Yup.date()
    .required('Date signed is required'),
  socialMedia: Yup.object({
    instagram: Yup.string().url('Please enter a valid Instagram URL'),
    twitter: Yup.string().url('Please enter a valid Twitter URL'),
    facebook: Yup.string().url('Please enter a valid Facebook URL'),
    youtube: Yup.string().url('Please enter a valid YouTube URL'),
    tiktok: Yup.string().url('Please enter a valid TikTok URL'),
    spotify: Yup.string().url('Please enter a valid Spotify URL')
  }),
  managerInfo: Yup.object({
    name: Yup.string().required('Manager name is required'),
    email: Yup.string().email('Please enter a valid email'),
    phone: Yup.string()
  }),
  additionalInfo: Yup.string()
    .max(1000, 'Additional information must be less than 1000 characters')
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

export default function ArtistProfileStep({ formData, onComplete, onUpdate, isLoading }) {
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const initialValues = {
    firstName: formData.firstName || '',
    lastName: formData.lastName || '',
    stageName: formData.stageName || '',
    email: formData.email || '',
    phoneNumber: formData.phoneNumber || '',
    artistType: formData.artistType || '',
    genre: formData.genre || '',
    contractStatus: formData.contractStatus || '',
    dateSigned: formData.dateSigned || '',
    socialMedia: {
      instagram: formData.socialMedia?.instagram || '',
      twitter: formData.socialMedia?.twitter || '',
      facebook: formData.socialMedia?.facebook || '',
      youtube: formData.socialMedia?.youtube || '',
      tiktok: formData.socialMedia?.tiktok || '',
      spotify: formData.socialMedia?.spotify || ''
    },
    managerInfo: {
      name: formData.managerInfo?.name || '',
      email: formData.managerInfo?.email || '',
      phone: formData.managerInfo?.phone || ''
    },
    additionalInfo: formData.additionalInfo || ''
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

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      // Upload profile image if selected
      let imageUrl = '';
      if (profileImage) {
        const formData = new FormData();
        formData.append('image', profileImage);
        
        const uploadResponse = await fetch('/api/auth/upload-profile-image', {
          method: 'POST',
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.imageUrl;
        }
      }

      // Update form data
      const profileData = {
        ...values,
        profileImage: imageUrl,
        profileComplete: true
      };

      onUpdate(profileData);

      // Mark step as complete
      onComplete({
        artistProfile: profileData
      });
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <HiUser className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Complete Your Artist Profile
        </h3>
        <p className="text-gray-600">
          Tell us more about yourself and your music. This information will be displayed on your artist page.
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-6">
            {/* Pre-filled Basic Info */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div>
              <Label htmlFor="phoneNumber" value="Phone Number" />
              <Field
                as={TextInput}
                id="phoneNumber"
                name="phoneNumber"
                placeholder="+1234567890"
                color={touched.phoneNumber && errors.phoneNumber ? "failure" : "gray"}
                helperText={touched.phoneNumber && errors.phoneNumber}
              />
            </div>

            {/* Profile Image */}
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

            {/* Artist Type and Genre */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="artistType" value="Artist Type" />
                <Field
                  as={Select}
                  id="artistType"
                  name="artistType"
                  color={touched.artistType && errors.artistType ? "failure" : "gray"}
                  helperText={touched.artistType && errors.artistType}
                >
                  <option value="">Select artist type</option>
                  {ARTIST_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Field>
              </div>
              <div>
                <Label htmlFor="genre" value="Genre" />
                <Field
                  as={Select}
                  id="genre"
                  name="genre"
                  color={touched.genre && errors.genre ? "failure" : "gray"}
                  helperText={touched.genre && errors.genre}
                >
                  <option value="">Select a genre</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </Field>
              </div>
            </div>

            {/* Contract Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contractStatus" value="Contract Status" />
                <Field
                  as={Select}
                  id="contractStatus"
                  name="contractStatus"
                  color={touched.contractStatus && errors.contractStatus ? "failure" : "gray"}
                  helperText={touched.contractStatus && errors.contractStatus}
                >
                  <option value="">Select contract status</option>
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

            {/* Social Media */}
            <div>
              <Label value="Social Media Handles" />
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="instagram" value="Instagram" />
                  <Field
                    as={TextInput}
                    id="instagram"
                    name="socialMedia.instagram"
                    placeholder="https://instagram.com/yourusername"
                    color={touched.socialMedia?.instagram && errors.socialMedia?.instagram ? "failure" : "gray"}
                    helperText={touched.socialMedia?.instagram && errors.socialMedia?.instagram}
                  />
                </div>
                <div>
                  <Label htmlFor="twitter" value="Twitter" />
                  <Field
                    as={TextInput}
                    id="twitter"
                    name="socialMedia.twitter"
                    placeholder="https://twitter.com/yourusername"
                    color={touched.socialMedia?.twitter && errors.socialMedia?.twitter ? "failure" : "gray"}
                    helperText={touched.socialMedia?.twitter && errors.socialMedia?.twitter}
                  />
                </div>
                <div>
                  <Label htmlFor="facebook" value="Facebook" />
                  <Field
                    as={TextInput}
                    id="facebook"
                    name="socialMedia.facebook"
                    placeholder="https://facebook.com/yourpage"
                    color={touched.socialMedia?.facebook && errors.socialMedia?.facebook ? "failure" : "gray"}
                    helperText={touched.socialMedia?.facebook && errors.socialMedia?.facebook}
                  />
                </div>
                <div>
                  <Label htmlFor="youtube" value="YouTube" />
                  <Field
                    as={TextInput}
                    id="youtube"
                    name="socialMedia.youtube"
                    placeholder="https://youtube.com/yourchannel"
                    color={touched.socialMedia?.youtube && errors.socialMedia?.youtube ? "failure" : "gray"}
                    helperText={touched.socialMedia?.youtube && errors.socialMedia?.youtube}
                  />
                </div>
                <div>
                  <Label htmlFor="tiktok" value="TikTok" />
                  <Field
                    as={TextInput}
                    id="tiktok"
                    name="socialMedia.tiktok"
                    placeholder="https://tiktok.com/@yourusername"
                    color={touched.socialMedia?.tiktok && errors.socialMedia?.tiktok ? "failure" : "gray"}
                    helperText={touched.socialMedia?.tiktok && errors.socialMedia?.tiktok}
                  />
                </div>
                <div>
                  <Label htmlFor="spotify" value="Spotify" />
                  <Field
                    as={TextInput}
                    id="spotify"
                    name="socialMedia.spotify"
                    placeholder="https://open.spotify.com/artist/yourid"
                    color={touched.socialMedia?.spotify && errors.socialMedia?.spotify ? "failure" : "gray"}
                    helperText={touched.socialMedia?.spotify && errors.socialMedia?.spotify}
                  />
                </div>
              </div>
            </div>

            {/* Manager Information */}
            <div>
              <Label value="Manager Information" />
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="managerName" value="Manager Name" />
                  <Field
                    as={TextInput}
                    id="managerName"
                    name="managerInfo.name"
                    placeholder="Manager's full name"
                    color={touched.managerInfo?.name && errors.managerInfo?.name ? "failure" : "gray"}
                    helperText={touched.managerInfo?.name && errors.managerInfo?.name}
                  />
                </div>
                <div>
                  <Label htmlFor="managerEmail" value="Manager Email" />
                  <Field
                    as={TextInput}
                    id="managerEmail"
                    name="managerInfo.email"
                    type="email"
                    placeholder="manager@example.com"
                    color={touched.managerInfo?.email && errors.managerInfo?.email ? "failure" : "gray"}
                    helperText={touched.managerInfo?.email && errors.managerInfo?.email}
                  />
                </div>
                <div>
                  <Label htmlFor="managerPhone" value="Manager Phone" />
                  <Field
                    as={TextInput}
                    id="managerPhone"
                    name="managerInfo.phone"
                    placeholder="+1234567890"
                    color={touched.managerInfo?.phone && errors.managerInfo?.phone ? "failure" : "gray"}
                    helperText={touched.managerInfo?.phone && errors.managerInfo?.phone}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <Label htmlFor="additionalInfo" value="Additional Information" />
              <Field
                as={Textarea}
                id="additionalInfo"
                name="additionalInfo"
                placeholder="Any additional information about your music, career, or special requirements..."
                rows={4}
                color={touched.additionalInfo && errors.additionalInfo ? "failure" : "gray"}
                helperText={touched.additionalInfo && errors.additionalInfo}
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <Alert color="failure">
                <span>{errors.submit}</span>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              color="blue"
              className="w-full"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Saving Profile...' : 'Save Profile & Continue'}
            </Button>
          </Form>
        )}
      </Formik>

      {/* Help Text */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Your profile information helps fans discover your music and connect with you.</p>
        <p className="mt-1">
          Need help? <button className="text-blue-600 hover:underline">Contact Support</button>
        </p>
      </div>
    </div>
  );
} 