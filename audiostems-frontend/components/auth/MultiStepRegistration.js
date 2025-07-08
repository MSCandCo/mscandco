import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { Button, Progress } from 'flowbite-react';
import { HiCheck, HiArrowRight, HiArrowLeft } from 'react-icons/hi';
import BasicInfoStep from './steps/BasicInfoStep';
import EmailVerificationStep from './steps/EmailVerificationStep';
import SMSVerificationStep from './steps/SMSVerificationStep';
import BackupCodesStep from './steps/BackupCodesStep';
import ArtistProfileStep from './steps/ArtistProfileStep';
import DashboardAccessStep from './steps/DashboardAccessStep';

const STEPS = [
  { id: 'basic_info', title: 'Basic Info', component: BasicInfoStep },
  { id: 'email_verification', title: 'Email Verification', component: EmailVerificationStep },
  { id: 'sms_verification', title: 'SMS Verification', component: SMSVerificationStep },
  { id: 'backup_codes', title: 'Backup Codes', component: BackupCodesStep },
  { id: 'artist_profile', title: 'Artist Profile', component: ArtistProfileStep }
];

export default function MultiStepRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const router = useRouter();

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const markStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = async (stepData, stepId) => {
    updateFormData(stepData);
    markStepComplete(stepId);
    
    // If this is the last step, complete registration
    if (currentStep === STEPS.length - 1) {
      await completeRegistration();
    } else {
      nextStep();
    }
  };

  const completeRegistration = async () => {
    setIsLoading(true);
    try {
      const token = await getAccessTokenSilently();
      
      // Send final registration data to your backend
      const response = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Redirect to artist portal for profile completion
        router.push('/artist-portal');
      } else {
        throw new Error('Failed to complete registration');
      }
    } catch (error) {
      console.error('Registration completion error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Artist Registration</h1>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
          
          <Progress 
            progress={(completedSteps.length / STEPS.length) * 100} 
            color="blue"
            className="mb-6"
          />
          
          {/* Step Indicators */}
          <div className="flex justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                  ${completedSteps.includes(step.id) ? 'bg-green-600' : ''}
                `}>
                  {completedSteps.includes(step.id) ? (
                    <HiCheck className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs mt-1 text-gray-500 text-center">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {STEPS[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {STEPS[currentStep].description}
            </p>
          </div>

          <CurrentStepComponent
            formData={formData}
            onComplete={(data) => handleStepComplete(data, STEPS[currentStep].id)}
            onUpdate={updateFormData}
            isLoading={isLoading}
          />

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              color="gray"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <HiArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep < STEPS.length - 1 && (
              <Button
                color="blue"
                onClick={nextStep}
                disabled={!completedSteps.includes(STEPS[currentStep].id)}
                className="flex items-center gap-2"
              >
                Next
                <HiArrowRight className="w-4 h-4" />
              </Button>
            )}

            {currentStep === STEPS.length - 1 && (
              <Button
                color="green"
                onClick={completeRegistration}
                disabled={!completedSteps.includes(STEPS[currentStep].id) || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? 'Completing...' : 'Complete Registration'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 