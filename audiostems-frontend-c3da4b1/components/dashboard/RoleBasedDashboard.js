import { useUser } from '@/components/providers/SupabaseProvider';
import { Card, Badge, Button } from 'flowbite-react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { LoadingState } from '@/components/shared/EmptyStates';
import { getUsers, getReleases } from '@/lib/emptyData';
import { getUserBrand } from '@/lib/user-utils';
import { useUserRole } from '@/hooks/useUserRole';

// Empty stats - all zeros for clean start
const getEmptyStats = () => ({
  superAdmin: {
    totalUsers: 0,
    activeProjects: 0,
    totalRevenue: 0,
    totalArtists: 0
  },
  companyAdmin: {
    brandUsers: 0,
    activeProjects: 0,
    brandRevenue: 0,
    totalContent: 0
  },
  labelAdmin: {
    labelArtists: 0,
    activeContracts: 0,
    labelRevenue: 0,
    pendingReleases: 0
  },
  distributionPartner: {
    distributedContent: 0,
    partnerRevenue: 0,
    activeArtists: 0,
    successRate: 0
  },
  artist: {
    totalReleases: 0,
    totalStreams: 0,
    totalEarnings: 0,
    activeProjects: 0
  }
});

// Helper to get brand display name
const getDefaultDisplayBrand = (role) => {
  switch(role) {
    case 'super_admin':
    case 'company_admin':
      return 'MSC & Co';
    case 'artist':
      return 'YHWH MSC';
    default:
      return 'MSC & Co';
  }
};

