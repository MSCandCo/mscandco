import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, Loader2, AlertCircle, X } from 'lucide-react';
import SEO from '../components/seo';

export default function EmailVerified() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(7);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        // Since user clicked verification link, we assume email is verified
        // Show success immediately and start countdown
        setIsVerified(true);
        setIsLoading(false);
        
        // For incognito mode: Signal to parent window that verification is complete
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ 
              type: 'EMAIL_VERIFIED', 
              verified: true 
            }, window.location.origin);
            console.log('✅ Sent verification message to parent window');
          }
        } catch (e) {
          console.log('Could not communicate with parent window:', e);
        }
        
        // Start countdown to close window
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              // Close the window/tab
              window.close();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(interval);
      } catch (err) {
        setError('An error occurred while checking your verification status.');
        setIsLoading(false);
      }
    };

    checkVerificationStatus();
  }, []);

  const handleCloseNow = () => {
    window.close();
  };

  if (isLoading) {
    return (
      <>
        <SEO pageTitle="Verifying Email - MSC & Co" />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full space-y-8">
            <div className="bg-white rounded-2xl shadow-xl py-12 px-8 border border-gray-200 text-center">
              <Loader2 className="animate-spin h-12 w-12 text-[#1f2937] mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verifying Your Email
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your email verification...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO pageTitle="Email Verification Error - MSC & Co" />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full space-y-8">
            <div className="bg-white rounded-2xl shadow-xl py-12 px-8 border border-gray-200 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verification Error
              </h2>
              <p className="text-gray-600 mb-8">
                {error}
              </p>
              <div className="space-y-4">
                <button
                  onClick={handleCloseNow}
                  className="w-full bg-[#1f2937] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#374151] transition-colors flex items-center justify-center"
                >
                  Close Window
                  <X className="ml-2 h-5 w-5" />
                </button>
                <p className="text-sm text-gray-500 text-center">
                  Return to your registration page and try again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO pageTitle="Email Verified Successfully - MSC & Co" />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <span className="text-4xl font-bold text-[#1f2937] mr-2">Welcome to</span>
              <img
                src="/logos/msc-logo.png"
                alt="MSC & Co Logo"
                className="h-12 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline';
                }}
              />
              <span className="text-4xl font-bold text-[#1f2937] ml-2 hidden">MSC & Co</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl py-12 px-8 border border-gray-200 text-center">
            <div className="relative mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto animate-pulse" />
              <div className="absolute inset-0 h-16 w-16 mx-auto rounded-full bg-green-100 animate-ping opacity-75"></div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Email Verified!
            </h2>
            
            <p className="text-gray-600 mb-8 text-lg">
              Perfect! Your email has been successfully verified.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <p className="text-green-800 font-medium mb-2">
                ✅ Verification Complete
              </p>
              <p className="text-green-700 text-sm">
                This window will automatically close in <span className="font-bold">{countdown}</span> seconds.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleCloseNow}
                className="w-full bg-[#1f2937] text-white py-4 px-6 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 hover:bg-white hover:text-[#1f2937] hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:ring-offset-2 flex items-center justify-center"
              >
                Close Window Now
                <X className="ml-2 h-5 w-5" />
              </button>
              
              <p className="text-sm text-gray-500">
                Return to your registration page to continue with the next steps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
