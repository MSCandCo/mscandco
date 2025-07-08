import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Label, Radio, Card, Alert } from 'flowbite-react';
import { HiChartBar, HiUserGroup, HiCog, HiCheck } from 'react-icons/hi';

const validationSchema = Yup.object({
  role: Yup.string()
    .oneOf(['artist', 'admin', 'manager'], 'Please select a valid role')
    .required('Please select your role')
});

const ROLES = [
  {
    id: 'artist',
    title: 'Artist',
    description: 'Upload and manage your music, track analytics, and connect with fans',
    icon: HiChartBar,
    features: [
      'Upload and manage your music',
      'Track streaming analytics',
      'Connect with fans',
      'Manage your artist profile',
      'View earnings and royalties'
    ]
  },
  {
    id: 'admin',
    title: 'Administrator',
    description: 'Full platform access for managing users, content, and system settings',
    icon: HiCog,
    features: [
      'Manage all users and content',
      'System configuration',
      'Analytics and reporting',
      'Content moderation',
      'Platform administration'
    ]
  },
  {
    id: 'manager',
    title: 'Artist Manager',
    description: 'Manage multiple artists and their content on the platform',
    icon: HiUserGroup,
    features: [
      'Manage multiple artists',
      'Content approval workflow',
      'Artist analytics overview',
      'Revenue tracking',
      'Team collaboration tools'
    ]
  }
];

export default function DashboardAccessStep({ formData, onComplete, onUpdate, isLoading }) {
  const [selectedRole, setSelectedRole] = useState(formData.role || '');

  const initialValues = {
    role: formData.role || ''
  };

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      // Update form data with role selection
      onUpdate({
        role: values.role,
        dashboardAccess: true
      });

      // Mark step as complete
      onComplete({
        dashboardAccess: {
          role: values.role,
          accessGranted: true
        }
      });
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <HiChartBar className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Your Dashboard Access
        </h3>
        <p className="text-gray-600">
          Select the type of access that best describes your role on the platform.
        </p>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched, setFieldValue }) => (
          <Form className="space-y-6">
            {/* Role Selection */}
            <div className="grid gap-4">
              {ROLES.map((role) => {
                const IconComponent = role.icon;
                return (
                  <Card
                    key={role.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedRole === role.id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      setSelectedRole(role.id);
                      setFieldValue('role', role.id);
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          selectedRole === role.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`w-6 h-6 ${
                            selectedRole === role.id ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Field
                            as={Radio}
                            name="role"
                            value={role.id}
                            className="sr-only"
                          />
                          <h4 className={`text-lg font-semibold ${
                            selectedRole === role.id ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {role.title}
                          </h4>
                          {selectedRole === role.id && (
                            <HiCheck className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        
                        <p className={`mt-1 text-sm ${
                          selectedRole === role.id ? 'text-blue-700' : 'text-gray-600'
                        }`}>
                          {role.description}
                        </p>
                        
                        <ul className="mt-3 space-y-1">
                          {role.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-xs text-gray-500">
                              <HiCheck className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Role Selection Error */}
            {touched.role && errors.role && (
              <Alert color="failure">
                <span>{errors.role}</span>
              </Alert>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <Alert color="failure">
                <span>{errors.submit}</span>
              </Alert>
            )}

            {/* Information Alert */}
            <Alert color="info">
              <span className="font-medium">Note:</span>
              <br />
              Your role selection will determine your dashboard access and available features. 
              You can request role changes from an administrator if needed.
            </Alert>

            {/* Submit Button */}
            <Button
              type="submit"
              color="blue"
              className="w-full"
              disabled={isSubmitting || isLoading || !selectedRole}
            >
              {isSubmitting ? 'Setting Up Access...' : 'Complete Registration'}
            </Button>
          </Form>
        )}
      </Formik>

      {/* Help Text */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Your role determines your access level and available features on the platform.</p>
        <p className="mt-1">
          Need help? <button className="text-blue-600 hover:underline">Contact Support</button>
        </p>
      </div>
    </div>
  );
} 