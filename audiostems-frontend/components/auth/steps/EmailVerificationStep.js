import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Label, TextInput, Alert } from 'flowbite-react';
import { HiMail, HiClock, HiCheck, HiRefresh } from 'react-icons/hi';

const validationSchema = Yup.object({
  verificationCode: Yup.string()
    .length(6, 'Verification code must be 6 digits')
    .matches(/^\d+$/, 'Verification code must contain only numbers')
    .required('Verification code is required')
});

export default function EmailVerificationStep({ formData, onComplete, onUpdate, isLoading }) {
  const [countdown, setCountdown] = useState(36);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState('');

  const email = formData.email || '';

  useEffect(() => {
    // Start countdown when component mounts
    if (!verificationSent) {
      sendVerificationEmail();
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sendVerificationEmail = async () => {
    try {
      setIsResending(true);
      setError('');

      // Call Auth0 API to send verification email
      const response = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setVerificationSent(true);
        setCountdown(36);
        setCanResend(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send verification email');
      }
    } catch (error) {
      setError('Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleResend = () => {
    sendVerificationEmail();
  };

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      setError('');

      // Verify the code with Auth0
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: values.verificationCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update form data with verification status
        onUpdate({
          emailVerified: true,
          emailVerificationCode: values.verificationCode
        });

        // Mark step as complete
        onComplete({
          emailVerification: {
            verified: true,
            email: email
          }
        });
      } else {
        const errorData = await response.json();
        setErrors({ verificationCode: errorData.message || 'Invalid verification code' });
      }
    } catch (error) {
      setErrors({ verificationCode: 'Verification failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <HiMail className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Verify Your Email
        </h3>
        <p className="text-gray-600">
          We've sent a 6-digit verification code to:
        </p>
        <p className="font-medium text-gray-900">{email}</p>
      </div>

      {error && (
        <Alert color="failure" className="mb-6">
          <span>{error}</span>
        </Alert>
      )}

      <Formik
        initialValues={{ verificationCode: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-6">
            {/* Verification Code Input */}
            <div>
              <Label htmlFor="verificationCode" value="Verification Code" />
              <Field
                as={TextInput}
                id="verificationCode"
                name="verificationCode"
                placeholder="123456"
                maxLength={6}
                color={touched.verificationCode && errors.verificationCode ? "failure" : "gray"}
                helperText={touched.verificationCode && errors.verificationCode}
                className="text-center text-lg tracking-widest"
              />
            </div>

            {/* Resend Timer */}
            <div className="text-center">
              {!canResend ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <HiClock className="w-4 h-4" />
                  <span>Resend available in {formatTime(countdown)}</span>
                </div>
              ) : (
                <Button
                  type="button"
                  color="gray"
                  size="sm"
                  onClick={handleResend}
                  disabled={isResending}
                  className="flex items-center gap-2 mx-auto"
                >
                  <HiRefresh className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                  {isResending ? 'Sending...' : 'Resend Code'}
                </Button>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              color="blue"
              className="w-full"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Verifying...' : 'Verify Email'}
            </Button>
          </Form>
        )}
      </Formik>

      {/* Help Text */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Didn't receive the email? Check your spam folder.</p>
        <p className="mt-1">
          Need help? <button className="text-blue-600 hover:underline">Contact Support</button>
        </p>
      </div>
    </div>
  );
} 