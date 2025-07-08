import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Label, TextInput, Alert } from 'flowbite-react';
import { HiEye, HiEyeOff, HiInformationCircle } from 'react-icons/hi';

const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  stageName: Yup.string()
    .min(2, 'Stage name must be at least 2 characters')
    .max(50, 'Stage name must be less than 50 characters')
    .required('Stage name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password')
});

export default function BasicInfoStep({ formData, onComplete, onUpdate, isLoading }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues = {
    firstName: formData.firstName || '',
    lastName: formData.lastName || '',
    stageName: formData.stageName || '',
    email: formData.email || '',
    password: '',
    confirmPassword: ''
  };

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      // Store the data for the next step
      onUpdate({
        firstName: values.firstName,
        lastName: values.lastName,
        stageName: values.stageName,
        email: values.email,
        password: values.password
      });

      // Mark this step as complete
      onComplete({
        basicInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          stageName: values.stageName,
          email: values.email
        }
      });
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <Alert color="info" icon={HiInformationCircle}>
          <span className="font-medium">Welcome to AudioStems!</span>
          <br />
          Let's start by collecting your basic information. This will be used to create your artist profile.
        </Alert>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-6">
            {/* Name Fields */}
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

            {/* Stage Name */}
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

            {/* Email */}
            <div>
              <Label htmlFor="email" value="Email Address" />
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

            {/* Password */}
            <div>
              <Label htmlFor="password" value="Password" />
              <div className="relative">
                <Field
                  as={TextInput}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  color={touched.password && errors.password ? "failure" : "gray"}
                  helperText={touched.password && errors.password}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <HiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <HiEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" value="Confirm Password" />
              <div className="relative">
                <Field
                  as={TextInput}
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  color={touched.confirmPassword && errors.confirmPassword ? "failure" : "gray"}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <HiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <HiEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
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
              {isSubmitting ? 'Processing...' : 'Continue to Email Verification'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
} 