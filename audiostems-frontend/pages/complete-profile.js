import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const ProfileSchema = Yup.object().shape({
  company: Yup.string().max(100, 'Company name too long'),
  jobTitle: Yup.string().max(100, 'Job title too long'),
  website: Yup.string().url('Please enter a valid URL'),
  bio: Yup.string().max(500, 'Bio too long'),
});

export default function CompleteProfile() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const user = JSON.parse(storedUserData);
      setUserData(user);
    } else {
      router.push('/register');
    }
  }, [router]);

  const handleCompleteProfile = async (values, { setSubmitting }) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI}/api/auth/complete-profile`,
        {
          email: userData.email,
          profileData: values,
        }
      );

      if (response.data.nextStep === 'complete') {
        setSuccess('Profile completed successfully!');
        // Clear stored data
        localStorage.removeItem('userData');
        localStorage.removeItem('registrationEmail');
        
        setTimeout(() => {
          router.push('/login?message=registration_complete');
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.error?.message || 'Profile completion failed');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete your profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Tell us a bit more about yourself
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Welcome to AudioStems!
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      You're almost done! Complete your profile to get started with your music licensing journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Formik
            initialValues={{
              company: '',
              jobTitle: '',
              website: '',
              bio: '',
            }}
            validationSchema={ProfileSchema}
            onSubmit={handleCompleteProfile}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company (Optional)
                  </label>
                  <div className="mt-1">
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Your company name"
                      value={values.company}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  {touched.company && errors.company && (
                    <p className="mt-2 text-sm text-red-600">{errors.company}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                    Job Title (Optional)
                  </label>
                  <div className="mt-1">
                    <input
                      id="jobTitle"
                      name="jobTitle"
                      type="text"
                      placeholder="e.g., Music Producer, Content Creator"
                      value={values.jobTitle}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  {touched.jobTitle && errors.jobTitle && (
                    <p className="mt-2 text-sm text-red-600">{errors.jobTitle}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                    Website (Optional)
                  </label>
                  <div className="mt-1">
                    <input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={values.website}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  {touched.website && errors.website && (
                    <p className="mt-2 text-sm text-red-600">{errors.website}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio (Optional)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      placeholder="Tell us about your music projects, experience, or what you're looking for..."
                      value={values.bio}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  {touched.bio && errors.bio && (
                    <p className="mt-2 text-sm text-red-600">{errors.bio}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Completing Profile...' : 'Complete Profile'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push('/recovery-codes')}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Back to recovery codes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 