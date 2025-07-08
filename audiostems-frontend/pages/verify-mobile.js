import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const MobileVerificationSchema = Yup.object().shape({
  mobileNumber: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  code: Yup.string()
    .length(6, 'Code must be exactly 6 digits')
    .matches(/^[0-9]+$/, 'Code must contain only numbers')
    .required('Verification code is required'),
});

export default function VerifyMobile() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    const queryEmail = router.query.email;
    
    if (userData) {
      const user = JSON.parse(userData);
      setEmail(user.email);
    } else if (queryEmail) {
      setEmail(queryEmail);
    } else {
      router.push('/register');
    }
  }, [router]);

  const handleSendMobileCode = async (values, { setSubmitting }) => {
    setLoading(true);
    setError('');

    try {
      // In a real implementation, this would send an SMS code
      // For demo purposes, we'll just show the code input
      setSuccess('SMS code sent to your mobile number');
      setShowCodeInput(true);
    } catch (error) {
      setError('Failed to send SMS code');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleVerifyMobile = async (values, { setSubmitting }) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI}/api/auth/verify-mobile`,
        {
          email: email,
          mobileNumber: values.mobileNumber,
          code: values.code,
        }
      );

      if (response.data.nextStep === 'recovery_codes') {
        setSuccess('Mobile verified successfully!');
        // Store updated user data
        localStorage.setItem('userData', JSON.stringify(response.data.user));
        setTimeout(() => {
          router.push('/recovery-codes');
        }, 1500);
      }
    } catch (error) {
      setError(error.response?.data?.error?.message || 'Mobile verification failed');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your mobile number
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We'll send a verification code to your mobile number
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
            initialValues={{ mobileNumber: '', code: '' }}
            validationSchema={MobileVerificationSchema}
            onSubmit={showCodeInput ? handleVerifyMobile : handleSendMobileCode}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="mobileNumber"
                      name="mobileNumber"
                      type="tel"
                      placeholder="+1234567890"
                      value={values.mobileNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={showCodeInput}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                    />
                  </div>
                  {touched.mobileNumber && errors.mobileNumber && (
                    <p className="mt-2 text-sm text-red-600">{errors.mobileNumber}</p>
                  )}
                </div>

                {showCodeInput && (
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
                    <p className="mt-2 text-sm text-gray-500">
                      Demo code: <span className="font-mono">123456</span>
                    </p>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading 
                      ? (showCodeInput ? 'Verifying...' : 'Sending...') 
                      : (showCodeInput ? 'Verify Mobile' : 'Send SMS Code')
                    }
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push('/verify-email')}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Back to email verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 