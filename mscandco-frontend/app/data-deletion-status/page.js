'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DataDeletionStatus() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!code) {
      setStatus('error');
      return;
    }

    fetch(`/api/auth/data-deletion?code=${code}`)
      .then(res => res.json())
      .then(data => {
        setStatus(data.status);
        setData(data);
      })
      .catch(err => {
        console.error(err);
        setStatus('error');
      });
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Checking Status...
              </h1>
            </>
          )}

          {status === 'completed' && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Data Deleted Successfully
              </h1>
              <p className="text-gray-600 mb-4">
                Your data has been permanently removed from our system.
              </p>
              {data && (
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-left">
                  <p className="mb-1">
                    <span className="font-medium">Platform:</span> {data.platform}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Requested:</span>{' '}
                    {new Date(data.requested_at).toLocaleString()}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Confirmation Code:</span>{' '}
                    <code className="bg-gray-200 px-1 rounded">{code}</code>
                  </p>
                </div>
              )}
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Invalid Request
              </h1>
              <p className="text-gray-600">
                The confirmation code is invalid or has expired.
              </p>
            </>
          )}

          {status === 'not_found' && (
            <>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Record Not Found
              </h1>
              <p className="text-gray-600">
                No deletion request found with this confirmation code.
              </p>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              What data was deleted?
            </h2>
            <ul className="text-sm text-gray-600 text-left space-y-1">
              <li>• Social media connection tokens</li>
              <li>• Scheduled social media posts</li>
              <li>• Platform account information</li>
              <li>• OAuth access credentials</li>
            </ul>
          </div>

          <div className="mt-6">
            <a
              href="https://mscandco.com"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Return to MSC & Co →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
