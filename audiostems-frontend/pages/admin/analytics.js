import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/mainLayout";
import SEO from "@/components/seo";
import { Card, Badge } from "flowbite-react";
import { HiUsers, HiDownload, HiMusicNote, HiCreditCard } from "lucide-react";
import useSWR from "swr";
import { apiRoute } from "@/lib/utils";
import moment from "moment";
import CurrencySelector, { formatCurrency, useCurrencySync } from "@/components/shared/CurrencySelector";

function AdminAnalytics() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  // Check if user is admin (example: email ends with @mscandco.com)
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user?.email?.endsWith('@mscandco.com')) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Comprehensive mock analytics data for admin dashboard
  const mockDownloadStats = [
    { id: 1, user: 'YHWH MSC', song: 'Urban Beat', date: '2024-01-16', type: 'stem' },
    { id: 2, user: 'Global Superstar', song: 'Hit Single #1', date: '2024-01-16', type: 'master' },
    { id: 3, user: 'Seoul Stars', song: 'Starlight', date: '2024-01-15', type: 'stem' },
    { id: 4, user: 'Rock Legends', song: 'Opening Anthem', date: '2024-01-15', type: 'master' },
    { id: 5, user: 'Carlos Mendez', song: 'Fuego', date: '2024-01-14', type: 'stem' },
    { id: 6, user: 'YHWH MSC', song: 'Street Rhythm', date: '2024-01-14', type: 'stem' },
    { id: 7, user: 'Global Superstar', song: 'Radio Favorite', date: '2024-01-13', type: 'master' },
    { id: 8, user: 'Seoul Stars', song: 'Electric Love', date: '2024-01-13', type: 'stem' },
    { id: 9, user: 'YHWH MSC', song: 'City Lights', date: '2024-01-12', type: 'stem' },
    { id: 10, user: 'Rock Legends', song: 'Classic Hit (Live)', date: '2024-01-12', type: 'master' }
  ];

  const mockUserStats = [
    { id: 1, name: 'YHWH MSC', role: 'artist', status: 'active', releases: 6, streams: 125000, earnings: 2840 },
    { id: 2, name: 'Global Superstar', role: 'artist', status: 'active', releases: 1, streams: 2800000, earnings: 45600 },
    { id: 3, name: 'Seoul Stars', role: 'artist', status: 'active', releases: 1, streams: 4500000, earnings: 67200 },
    { id: 4, name: 'Rock Legends', role: 'artist', status: 'active', releases: 1, streams: 1200000, earnings: 18400 },
    { id: 5, name: 'Code Group Distribution', role: 'distribution_partner', status: 'active', releases: 21, streams: 15000000, earnings: 180000 },
    { id: 6, name: 'DJ Phoenix', role: 'artist', status: 'pending', releases: 1, streams: 0, earnings: 0 },
    { id: 7, name: 'Carlos Mendez', role: 'artist', status: 'active', releases: 1, streams: 280000, earnings: 4120 },
    { id: 8, name: 'Emma Rodriguez', role: 'artist', status: 'pending', releases: 1, streams: 0, earnings: 0 },
    { id: 9, name: 'Marcus Williams Quartet', role: 'artist', status: 'inactive', releases: 1, streams: 0, earnings: 0 },
    { id: 10, name: 'The Basement Band', role: 'artist', status: 'pending', releases: 1, streams: 0, earnings: 0 },
    { id: 11, name: 'Film Composer Orchestra', role: 'artist', status: 'pending', releases: 1, streams: 0, earnings: 0 },
    { id: 12, name: 'Nashville Dreams', role: 'artist', status: 'inactive', releases: 1, streams: 0, earnings: 0 },
    { id: 13, name: 'Super Admin User', role: 'super_admin', status: 'active', releases: 0, streams: 0, earnings: 0 },
    { id: 14, name: 'Company Admin User', role: 'company_admin', status: 'active', releases: 0, streams: 0, earnings: 0 }
  ];

  // Calculate platform totals with currency support
  const totalRevenue = mockUserStats.reduce((sum, user) => sum + user.earnings, 0);

  const mockSongStats = [
    { id: 1, title: 'Urban Beat', artist: 'YHWH MSC', streams: 45000, downloads: 234, status: 'active' },
    { id: 2, title: 'Starlight', artist: 'Seoul Stars', streams: 1500000, downloads: 5670, status: 'active' },
    { id: 3, title: 'Hit Single #1', artist: 'Global Superstar', streams: 950000, downloads: 3420, status: 'active' },
    { id: 4, title: 'Radio Favorite', artist: 'Global Superstar', streams: 890000, downloads: 2890, status: 'active' },
    { id: 5, title: 'Electric Love', artist: 'Seoul Stars', streams: 1200000, downloads: 4350, status: 'active' },
    { id: 6, title: 'Opening Anthem (Live)', artist: 'Rock Legends', streams: 400000, downloads: 1230, status: 'active' },
    { id: 7, title: 'Street Rhythm', artist: 'YHWH MSC', streams: 38000, downloads: 187, status: 'active' },
    { id: 8, title: 'City Lights', artist: 'YHWH MSC', streams: 42000, downloads: 203, status: 'active' },
    { id: 9, title: 'Fuego', artist: 'Carlos Mendez', streams: 280000, downloads: 890, status: 'active' },
    { id: 10, title: 'Digital Sunrise', artist: 'DJ Phoenix', streams: 0, downloads: 0, status: 'pending' }
  ];

  const mockStemStats = [
    { id: 1, title: 'Urban Beat - Vocals', song: 'Urban Beat', downloads: 89, type: 'vocals' },
    { id: 2, title: 'Urban Beat - Instrumental', song: 'Urban Beat', downloads: 145, type: 'instrumental' },
    { id: 3, title: 'Starlight - Vocals', song: 'Starlight', downloads: 1890, type: 'vocals' },
    { id: 4, title: 'Starlight - Instrumental', song: 'Starlight', downloads: 2340, type: 'instrumental' },
    { id: 5, title: 'Hit Single #1 - Acapella', song: 'Hit Single #1', downloads: 1120, type: 'vocals' },
    { id: 6, title: 'Electric Love - Vocals', song: 'Electric Love', downloads: 1450, type: 'vocals' },
    { id: 7, title: 'Opening Anthem - Live Vocals', song: 'Opening Anthem (Live)', downloads: 410, type: 'vocals' },
    { id: 8, title: 'Street Rhythm - Drums', song: 'Street Rhythm', downloads: 67, type: 'drums' },
    { id: 9, title: 'Fuego - Instrumental', song: 'Fuego', downloads: 290, type: 'instrumental' },
    { id: 10, title: 'City Lights - Synth', song: 'City Lights', downloads: 78, type: 'synth' }
  ];

  // Use mock data instead of API calls
  const downloadStats = { data: mockDownloadStats };
  const userStats = { data: mockUserStats };
  const songStats = { data: mockSongStats };
  const stemStats = { data: mockStemStats };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user?.email?.endsWith('@mscandco.com')) {
    return null;
  }

  const totalDownloads = downloadStats?.data?.length || 0;
  const totalUsers = userStats?.data?.length || 0;
  const totalSongs = songStats?.data?.length || 0;
  const totalStems = stemStats?.data?.length || 0;

  const recentDownloads = downloadStats?.data?.slice(0, 10) || [];

  return (
    <MainLayout>
      <SEO pageTitle="Admin Analytics" />
      <div className="py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Analytics</h1>
            <CurrencySelector 
              selectedCurrency={selectedCurrency}
              onCurrencyChange={updateCurrency}
              compact={true}
            />
          </div>
          
          {/* Stats Cards */}
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <HiUsers className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <HiDownload className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Downloads</p>
                  <p className="text-2xl font-bold">{totalDownloads}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <HiMusicNote className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Songs</p>
                  <p className="text-2xl font-bold">{totalSongs}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <HiCreditCard className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Stems</p>
                  <p className="text-2xl font-bold">{totalStems}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <HiCreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue, selectedCurrency)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Downloads */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Recent Downloads</h2>
            <div className="space-y-3">
              {recentDownloads.map((download) => (
                <div key={download.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">{download.attributes.contentTitle}</p>
                    <p className="text-sm text-gray-600">
                      {download.attributes.user?.data?.attributes?.firstName} {download.attributes.user?.data?.attributes?.lastName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color="gray">
                      {download.attributes.contentType}
                    </Badge>
                    <Badge color="blue">
                      {download.attributes.creditsSpent} credit{download.attributes.creditsSpent !== 1 ? 's' : ''}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {moment(download.attributes.downloadDate).format('MMM DD, YYYY')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

export default AdminAnalytics; 