'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import CopyrightStatusBadge from '@/components/grant-features/CopyrightStatusBadge';
import ConflictsList from '@/components/grant-features/ConflictsList';
import ClearanceForm from '@/components/grant-features/ClearanceForm';
import VerificationHistory from '@/components/grant-features/VerificationHistory';

export default function CopyrightVerificationPage() {
  const params = useParams();
  const releaseId = params.id;
  const supabase = createClient();

  const [release, setRelease] = useState(null);
  const [verification, setVerification] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showClearanceForm, setShowClearanceForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [releaseId]);

  async function loadData() {
    try {
      // Load release
      const { data: releaseData } = await supabase
        .from('releases')
        .select('*')
        .eq('id', releaseId)
        .single();

      setRelease(releaseData);

      // Load latest verification
      const { data: verificationData } = await supabase
        .from('copyright_verifications')
        .select('*')
        .eq('release_id', releaseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setVerification(verificationData);

      if (verificationData?.potential_conflicts) {
        setConflicts(verificationData.potential_conflicts);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading copyright data:', error);
      setLoading(false);
    }
  }

  async function startVerification() {
    setVerifying(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const response = await fetch('/api/grant-features/copyright/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          release_id: releaseId,
          lyrics_text: release?.lyrics || '',
        }),
      });

      const result = await response.json();

      if (result.success) {
        await loadData();
      } else {
        alert('Verification failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error starting verification:', error);
      alert('Failed to start verification');
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Copyright Verification
            </h1>
            <p className="mt-2 text-gray-600">
              {release?.title || 'Release'}
            </p>
          </div>

          {verification && (
            <CopyrightStatusBadge status={verification.verification_status} />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Status & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Verification Status</h2>

            {!verification ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No verification yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start an AI-powered copyright verification scan
                </p>
                <button
                  onClick={startVerification}
                  disabled={verifying}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Start Verification'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Confidence Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {verification.confidence_score}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Conflicts Found</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {conflicts.length}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">Verified Catalogs</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {verification.verified_catalogs?.map((catalog) => (
                      <span
                        key={catalog}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {catalog}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={startVerification}
                  disabled={verifying}
                  className="w-full mt-4 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {verifying ? 'Re-verifying...' : 'Re-verify'}
                </button>
              </div>
            )}
          </div>

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Potential Conflicts</h2>
                <button
                  onClick={() => setShowClearanceForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Submit Clearance
                </button>
              </div>
              <ConflictsList conflicts={conflicts} />
            </div>
          )}

          {/* Clearance Form Modal */}
          {showClearanceForm && (
            <ClearanceForm
              releaseId={releaseId}
              verificationId={verification?.id}
              onClose={() => setShowClearanceForm(false)}
              onSubmit={() => {
                setShowClearanceForm(false);
                loadData();
              }}
            />
          )}
        </div>

        {/* Right Column - History & Info */}
        <div className="space-y-6">
          {/* Protection Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Legal Protection
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Copyright verification protects you from legal disputes and platform takedowns.
            </p>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                AI-powered audio fingerprinting
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Melody pattern matching
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Global database checking
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Sample clearance tracking
              </li>
            </ul>
          </div>

          {/* Verification History */}
          {verification && (
            <VerificationHistory releaseId={releaseId} />
          )}
        </div>
      </div>
    </div>
  );
}
