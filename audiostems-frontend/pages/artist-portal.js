import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { Button, Card, Alert, Progress } from 'flowbite-react';
import { HiUser, HiMusicNote, HiChartBar, HiCog, HiCheck } from 'react-icons/hi';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';

export default function ArtistPortal() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const router = useRouter();
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      checkProfileCompletion();
    }
  }, [user]);

  const checkProfileCompletion = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('/api/auth/check-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileComplete(data.profileComplete);
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <SEO pageTitle="Artist Portal - AudioStems" />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Your Artist Portal
            </h1>
            <p className="text-gray-600">
              Complete your profile and start your music distribution journey
            </p>
          </div>

          {/* Profile Completion Status */}
          {!profileComplete && (
            <Alert color="warning" className="mb-6">
              <div className="flex items-center">
                <HiCog className="w-5 h-5 mr-2" />
                <span className="font-medium">Profile Incomplete</span>
              </div>
              <p className="mt-2">
                Please complete your artist profile to access all features.
              </p>
            </Alert>
          )}

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Management */}
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <HiUser className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Profile Management</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Update your artist information, contact details, and social media links.
              </p>
              <Button 
                color="blue" 
                className="w-full"
                onClick={() => router.push('/artist-portal/profile')}
              >
                Manage Profile
              </Button>
            </Card>

            {/* Music Distribution */}
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <HiMusicNote className="w-8 h-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Music Distribution</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Upload and distribute your music to major streaming platforms worldwide.
              </p>
              <Button 
                color="green" 
                className="w-full"
                disabled={!profileComplete}
                onClick={() => router.push('/artist-portal/distribution')}
              >
                {profileComplete ? 'Start Distribution' : 'Complete Profile First'}
              </Button>
            </Card>

            {/* Analytics & Reports */}
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <HiChartBar className="w-8 h-8 text-purple-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Analytics & Reports</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Track your music performance, streaming data, and revenue analytics.
              </p>
              <Button 
                color="purple" 
                className="w-full"
                disabled={!profileComplete}
                onClick={() => router.push('/artist-portal/analytics')}
              >
                {profileComplete ? 'View Analytics' : 'Complete Profile First'}
              </Button>
            </Card>

            {/* Publishing */}
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <HiCog className="w-8 h-8 text-orange-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Publishing</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Manage your publishing rights, royalties, and licensing agreements.
              </p>
              <Button 
                color="orange" 
                className="w-full"
                disabled={!profileComplete}
                onClick={() => router.push('/artist-portal/publishing')}
              >
                {profileComplete ? 'Manage Publishing' : 'Complete Profile First'}
              </Button>
            </Card>

            {/* Contract Management */}
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <HiCheck className="w-8 h-8 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Contract Management</h3>
              </div>
              <p className="text-gray-600 mb-4">
                View and manage your distribution contracts and agreements.
              </p>
              <Button 
                color="indigo" 
                className="w-full"
                disabled={!profileComplete}
                onClick={() => router.push('/artist-portal/contracts')}
              >
                {profileComplete ? 'View Contracts' : 'Complete Profile First'}
              </Button>
            </Card>

            {/* Support & Resources */}
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <HiUser className="w-8 h-8 text-teal-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Support & Resources</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Access tutorials, guides, and get help from our support team.
              </p>
              <Button 
                color="teal" 
                className="w-full"
                onClick={() => router.push('/artist-portal/support')}
              >
                Get Support
              </Button>
            </Card>
          </div>

          {/* Quick Stats */}
          {profileComplete && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Tracks Distributed</div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Total Streams</div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">$0.00</div>
                    <div className="text-sm text-gray-600">Revenue Earned</div>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-gray-600">Active Contracts</div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 