// Video render function for artist dashboard
const renderArtistVideo = (currentVideo, isMuted, setIsMuted) => {
  if (!currentVideo) return null;

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
      <div className="relative aspect-video">
        <video
          src={currentVideo.url}
          className="w-full h-full object-cover"
          autoPlay={true}
          loop={true}
          muted={true}
          playsInline={true}
          controls={false}
          preload="auto"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-1.5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold mb-1">{currentVideo.title}</h3>
              <div className="flex items-center space-x-2 text-xs opacity-90">
                <span>🆕 New Release</span>
              </div>
            </div>
            
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-2 transition-all duration-200"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function RoleBasedDashboard() {
  // ALL HOOKS MUST BE CALLED IN THE SAME ORDER EVERY TIME - NO EXCEPTIONS
  const { user, isLoading } = useUser();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [userRole, setUserRole] = useState('artist'); // Default to artist as string
  
  // Video state - ALWAYS called for consistent hook count
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  
  // Get user role safely
  useEffect(() => {
    if (user) {
      // For now, default to artist to avoid async issues
      // This will be improved later
      setUserRole('artist');
    }
  }, [user]);
  
  // Show loading state while user data is being fetched
  if (isLoading || !user) {
    return <LoadingState />;
  }
  const displayBrand = userRole ? getDefaultDisplayBrand(userRole) : null;
  const userBrand = user ? getUserBrand(user) : null;
  
  // Initialize video ONLY for artists
  useEffect(() => {
    if (userRole === 'artist') {
      setCurrentVideo({
        url: '/YAHWEH - Angeloh, CalledOut Music & Tbabz [Lyric Video].mp4',
        title: 'YAHWEH - Angeloh, CalledOut Music & Tbabz',
        description: 'Latest Release - Lyric Video'
      });
    }
  }, [userRole]);
  
  // Calculate approved artists for label admin
  const approvedArtists = useMemo(() => {
    if (userRole !== 'label_admin') return [];
    
    const labelName = userBrand?.displayName || 'YHWH MSC';
    return getUsers()
      .filter(u => u.role === 'artist' && u.approvalStatus === 'approved' && 
                   (u.label === labelName || u.brand === labelName))
      .map(artist => ({
        ...artist,
        releases: 0,
        totalEarnings: 0,
        totalStreams: 0,
        followers: 0,
        avatar: artist.avatar || '🎤'
      }));
  }, [userRole, userBrand?.displayName]);

  // Early return AFTER all hooks
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-base font-bold text-gray-900 mb-3">Please log in to access your dashboard</h2>
          <Button href="/login">Sign In</Button>
        </div>
      </div>
    );
  }

  // Get user's subscription plan
  const userPlan = user?.plan || 'Artist Starter';
  const isProPlan = userPlan?.includes('Pro');

  // Get dashboard content based on role and plan
  const getDashboardContent = () => {
    const stats = getEmptyStats();
    
    switch (userRole) {
      case 'super_admin':
        return {
          title: 'Super Admin Dashboard',
          subtitle: `Welcome to ${displayBrand} - Company Overview`,
          description: 'Manage all brands, users, and platform settings',
          stats: [
            { label: 'Total Users', value: '0', change: '0%', changeType: 'neutral' },
            { label: 'Active Projects', value: '0', change: '0%', changeType: 'neutral' },
            { label: 'Revenue', value: formatCurrency(0, selectedCurrency), change: '0%', changeType: 'neutral' },
            { label: 'Total Artists', value: '0', change: '0 releases', changeType: 'neutral' }
          ],
          cards: [
            {
              title: 'User Management',
              description: 'Manage all platform users and permissions',
              icon: '👥',
              href: '/admin/users',
              stats: { total: 0, active: 0, pending: 0 }
            },
            {
              title: 'Content Management',
              description: 'Oversee all content and releases',
              icon: '📚',
              href: '/admin/content',
              stats: { total: 0, pending: 0, live: 0 }
            },
            {
              title: 'Analytics Overview',
              description: 'Platform-wide analytics and insights',
              icon: '📊',
              href: '/admin/analytics',
              stats: { revenue: formatCurrency(0, selectedCurrency), users: 0, content: 0 }
            }
          ]
        };

      case 'company_admin':
        return {
          title: `${displayBrand} - Company Admin Dashboard`,
          subtitle: 'Brand management and oversight',
          description: 'Manage your brand users and content',
          stats: [
            { label: 'Brand Artists', value: '0', change: '0%', changeType: 'neutral' },
            { label: 'Active Projects', value: '0', change: '0%', changeType: 'neutral' },
            { label: 'Revenue', value: formatCurrency(0, selectedCurrency), change: '0%', changeType: 'neutral' },
            { label: 'Total Content', value: '0', change: '0 this month', changeType: 'neutral' }
          ],
          cards: [
            {
              title: 'Artist Management',
              description: 'Manage brand artists and approvals',
              icon: '🎤',
              href: '/companyadmin/artists',
              stats: { artists: 0, pending: 0, approved: 0 }
            },
            {
              title: 'Content Oversight',
              description: 'Review and approve brand content',
              icon: '📝',
              href: '/companyadmin/content',
              stats: { pending: 0, approved: 0, total: 0 }
            },
            {
              title: 'Analytics',
              description: 'Brand performance analytics',
              icon: '📈',
              href: '/companyadmin/analytics',
              stats: { revenue: formatCurrency(0, selectedCurrency), streams: '0K', growth: '0%' }
            }
          ]
        };

      case 'label_admin':
        return {
          title: `${displayBrand} - Label Management Dashboard`,
          subtitle: 'Manage label artists, contracts, and revenue streams',
          description: 'Complete label administration and artist management platform',
          stats: [
            { label: 'Label Artists', value: '0', change: '0 this quarter', changeType: 'neutral' },
            { label: 'Active Contracts', value: '0', change: '0%', changeType: 'neutral' },
            { label: 'Label Revenue', value: formatCurrency(0, selectedCurrency), change: '0%', changeType: 'neutral' },
            { label: 'Pending Releases', value: '0', change: '0 in review', changeType: 'neutral' }
          ],
          cards: [
            {
              title: 'Artist Management',
              description: 'Manage label artists and their contracts',
              icon: '🎤',
              href: '/labeladmin/artists',
              stats: { artists: 0, contracts: 0 }
            },
            {
              title: 'Revenue Tracking',
              description: 'Monitor label earnings and artist royalties',
              icon: '💰',
              href: '/labeladmin/earnings',
              stats: { revenue: formatCurrency(0, selectedCurrency), royalties: formatCurrency(0, selectedCurrency) }
            },
            {
              title: 'Release Management',
              description: 'Oversee artist releases and submissions',
              icon: '🎵',
              href: '/labeladmin/releases',
              stats: { pending: 0, approved: 0, live: 0 }
            }
          ]
        };

      case 'distribution_partner':
        return {
          title: 'Distribution Partner Dashboard',
          subtitle: 'Content distribution and partnership management',
          description: 'Manage distribution partnerships and content delivery',
          stats: [
            { label: 'Distributed Content', value: '0', change: '0%', changeType: 'neutral' },
            { label: 'Partner Revenue', value: formatCurrency(0, selectedCurrency), change: '0%', changeType: 'neutral' },
            { label: 'Active Artists', value: '0', change: '0 total releases', changeType: 'neutral' },
            { label: 'Success Rate', value: '0%', change: '0%', changeType: 'neutral' }
          ],
          cards: [
            {
              title: 'Content Distribution',
              description: 'Manage content delivery to platforms',
              icon: '🌐',
              href: '/distributionpartner/content',
              stats: { distributed: 0, pending: 0, failed: 0 }
            },
            {
              title: 'Revenue Reports',
              description: 'Track distribution revenue and payments',
              icon: '💼',
              href: '/distributionpartner/reports',
              stats: { revenue: formatCurrency(0, selectedCurrency), pending: formatCurrency(0, selectedCurrency) }
            },
            {
              title: 'Analytics',
              description: 'Distribution performance metrics',
              icon: '📊',
              href: '/distributionpartner/analytics',
              stats: { platforms: 0, reach: '0K', efficiency: '0%' }
            }
          ]
        };

      case 'artist':
        const releaseLimit = isProPlan ? 'Unlimited' : '5';
        const planBadge = isProPlan ? '🌟 PRO' : '⭐ STARTER';
        
        return {
          title: 'Artist Dashboard',
          subtitle: `Your creative journey with YHWH MSC ${planBadge}`,
          description: `Manage your releases, track earnings, and grow your audience (${releaseLimit} releases)`,
          stats: [
            { 
              label: 'Total Releases', 
              value: '0', 
              change: isProPlan ? '0 this month' : '0 of 5 used', 
              changeType: 'neutral' 
            },
            { label: 'Total Streams', value: '0K', change: '0%', changeType: 'neutral' },
            { label: 'Total Earnings', value: formatCurrency(0, selectedCurrency), change: `+${formatCurrency(0, selectedCurrency)}`, changeType: 'neutral' },
            { label: 'Active Projects', value: '0', change: '0 in review', changeType: 'neutral' }
          ],
          cards: [
            {
              title: 'Music Releases',
              description: `Manage your music releases and track submissions (${releaseLimit} releases)`,
              icon: '🎵',
              href: '/artist/releases',
              stats: { 
                total: 0, 
                draft: 0, 
                submitted: 0,
                underReview: 0, 
                approvalRequired: 0,
                live: 0,
                completed: 0,
                planLimit: isProPlan ? '∞' : '5'
              }
            },
            {
              title: 'Earnings',
              description: 'Track your revenue from streaming platforms',
              icon: '💰',
              href: '/artist/earnings',
              stats: { 
                thisMonth: formatCurrency(0, selectedCurrency), 
                lastMonth: formatCurrency(0, selectedCurrency),
                total: formatCurrency(0, selectedCurrency)
              }
            },
            {
              title: isProPlan ? 'Advanced Analytics' : 'Basic Analytics',
              description: isProPlan 
                ? 'View detailed performance analytics & insights' 
                : 'View basic performance analytics',
              icon: '📈',
              href: '/artist/analytics',
              stats: { 
                streams: '0K', 
                listeners: '0', 
                countries: '0',
                topTrack: 'No tracks yet',
                analyticsLevel: isProPlan ? 'Advanced' : 'Basic'
              }
            },
            ...(isProPlan ? [{
              title: 'Pro Features',
              description: 'Early access to new features and priority support',
              icon: '🌟',
              href: '/artist/pro-features',
              stats: { 
                support: 'Priority',
                features: 'Early Access',
                storage: 'Enhanced'
              }
            }] : [{
              title: 'Upgrade to Pro',
              description: 'Unlock unlimited releases and advanced features',
              icon: '⬆️',
              href: '/billing',
              stats: { 
                releases: 'Unlimited',
                analytics: 'Advanced',
                support: 'Priority'
              }
            }])
          ]
        };

      default:
        return null;
    }
  };

  const dashboardContent = getDashboardContent();

  if (!dashboardContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingState message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Video Hero Banner for Artists */}
        {userRole === 'artist' && (
          <div className="relative mb-12 px-4 sm:px-0">
            {renderArtistVideo(currentVideo, isMuted, setIsMuted)}
            {/* Overlapping Dashboard Header */}
            <div className="absolute top-1/2 left-6 right-6 transform -translate-y-1/2 z-10">
              <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-6 text-white">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-bold">{dashboardContent.title}</h1>
                    <p className="text-base opacity-90">{dashboardContent.subtitle}</p>
                    <p className="text-sm opacity-75">{dashboardContent.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header (only show for non-artist roles) */}
        {userRole !== 'artist' && (
          <div className="px-4 py-4 sm:px-0">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xs font-bold text-gray-900">{dashboardContent.title}</h1>
                <p className="mt-0.5 text-xs text-gray-600">{dashboardContent.subtitle}</p>
                <p className="mt-0.5 text-xs text-gray-500">{dashboardContent.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardContent.stats.map((stat, index) => (
              <Card key={index} className="bg-white">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                    <p className="text-xs font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  {stat.change && (
                    <div className="flex items-center">
                      <Badge 
                        color={stat.changeType === 'positive' ? 'success' : stat.changeType === 'negative' ? 'failure' : 'info'}
                        className="text-xs"
                      >
                        {stat.change}
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="mt-6 px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardContent.cards.map((card, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xs mr-1">{card.icon}</span>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900">{card.title}</h3>
                      <p className="text-xs text-gray-600">{card.description}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="space-y-2 text-xs">
                    {Object.entries(card.stats).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-600 capitalize flex-shrink-0 mr-2">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="font-medium text-right">
                          {key === 'revenue' ? formatCurrency(value, selectedCurrency) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <Link href={card.href}>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded-lg transition-colors duration-200">
                      View {card.title}
                    </button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Approved Artists Section (Label Admin Only) */}
        {userRole === 'label_admin' && approvedArtists.length > 0 && (
          <div className="mt-6 px-4 sm:px-0">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 py-3 border-b border-gray-200">
                <div>
                  <h3 className="text-xs font-semibold text-gray-900">Approved Artists</h3>
                  <p className="text-xs text-gray-500">Artists under {userBrand?.displayName || 'YHWH MSC'} label</p>
                </div>
              </div>
              <div className="p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {approvedArtists.map((artist) => (
                    <div key={artist.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {artist.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-gray-900 truncate">{artist.name}</h4>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{artist.primaryGenre}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                          <span>{artist.releases} releases</span>
                          <span>{formatCurrency(artist.totalEarnings, selectedCurrency)}</span>
                          <span>{artist.totalStreams.toLocaleString()} streams</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {approvedArtists.length > 4 && (
                  <div className="mt-3 text-center">
                    <Link href="/labeladmin/artists">
                      <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                        View {approvedArtists.length - 4} more artists →
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}