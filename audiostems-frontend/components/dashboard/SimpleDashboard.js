import { useUser } from '@/components/providers/SupabaseProvider';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { getUserRole } from '@/lib/user-utils';

export default function SimpleDashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const goToHomepage = () => {
    router.push('/');
  };

  const fixUserRole = async () => {
    try {
      console.log('🔧 Fixing user role for user:', user.id);
      
      // First, let's check what's currently in the database
      const { data: currentProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      console.log('📋 Current profile role:', currentProfile?.role);
      
      if (fetchError) {
        console.error('❌ Error fetching current profile:', fetchError);
        return;
      }
      
      // Update user metadata
      console.log('📝 Updating user metadata...');
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          role: 'artist',
          updated_at: new Date().toISOString()
        }
      });
      
      if (metadataError) {
        console.error('❌ Metadata update error:', metadataError);
      } else {
        console.log('✅ Metadata updated successfully');
      }
      
      // Update profile in database
      console.log('📝 Updating profile in database...');
      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          role: 'artist',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select();
      
      if (profileError) {
        console.error('❌ Profile update error:', profileError);
        alert(`Error updating profile: ${profileError.message}`);
      } else {
        console.log('✅ Profile updated successfully!', data);
        
        // Force refresh the user session to get updated data
        console.log('🔄 Refreshing user session...');
        await supabase.auth.refreshSession();
        
        alert('Role updated successfully! Page will refresh.');
        // Small delay before refresh to see the alert
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Unexpected error fixing role:', error);
      alert(`Unexpected error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (user) {
      // Get user role with proper fallback logic
      let finalRole = 'artist'; // Default fallback
      
      if (user.role && user.role !== 'authenticated') {
        finalRole = user.role;
      } else if (user.user_metadata?.role && user.user_metadata.role !== 'authenticated') {
        finalRole = user.user_metadata.role;
      }
      
      setUserRole(finalRole);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f2937] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h2>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              {/* Brand Logo */}
              <div className="flex items-center space-x-4 mb-2">
                <div className="text-2xl font-bold text-gray-900">MSC & Co</div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user.first_name || user.display_name || 'User'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Role: {userRole || user.role || 'artist'} • Email: {user.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={goToHomepage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🏠 Homepage
              </button>
              {userRole === 'authenticated' && (
                <button
                  onClick={fixUserRole}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  🔧 Fix Role
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🚪 Logout
              </button>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Logged In
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {user.first_name} {user.last_name}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Role:</span> {userRole || user.role || 'artist'}</p>
              <p><span className="font-medium">City:</span> {user.city || 'Not specified'}</p>
              <p><span className="font-medium">Country:</span> {user.country || 'Not specified'}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Releases</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Projects</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Earnings</span>
                <span className="font-semibold">£0.00</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Create New Release
              </button>
              <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                View Profile
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                Upload Music
              </button>
            </div>
          </div>

        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400 mt-1">Your activity will appear here once you start using the platform</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  🎉 Registration & Login Successful!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your account has been successfully created and you're now logged in. 
                    All the authentication issues have been resolved!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
