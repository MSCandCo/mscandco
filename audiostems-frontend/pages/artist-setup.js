import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ArtistSetupSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  stageName: Yup.string().required('Stage name is required'),
  artistType: Yup.string().required('Artist type is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string(),
  genres: Yup.array().min(1, 'Please select at least one genre'),
  socialMediaHandles: Yup.object(),
  managerName: Yup.string(),
  managerEmail: Yup.string().email('Invalid email'),
  managerPhone: Yup.string(),
  managerCompany: Yup.string(),
  managerWebsite: Yup.string().url('Invalid URL'),
  furtherInformation: Yup.string()
});

export default function ArtistSetup() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    fetchGenres();
  }, [session, status]);

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/genres`);
      setGenres(response.data.data);
    } catch (err) {
      console.error('Error fetching genres:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      setSubmitting(true);
      
      // Prepare the artist data
      const artistData = {
        data: {
          user: session.user.id,
          firstName: values.firstName,
          lastName: values.lastName,
          stageName: values.stageName,
          name: values.stageName, // Keep the original name field
          artistType: values.artistType,
          email: values.email,
          phoneNumber: values.phoneNumber,
          genre: values.genres,
          socialMediaHandles: values.socialMediaHandles,
          contractStatus: 'pending',
          manager: values.managerName ? {
            name: values.managerName,
            email: values.managerEmail,
            phoneNumber: values.managerPhone,
            company: values.managerCompany,
            website: values.managerWebsite
          } : null,
          furtherInformation: values.furtherInformation
        }
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/artists`, artistData);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error creating artist profile:', err);
      setErrors({ submit: 'Failed to create artist profile. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const artistTypes = [
    { value: 'solo_artist', label: 'Solo Artist' },
    { value: 'band_group', label: 'Band/Group' },
    { value: 'dj', label: 'DJ' },
    { value: 'duo', label: 'Duo' },
    { value: 'orchestra', label: 'Orchestra' },
    { value: 'ensemble', label: 'Ensemble' },
    { value: 'collective', label: 'Collective' }
  ];

  const socialMediaPlatforms = [
    'instagram', 'twitter', 'facebook', 'youtube', 'tiktok', 'spotify', 'soundcloud', 'apple_music'
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Artist Setup - AudioStems</title>
        <meta name="description" content="Complete your artist profile for music distribution and publishing" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Artist Profile</h1>
            <p className="text-gray-600">Tell us about yourself to get started with music distribution and publishing</p>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <Formik
              initialValues={{
                firstName: session?.user?.firstName || '',
                lastName: session?.user?.lastName || '',
                stageName: '',
                artistType: '',
                email: session?.user?.email || '',
                phoneNumber: '',
                genres: [],
                socialMediaHandles: {},
                managerName: '',
                managerEmail: '',
                managerPhone: '',
                managerCompany: '',
                managerWebsite: '',
                furtherInformation: ''
              }}
              validationSchema={ArtistSetupSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, errors, touched }) => (
                <Form className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <Field
                          name="firstName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <Field
                          name="lastName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stage Name *
                        </label>
                        <Field
                          name="stageName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="stageName" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Artist Type *
                        </label>
                        <Field
                          as="select"
                          name="artistType"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select artist type</option>
                          {artistTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="artistType" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <Field
                          name="email"
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Field
                          name="phoneNumber"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="phoneNumber" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Genres */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Genres *</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {genres.map(genre => (
                        <label key={genre.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={values.genres.includes(genre.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFieldValue('genres', [...values.genres, genre.id]);
                              } else {
                                setFieldValue('genres', values.genres.filter(id => id !== genre.id));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{genre.attributes.title}</span>
                        </label>
                      ))}
                    </div>
                    {touched.genres && errors.genres && (
                      <div className="text-red-500 text-sm mt-1">{errors.genres}</div>
                    )}
                  </div>

                  {/* Social Media */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Media</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {socialMediaPlatforms.map(platform => (
                        <div key={platform}>
                          <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                            {platform.replace('_', ' ')}
                          </label>
                          <Field
                            name={`socialMediaHandles.${platform}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Your ${platform.replace('_', ' ')} handle`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manager Information */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Manager Information (Optional)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Manager Name
                        </label>
                        <Field
                          name="managerName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Manager Email
                        </label>
                        <Field
                          name="managerEmail"
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="managerEmail" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Manager Phone
                        </label>
                        <Field
                          name="managerPhone"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Manager Company
                        </label>
                        <Field
                          name="managerCompany"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Manager Website
                        </label>
                        <Field
                          name="managerWebsite"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="managerWebsite" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tell us more about yourself, your music, and your goals
                      </label>
                      <Field
                        as="textarea"
                        name="furtherInformation"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Share your story, musical background, achievements, and what you hope to achieve with AudioStems..."
                      />
                      <ErrorMessage name="furtherInformation" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-red-600">{errors.submit}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Creating Profile...' : 'Complete Setup'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  );
} 