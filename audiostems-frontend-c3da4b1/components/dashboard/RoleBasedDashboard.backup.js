import { useUser } from '@/components/providers/SupabaseProvider';
import { Card, Badge, Button } from 'flowbite-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { formatPercentage, formatGrowthPercentage } from '@/lib/number-utils';
import CurrencySelector, { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import { EmptyDashboard, EmptyAnalytics, LoadingState } from '@/components/shared/EmptyStates';
import { getUsers, getReleases } from '@/lib/emptyData';
import { getUserRole, getUserBrand } from '@/lib/user-utils';

// Default empty stats - to be replaced with real API data
const getEmptyStats = () => ({
  superAdmin: {
    totalUsers: 0,
    totalRoles: 5,
    totalSongs: 0,
    activeProjects: 0,
    totalRevenue: 0,
    totalBrands: 2,
    systemFeatures: 12
  },
  companyAdmin: {
    activeProjects: 0,
    brandRevenue: 0,
    contentItems: 0,
    brandUsers: 0,
    brandRoles: 3,
    totalViews: 0,
    engagement: 0
  },
  labelAdmin: {
    labelArtists: 0,
    labelReleases: 0,
    labelRevenue: 0,
    labelStreams: 0,
    activeContracts: 0,
    labelCountries: 0,
    totalTracks: 0
  },
  distributionPartner: {
    distributedContent: 0,
    partnerRevenue: 0,
    totalReleases: 0,
    successRate: 100,
    totalViews: 0
  },
  artist: {
    totalStreams: 0,
    countries: 0,
    topTrack: 'No tracks yet',
    growth: 0
  }
});

// Video render function (no hooks here)
const renderArtistVideoSection = (currentVideo, videoType, isMuted, setIsMuted) => {
  if (!currentVideo) return null;

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
      {/* Video Player */}
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
        
        {/* Video Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Video Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold mb-1">{currentVideo.title}</h3>
              <div className="flex items-center space-x-2 text-xs opacity-90">
                <span>{currentVideo.views} views</span>
                <span>{currentVideo.likes} likes</span>
                <span>{videoType === 'highest' ? '🔥 Trending' : '🆕 New Release'}</span>
              </div>
            </div>
            
            {/* Mute Control */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-3 transition-all duration-200"
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

// getUserRole and getUserBrand imported from lib/user-utils

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

export default function RoleBasedDashboard() {
  // ALL HOOKS MUST BE CALLED IN THE SAME ORDER EVERY TIME
  const { user } = useUser();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  
  // Video state - always called regardless of role
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoType, setVideoType] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  
  // Derived values (not hooks)
  const userRole = getUserRole(user);
  const displayBrand = getDefaultDisplayBrand(user);
  const userBrand = getUserBrand(user);
  
  // Initialize video for artists only
  useEffect(() => {
    if (userRole === 'artist') {
      setCurrentVideo({
        url: '/YAHWEH - Angeloh, CalledOut Music & Tbabz [Lyric Video].mp4',
        title: 'YAHWEH - Angeloh, CalledOut Music & Tbabz',
        description: 'Latest Release - Lyric Video'
      });
      setVideoType('Latest Release');
    }
  }, [userRole]);

  // Calculate approved artists for label admin
  const approvedArtists = useMemo(() => {
    if (userRole !== 'label_admin') return [];
    
    const labelName = userBrand?.displayName || 'YHWH MSC';
    
    const filteredArtists = getUsers().filter(user => 
      user.role === 'artist' &&
      user.approvalStatus === 'approved' && 
      (user.label === labelName || user.brand === labelName)
    );
    
    return filteredArtists.map(artist => {
      // Use data directly from universal database
      const totalEarnings = artist.totalRevenue || artist.totalEarnings || 0;
      const totalStreams = artist.totalStreams || 0;
      const totalReleases = artist.totalReleases || 0;
      
      return {
        ...artist,
        releases: totalReleases,
        totalEarnings,
        totalStreams,
        followers: artist.followers || 0,
        lastRelease: artist.lastLogin || artist.joinDate,
        avatar: artist.avatar || '🎤'
      };
    });
  }, [userRole, userBrand?.displayName]);

  // Early return check AFTER all hooks are called
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Please log in to access your dashboard</h2>
          <Button href="/login">Sign In</Button>
        </div>
      </div>
    );
  }

  // Dashboard content based on role
  const getDashboardContent = () => {

    
    switch (userRole) {
      case 'super_admin':
    
        return {
          title: 'Super Admin Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Company Overview`,
          description: 'Manage all brands, users, and platform settings',
          stats: [
            { label: 'Total Users', value: getEmptyStats().superAdmin.totalUsers.toLocaleString(), change: '0%', changeType: 'neutral' },
            { label: 'Active Projects', value: getEmptyStats().superAdmin.activeProjects.toString(), change: '0%', changeType: 'neutral' },
            { label: 'Revenue', value: formatCurrency(getEmptyStats().superAdmin.totalRevenue, selectedCurrency), change: '0%', changeType: 'neutral' },
            { label: 'Total Artists', value: getUsers().filter(u => u.role === 'artist').length.toString(), change: `${getReleases().length} releases`, changeType: 'neutral' }
          ],
          cards: [
            {
              title: 'User Management',
              description: 'Manage all platform users and roles',
              icon: '👥',
              href: '/superadmin/users',
              stats: { users: getEmptyStats().superAdmin.totalUsers, roles: getEmptyStats().superAdmin.totalRoles }
            },
            {
              title: 'Content Management',
              description: 'Oversee all platform content',
              icon: '📁',
              href: '/superadmin/content',
              stats: { songs: getEmptyStats().superAdmin.totalSongs, projects: getEmptyStats().superAdmin.activeProjects }
            },
            {
              title: 'System Settings',
              description: 'Configure platform settings',
              icon: '⚙️',
              href: '/superadmin/settings',
              stats: { brands: getEmptyStats().superAdmin.totalBrands, features: getEmptyStats().superAdmin.systemFeatures }
            }
          ]
        };

      case 'company_admin':
    
        return {
          title: 'Company Admin Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Brand Management`,
          description: 'Manage your brand users and content',
          stats: [
            { label: 'Brand Artists', value: getUsers().filter(u => u.role === 'artist' && u.brand === displayBrand?.displayName).length.toString(), change: '0%', changeType: 'neutral' },
            { label: 'Active Projects', value: getEmptyStats().companyAdmin.activeProjects.toString(), change: '0%', changeType: 'neutral' },
            { label: 'Revenue', value: formatCurrency(getEmptyStats().companyAdmin.brandRevenue, selectedCurrency), change: '0%', changeType: 'neutral' },
            { label: 'Content Items', value: getEmptyStats().companyAdmin.contentItems.toString(), change: '0%', changeType: 'neutral' }
          ],
          cards: [
            {
              title: 'User Management',
              description: 'Manage brand users and permissions',
              icon: '👥',
              href: '/companyadmin/users',
              stats: { users: getEmptyStats().companyAdmin.brandUsers, roles: getEmptyStats().companyAdmin.brandRoles }
            },
            {
              title: 'Content Management',
              description: 'Manage brand content and projects',
              icon: '📁',
              href: '/companyadmin/content',
              stats: { songs: getEmptyStats().companyAdmin.contentItems, projects: getEmptyStats().companyAdmin.activeProjects }
            },
            {
              title: 'Analytics',
              description: 'View brand performance metrics',
              icon: '📈',
              href: '/companyadmin/analytics',
              stats: { views: getEmptyStats().companyAdmin.totalViews, engagement: getEmptyStats().companyAdmin.engagement }
            },
            {
              title: 'Earnings',
              description: 'Track brand revenue and earnings',
              icon: '💰',
              href: '/companyadmin/earnings',
              stats: { revenue: getEmptyStats().companyAdmin.brandRevenue, growth: '0%' }
            },
            {
              title: 'Workflow',
              description: 'Manage distribution workflows',
              icon: '⚡',
              href: '/companyadmin/distribution',
              stats: { active: getEmptyStats().companyAdmin.activeProjects, completed: getEmptyStats().companyAdmin.contentItems }
            }
          ]
        };

      case 'label_admin':
    
        return {
          title: `${displayBrand?.displayName || 'YHWH MSC'} - Label Management Dashboard`,
          subtitle: 'Manage label artists, contracts, and revenue streams',
          description: 'Complete label administration and artist management platform',
          stats: [
            { label: 'Label Artists', value: getEmptyStats().labelAdmin.labelArtists.toString(), change: '0 this quarter', changeType: 'neutral' },
            { label: 'Active Releases', value: getEmptyStats().labelAdmin.labelReleases.toString(), change: '0%', changeType: 'neutral' },
            { label: 'Label Revenue', value: formatCurrency(getEmptyStats().labelAdmin.labelRevenue, selectedCurrency), change: '0%', changeType: 'neutral' },
            { label: 'Total Streams', value: `${(getEmptyStats().labelAdmin.labelStreams / 1000).toFixed(0)}K`, change: '0%', changeType: 'neutral' }
          ],
          cards: [
            {
              title: 'Artist Management',
              description: 'Manage label artists and their contracts',
              icon: '🎤',
              href: '/labeladmin/artists',
              stats: { artists: getEmptyStats().labelAdmin.labelArtists, contracts: getEmptyStats().labelAdmin.activeContracts }
            },
            {
              title: 'Revenue Tracking',
              description: 'Monitor label earnings and artist royalties',
              icon: '💰',
              href: '/labeladmin/earnings',
              stats: { revenue: getEmptyStats().labelAdmin.labelRevenue, releases: getEmptyStats().labelAdmin.labelReleases }
            },
            {
              title: 'Performance Analytics',
              description: 'View label-wide performance metrics',
              icon: '📊',
              href: '/labeladmin/analytics',
              stats: { streams: getEmptyStats().labelAdmin.labelStreams, countries: getEmptyStats().labelAdmin.labelCountries }
            },
            {
              title: 'All Releases',
              description: 'Manage all label releases and assets',
              icon: '🎵',
              href: '/labeladmin/releases',
              stats: { releases: getEmptyStats().labelAdmin.labelReleases, tracks: getEmptyStats().labelAdmin.totalTracks || 45 }
            }
          ]
        };

      case 'distribution_partner':
    
        return {
          title: 'Distribution Partner Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Content Distribution`,
          description: 'Manage content distribution and partner relationships',
          stats: [
            { label: 'Distributed Content', value: getEmptyStats().distributionPartner.distributedContent.toString(), change: '0%', changeType: 'neutral' },
            { label: 'Partner Revenue', value: formatCurrency(getEmptyStats().distributionPartner.partnerRevenue, selectedCurrency), change: '0%', changeType: 'neutral' },
            { label: 'Active Artists', value: getUsers().filter(u => u.role === 'artist').length.toString(), change: `${getReleases().length} total releases`, changeType: 'neutral' },
            { label: 'Success Rate', value: `${getEmptyStats().distributionPartner.successRate}%`, change: '0%', changeType: 'neutral' }
          ],
          cards: [
            {
              title: 'Content Management',
              description: 'Manage distributed content and releases',
              icon: '📁',
              href: '/distributionpartner/dashboard',
              stats: { content: getEmptyStats().distributionPartner.distributedContent, releases: getEmptyStats().distributionPartner.totalReleases }
            },
            {
              title: 'Analytics',
              description: 'Track distribution performance',
              icon: '📈',
              href: '/distributionpartner/analytics',
              stats: { views: getEmptyStats().distributionPartner.totalViews, revenue: getEmptyStats().distributionPartner.partnerRevenue }
            },
            {
              title: 'Earnings',
              description: 'View earnings from all distributed releases',
              icon: '💰',
              href: '/distributionpartner/reports',
              stats: { earnings: formatCurrency(getEmptyStats().distributionPartner.partnerRevenue, selectedCurrency), releases: getEmptyStats().distributionPartner.totalReleases }
            }
          ]
        };

      case 'distributor':
    
        return {
          title: 'Distributor Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Distribution Management`,
          description: 'Manage content distribution and platform settings',
          stats: [
            { label: 'Distributed Content', value: '0', change: '0%', changeType: 'neutral' },
            { label: 'Platform Revenue', value: formatCurrency(0, selectedCurrency), change: '0%', changeType: 'neutral' },
            { label: 'Active Platforms', value: '0', change: '0', changeType: 'neutral' },
            { label: 'Success Rate', value: '0%', change: '0%', changeType: 'neutral' }
          ],
          cards: [
            {
              title: 'Distribution',
              description: 'Visual workflow tracking and release progression',
              icon: '🌐',
              href: '/distribution/workflow',
              stats: { active: 8, completed: 567 }
            },
            {
              title: 'Reports',
              description: 'Generate distribution reports and analytics',
              icon: '📋',
              href: '/distribution/reports',
              stats: { reports: 25, revenue: 45678 }
            },
            {
              title: 'Settings',
              description: 'Configure distribution settings',
              icon: '⚙️',
              href: '/distribution/settings',
              stats: { platforms: 12, features: 8 }
            }
          ]
        };

      case 'artist':
    
        const artistData = getUsers().find(u => u.role === 'artist' && u.id === 'artist_yhwh_msc') || getUsers().find(u => u.role === 'artist');
        const brandName = artistData?.brand || 'YHWH MSC';
        return {
          title: 'Artist Dashboard',
          subtitle: `Welcome to ${brandName} - Your Music Career Hub`,
          description: 'Manage your releases, track earnings, and grow your audience',
          stats: [
            { label: 'Total Releases', value: (artistData?.totalReleases || 0).toString(), change: '0 this month', changeType: 'neutral' },
            { label: 'Total Streams', value: `${((artistData?.totalStreams || 0) / 1000).toFixed(0)}K`, change: '0%', changeType: 'neutral' },
            { label: 'Total Earnings', value: formatCurrency(artistData?.totalRevenue || artistData?.totalEarnings || 0, selectedCurrency), change: `+${formatCurrency(0, selectedCurrency)}`, changeType: 'neutral' },
            { label: 'Active Projects', value: (artistData?.totalReleases || 0).toString(), change: '0 in review', changeType: 'neutral' }
          ],
          cards: [
            {
              title: 'Releases',
              description: 'Manage your music releases and track submissions',
              icon: '🎵',
              href: '/artist/releases',
              stats: { 
                total: artistData?.totalReleases || 0, 
                draft: 2, 
                submitted: 1,
                underReview: 1, 
                approvalRequired: 1,
                live: (artistData?.totalReleases || 0) - 5,
                completed: 0
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
                held: formatCurrency(0, selectedCurrency),
                platforms: 8
              }
            },
            {
              title: 'Analytics',
              description: 'View detailed performance analytics',
              icon: '📈',
              href: '/artist/analytics',
              stats: { 
                streams: '0K', 
                countries: 0,
                topTrack: 'No tracks yet',
                growth: '+0%'
              }
            }
          ]
        };

      default:
    
        return {
          title: 'Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'}`,
          description: 'Your platform overview',
          stats: [
            { label: 'Overview', value: 'Welcome', change: '', changeType: 'neutral' }
          ],
          cards: [
            {
              title: 'Dashboard',
              description: 'Your main dashboard',
              icon: '📊',
              href: '/dashboard',
              stats: { items: 1 }
            }
          ]
        };
    }
  };

  const dashboardContent = userRole ? getDashboardContent() : null;

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
          <div className="relative mb-8 px-4 sm:px-0">
            {renderArtistVideoSection(currentVideo, videoType, isMuted, setIsMuted)}
            {/* Overlapping Dashboard Header */}
            <div className="absolute top-1/2 left-8 right-8 transform -translate-y-1/2 z-10">
              <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-3 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-sm font-bold mb-1">{dashboardContent.title}</h1>
                    <p className="text-xs opacity-90">{dashboardContent.subtitle}</p>
                    <p className="text-xs opacity-75">{dashboardContent.description}</p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header (only show for non-artist roles or if no video) */}
        {userRole !== 'artist' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-sm font-bold text-gray-900">{dashboardContent.title}</h1>
                <p className="mt-0.5 text-xs text-gray-600">{dashboardContent.subtitle}</p>
                <p className="mt-0.5 text-xs text-gray-500">{dashboardContent.description}</p>
              </div>

            </div>
          </div>
        )}

        {/* Stats */}
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardContent.stats.map((stat, index) => (
              <Card key={index} className="bg-white">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
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

        {/* Cards */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardContent.cards.map((card, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm mr-1">{card.icon}</span>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900">{card.title}</h3>
                      <p className="text-xs text-gray-600">{card.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="space-y-2 text-sm">
                    {Object.entries(card.stats).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-600 capitalize flex-shrink-0 mr-2">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="font-medium text-right">
                          {key === 'revenue' ? formatCurrency(value, selectedCurrency) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <Link href={card.href}>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                      View {card.title}
                    </button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Approved Artists Section - Only for Label Admin */}
        {userRole === 'label_admin' && approvedArtists.length > 0 && (
          <div className="mt-8 px-4 sm:px-0">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Approved Artists</h3>
                  <p className="text-sm text-gray-500">Artists under {userBrand?.displayName || 'YHWH MSC'} label</p>
                </div>
              </div>
              
              <div className="p-3">
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
                  <div className="mt-4 text-center">
                    <Link href="/labeladmin/artists">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
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