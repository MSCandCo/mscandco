// Artist Analytics Management Page - Self Management
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/components/providers/SupabaseProvider';
import Layout from '../../components/layouts/mainLayout';
import AdminAnalyticsInterface from '../../components/analytics/AdminAnalyticsInterface';
import { 
  BarChart3, 
  Music, 
  Settings,
  TrendingUp,
  Edit3,
  User
} from 'lucide-react';

export default function ArtistAnalyticsManagement() {
  const { user, isLoading } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch artist's own profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
        } else {
          setUserProfile(profile);
          console.log('👤 Artist profile loaded:', profile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleDataUpdated = () => {
    console.log('🎯 Analytics data updated for artist:', userProfile?.first_name);
    // Could refresh analytics preview here
  };

  if (isLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access your analytics management.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                My Analytics Management
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Manage your analytics data, latest releases, milestones, and performance metrics
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            
            {/* Artist Profile Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-6">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">
                      {userProfile?.artist_name || 
                       (userProfile?.first_name && userProfile?.last_name 
                         ? `${userProfile.first_name} ${userProfile.last_name}` 
                         : user.email)
                      }
                    </h2>
                    <p className="text-slate-600 mb-2">{user.email}</p>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Artist Profile
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        Self-Management
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-slate-500">
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">Analytics</p>
                  </div>
                  <div className="text-center">
                    <Music className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">Releases</p>
                  </div>
                  <div className="text-center">
                    <Settings className="w-6 h-6 mx-auto mb-1" />
                    <p className="text-xs">Settings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Edit3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Manage Your Analytics</h3>
                  <p className="text-slate-700 mb-4">
                    Update your latest releases, milestones, and performance data. This information will be displayed 
                    on your artist analytics page and used for insights and reporting.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-slate-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Basic Analytics: Latest Release + Recent Milestones
                    </div>
                    <div className="flex items-center text-slate-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Advanced Analytics: 10 comprehensive sections
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Analytics Interface - Self Management */}
            {userProfile && (
              <AdminAnalyticsInterface 
                selectedArtistId={user.id}
                selectedArtistData={{
                  id: user.id,
                  email: user.email,
                  first_name: userProfile.first_name,
                  last_name: userProfile.last_name,
                  artist_name: userProfile.artist_name,
                  role: userProfile.role || 'artist'
                }}
                onDataUpdated={handleDataUpdated} 
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
