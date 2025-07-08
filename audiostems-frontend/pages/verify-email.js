import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const EmailVerificationSchema = Yup.object().shape({
  code: Yup.string()
    .length(6, 'Code must be exactly 6 digits')
    .matches(/^[0-9]+$/, 'Code must contain only numbers')
    .required('Verification code is required'),
});

export default function VerifyEmail() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Get email from localStorage or query params
    const storedEmail = localStorage.getItem('registrationEmail');
    const queryEmail = router.query.email;
    const userEmail = storedEmail || queryEmail;
    
    if (userEmail) {
      setEmail(userEmail);
    } else {
      router.push('/register');
    }
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyEmail = async (values, { setSubmitting }) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI}/api/auth/verify-email`,
        {
          email: email,
          code: values.code,
        }
      );

      if (response.data.success) {
        setSuccess('Email verified successfully! Setting up your artist profile...');
        // Store user data for artist setup
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        setTimeout(() => {
          router.push('/artist-setup');
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.error?.message || 'Verification failed');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI}/api/auth/resend-email-code`,
        { email }
      );
      setSuccess('New verification code sent to your email');
      setCountdown(60); // 60 second cooldown
    } catch (error) {
      setError(error.response?.data?.error?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We sent a 6-digit verification code to{' '}
          <span className="font-medium text-indigo-600">{email}</span>
        </p>
        <p className="mt-2 text-center text-xs text-gray-500">
          After verification, you'll complete your artist profile
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

          <Formik
            initialValues={{ code: '' }}
            validationSchema={EmailVerificationSchema}
            onSubmit={handleVerifyEmail}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <div className="mt-1">
                    <input
                      id="code"
                      name="code"
                      type="text"
                      maxLength="6"
                      placeholder="123456"
                      value={values.code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  {touched.code && errors.code && (
                    <p className="mt-2 text-sm text-red-600">{errors.code}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Didn't receive the code?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading || countdown > 0}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {countdown > 0 
                  ? `Resend code in ${countdown}s` 
                  : 'Resend verification code'
                }
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 