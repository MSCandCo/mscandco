import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { COMPANY_INFO } from '@/lib/brand-config';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import RoleBasedNavigation from '@/components/navigation/RoleBasedNavigation';
import { Button, Card, Badge, Progress } from 'flowbite-react';
import { 
  HiMusicNote, 
  HiCollection, 
  HiClock, 
  HiCalendar,
  HiChartBar,
  HiUserGroup,
  HiTag,
  HiGlobeAlt,
  HiPlus,
  HiEye,
  HiPencil,
  HiDownload,
  HiFilter
} from 'react-icons/hi';

function DistributionPartnerDashboard() {
  const { user } = useAuth0();
  const [stats, setStats] = useState({
    totalCreations: 0,
    activeProjects: 0,
    pendingReleases: 0,
    thisMonthReleases: 0,
    totalArtists: 0,
    totalLabels: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [genreStats, setGenreStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      setStats({
        totalCreations: 1247,
        activeProjects: 89,
        pendingReleases: 23,
        thisMonthReleases: 15,
        totalArtists: 156,
        totalLabels: 34
      });

      setRecentActivity([
        {
          id: 1,
          type: 'creation_submitted',
          title: 'New Creation Submitted',
          description: 'Gospel Vibes - HTay',
          artist: 'HTay',
          timestamp: '2 hours ago',
          status: 'pending'
        },
        {
          id: 2,
          type: 'project_updated',
          title: 'Project Updated',
          description: 'Worship Collection Vol. 2',
          artist: 'Various Artists',
          timestamp: '4 hours ago',
          status: 'in_progress'
        },
        {
          id: 3,
          type: 'release_approved',
          title: 'Release Approved',
          description: 'Praise & Worship Hits',
          artist: 'Gospel Collective',
          timestamp: '1 day ago',
          status: 'approved'
        }
      ]);

      setGenreStats([
        { genre: 'Gospel', count: 456, percentage: 36.6 },
        { genre: 'Worship', count: 234, percentage: 18.8 },
        { genre: 'Contemporary Christian', count: 189, percentage: 15.2 },
        { genre: 'Christian Rock', count: 156, percentage: 12.5 },
        { genre: 'Inspirational', count: 123, percentage: 9.9 },
        { genre: 'Other', count: 89, percentage: 7.1 }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      in_progress: 'blue',
      approved: 'green',
      rejected: 'red'
    };
    return colors[status] || 'gray';
  };

  const getStatusIcon = (type) => {
    const icons = {
      creation_submitted: HiMusicNote,
      project_updated: HiCollection,
      release_approved: HiCalendar
    };
    return icons[type] || HiEye;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading distribution dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Distribution Partner Dashboard - {COMPANY_INFO.name}</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
                  ← Back to Main Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Distribution Partner Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button color="blue" size="sm">
                  <HiPlus className="w-4 h-4 mr-2" />
                  New Creation
                </Button>
                <Button color="gray" size="sm">
                  <HiDownload className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <HiGlobeAlt className="w-6 h-6 text-blue-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Distribution Navigation</h2>
                </div>
                <RoleBasedNavigation />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-blue-100">
                        <HiMusicNote className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Creations</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalCreations.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100">
                        <HiCollection className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Projects</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-yellow-100">
                        <HiClock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pending Releases</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pendingReleases}</p>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-purple-100">
                        <HiCalendar className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">This Month</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.thisMonthReleases}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Genre Distribution</h3>
                      <Button size="xs" color="gray">
                        <HiEye className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {genreStats.map((stat, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 rounded-full" style={{
                              backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                            }}></div>
                            <span className="text-sm font-medium text-gray-700">{stat.genre}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{stat.count}</span>
                            <span className="text-xs text-gray-500">({stat.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
                      <Button size="xs" color="gray">
                        <HiChartBar className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalArtists}</div>
                        <div className="text-sm text-gray-600">Total Artists</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.totalLabels}</div>
                        <div className="text-sm text-gray-600">Total Labels</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">89%</div>
                        <div className="text-sm text-gray-600">Approval Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">2.3</div>
                        <div className="text-sm text-gray-600">Avg Tracks/Project</div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                    <Link href="/distribution/activity" className="text-blue-600 hover:text-blue-700 text-sm">
                      View All
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const IconComponent = getStatusIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className={`p-2 rounded-full bg-${getStatusColor(activity.status)}-100`}>
                            <IconComponent className={`w-4 h-4 text-${getStatusColor(activity.status)}-600`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                <p className="text-sm text-gray-600">{activity.description}</p>
                                <p className="text-xs text-gray-500">by {activity.artist}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge color={getStatusColor(activity.status)}>
                                  {activity.status.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-gray-500">{activity.timestamp}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/distribution/creations">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <div className="text-center">
                        <HiMusicNote className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-900">All Creations</h4>
                        <p className="text-sm text-gray-600">Manage all music creations</p>
                      </div>
                    </Card>
                  </Link>

                  <Link href="/distribution/projects">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <div className="text-center">
                        <HiCollection className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-900">All Projects</h4>
                        <p className="text-sm text-gray-600">View project overview</p>
                      </div>
                    </Card>
                  </Link>

                  <Link href="/distribution/sync-board">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <div className="text-center">
                        <HiGlobeAlt className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-900">Sync Board</h4>
                        <p className="text-sm text-gray-600">Visual status overview</p>
                      </div>
                    </Card>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DistributionDashboard() {
  return (
    <RoleProtectedRoute requiredRoles={['distribution_partner']}>
      <DistributionPartnerDashboard />
    </RoleProtectedRoute>
  );
} 