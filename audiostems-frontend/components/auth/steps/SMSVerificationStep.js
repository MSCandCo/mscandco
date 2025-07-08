import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Label, TextInput, Alert } from 'flowbite-react';
import { HiPhone, HiClock, HiRefresh } from 'react-icons/hi';

const validationSchema = Yup.object({
  phoneNumber: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  smsCode: Yup.string()
    .length(6, 'SMS code must be 6 digits')
    .matches(/^\d+$/, 'SMS code must contain only numbers')
    .required('SMS verification code is required')
});

export default function SMSVerificationStep({ formData, onComplete, onUpdate, isLoading }) {
  const [countdown, setCountdown] = useState(36);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
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

  const sendSMSVerification = async (phoneNumber) => {
    try {
      setIsResending(true);
      setError('');

      const response = await fetch('/api/auth/send-sms-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber })
      });

      if (response.ok) {
        setSmsSent(true);
        setCountdown(36);
        setCanResend(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send SMS verification');
      }
    } catch (error) {
      setError('Failed to send SMS verification. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleResend = () => {
    const phoneNumber = formData.phoneNumber;
    if (phoneNumber) {
      sendSMSVerification(phoneNumber);
    }
  };

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      setError('');

      // First, send SMS if not sent yet
      if (!smsSent) {
        await sendSMSVerification(values.phoneNumber);
      }

      // Verify the SMS code
      const response = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: values.phoneNumber,
          code: values.smsCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update form data with verification status
        onUpdate({
          phoneNumber: values.phoneNumber,
          mobileVerified: true,
          smsVerificationCode: values.smsCode
        });

        // Mark step as complete
        onComplete({
          smsVerification: {
            verified: true,
            phoneNumber: values.phoneNumber
          }
        });
      } else {
        const errorData = await response.json();
        setErrors({ smsCode: errorData.message || 'Invalid SMS verification code' });
      }
    } catch (error) {
      setErrors({ smsCode: 'SMS verification failed. Please try again.' });
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
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <HiPhone className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Verify Your Phone Number
        </h3>
        <p className="text-gray-600">
          We'll send a 6-digit verification code to your phone number.
        </p>
      </div>

      {error && (
        <Alert color="failure" className="mb-6">
          <span>{error}</span>
        </Alert>
      )}

      <Formik
        initialValues={{
          phoneNumber: formData.phoneNumber || '',
          smsCode: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched, values }) => (
          <Form className="space-y-6">
            {/* Phone Number Input */}
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

            {/* SMS Code Input */}
            <div>
              <Label htmlFor="smsCode" value="SMS Verification Code" />
              <Field
                as={TextInput}
                id="smsCode"
                name="smsCode"
                placeholder="123456"
                maxLength={6}
                color={touched.smsCode && errors.smsCode ? "failure" : "gray"}
                helperText={touched.smsCode && errors.smsCode}
                className="text-center text-lg tracking-widest"
              />
            </div>

            {/* Resend Timer */}
            {smsSent && (
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
                    {isResending ? 'Sending...' : 'Resend SMS'}
                  </Button>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              color="blue"
              className="w-full"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Verifying...' : smsSent ? 'Verify SMS' : 'Send SMS Code'}
            </Button>
          </Form>
        )}
      </Formik>

      {/* Help Text */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>We'll send you a text message with a verification code.</p>
        <p className="mt-1">
          Need help? <button className="text-blue-600 hover:underline">Contact Support</button>
        </p>
      </div>
    </div>
  );
} 