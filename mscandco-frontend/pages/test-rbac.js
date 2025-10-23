import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/router';
import { Shield, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { supabase } from '@/lib/supabase';
import { requirePermission } from '@/lib/serverSidePermissions';


// Server-side permission check BEFORE page renders
// Test page requires at least basic user access
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, '*:*:*');

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

export default function TestRBAC() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runRBACTest = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      // Get session token for API calls
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        setError('No authentication token available');
        setLoading(false);
        return;
      }

      console.log('Testing RBAC with token:', token.substring(0, 50) + '...');

      const response = await fetch('/api/test-rbac', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('RBAC Test Response:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        setTestResult({
          success: true,
          data: result
        });
      } else {
        const errorData = await response.json();
        setTestResult({
          success: false,
          status: response.status,
          error: errorData
        });
      }
    } catch (err) {
      console.error('RBAC Test Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO pageTitle="RBAC Test" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 mr-3" />
            <h1 className="text-3xl font-bold">RBAC Middleware Test</h1>
          </div>
          <p className="text-blue-100">
            Test the Role-Based Access Control middleware functionality
          </p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current User</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Role</label>
              <p className="text-gray-900">{user?.role || 'Unknown'}</p>
            </div>
          </div>
        </div>

        {/* Test Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Permission Test</h2>
          <p className="text-gray-600 mb-6">
            This test calls an API route protected with <code className="bg-gray-100 px-2 py-1 rounded">requirePermission('user:view:any')</code>.
            <br />
            <strong>Expected Results:</strong>
            <br />
            • <span className="text-green-600">✓ Success</span> for Company Admin and Super Admin
            <br />
            • <span className="text-red-600">✗ Failure (403)</span> for Artist, Label Admin, Distribution Partner
          </p>
          
          <button
            onClick={runRBACTest}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Run RBAC Test
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center mb-2">
              <XCircle className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-red-800">Test Error</h3>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Test Results */}
        {testResult && (
          <div className={`border rounded-xl p-6 ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center mb-4">
              {testResult.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 mr-2" />
              )}
              <h3 className={`text-xl font-semibold ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? 'Test Passed!' : 'Test Failed'}
              </h3>
            </div>

            {testResult.success ? (
              <div className="space-y-4">
                <p className="text-green-700 font-medium">
                  {testResult.data.message}
                </p>
                
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Response Data:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-600">User ID:</label>
                      <p className="text-gray-900 font-mono">{testResult.data.data.userId}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-600">Email:</label>
                      <p className="text-gray-900">{testResult.data.data.userEmail}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-600">Role:</label>
                      <p className="text-gray-900">{testResult.data.data.userRole}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-600">Permission:</label>
                      <p className="text-gray-900">{testResult.data.data.permissions.tested}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="font-medium text-gray-600">Timestamp:</label>
                    <p className="text-gray-900 text-sm">{testResult.data.data.timestamp}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Error Details:</h4>
                  <div className="text-sm space-y-2">
                    <div>
                      <label className="font-medium text-gray-600">Status Code:</label>
                      <p className="text-gray-900">{testResult.status}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-600">Error:</label>
                      <p className="text-gray-900">{testResult.error.error}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-600">Message:</label>
                      <p className="text-gray-900">{testResult.error.message}</p>
                    </div>
                    {testResult.error.required_permissions && (
                      <div>
                        <label className="font-medium text-gray-600">Required Permissions:</label>
                        <p className="text-gray-900">{testResult.error.required_permissions.join(', ')}</p>
                      </div>
                    )}
                    {testResult.error.user_role && (
                      <div>
                        <label className="font-medium text-gray-600">Your Role:</label>
                        <p className="text-gray-900">{testResult.error.user_role}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-yellow-800">Test Instructions</h3>
          </div>
          <div className="text-yellow-700 space-y-2">
            <p>1. <strong>Company Admin or Super Admin:</strong> Should see "Test Passed!" with user details</p>
            <p>2. <strong>Artist, Label Admin, or Distribution Partner:</strong> Should see "Test Failed" with 403 Forbidden error</p>
            <p>3. Check the browser console for detailed request/response logs</p>
            <p>4. If you get a 401 error, the auth token might be invalid - try logging out and back in</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

