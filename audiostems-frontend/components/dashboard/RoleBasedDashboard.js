import { useAuth0 } from '@auth0/auth0-react';
import { Card, Badge } from 'flowbite-react';
import { getUserRole, getDefaultDisplayBrand, getUserBrand } from '@/lib/auth0-config';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DASHBOARD_STATS, MOCK_VIDEOS, ARTISTS, RELEASES } from '@/lib/mockData';
import CurrencySelector, { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';

// Video component for artist dashboard
const ArtistVideoSection = () => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoType, setVideoType] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Randomly choose between highest performing and newest video
    const isHighestPerforming = Math.random() > 0.5;
    const video = isHighestPerforming ? MOCK_VIDEOS.highestPerforming : MOCK_VIDEOS.newestReleased;
    setCurrentVideo(video);
    setVideoType(isHighestPerforming ? 'highest' : 'newest');
    
    // Switch videos every 30 seconds
    const interval = setInterval(() => {
      const newIsHighestPerforming = Math.random() > 0.5;
      const newVideo = newIsHighestPerforming ? MOCK_VIDEOS.highestPerforming : MOCK_VIDEOS.newestReleased;
      setCurrentVideo(newVideo);
      setVideoType(newIsHighestPerforming ? 'highest' : 'newest');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!currentVideo) return null;

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
      {/* Video Player */}
      <div className="relative aspect-video">
        <video
          src={currentVideo.url}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          controls={false}
        />
        
        {/* Video Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Video Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">{currentVideo.title}</h3>
              <div className="flex items-center space-x-4 text-sm opacity-90">
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

export default function RoleBasedDashboard() {
  const { user, isAuthenticated } = useAuth0();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your dashboard</h2>
          <Button href="/login">Sign In</Button>
        </div>
      </div>
    );
  }

  const userRole = getUserRole(user);
  const displayBrand = getDefaultDisplayBrand(user);
  const userBrand = getUserBrand(user);

  // Calculate approved artists for label admin
  const approvedArtists = useMemo(() => {
    if (userRole !== 'label_admin') return [];
    
    const labelName = userBrand?.displayName || 'YHWH MSC';
    
    const filteredArtists = ARTISTS.filter(artist => 
      artist.approvalStatus === 'approved' && 
      artist.label === labelName
    );
    
    return filteredArtists.map(artist => {
      // Calculate artist releases and earnings
      const artistReleases = RELEASES.filter(release => release.artistId === artist.id);
      const totalEarnings = artistReleases.reduce((sum, release) => sum + (release.earnings || 0), 0);
      const totalStreams = artistReleases.reduce((sum, release) => sum + (release.streams || 0), 0);
      
      return {
        ...artist,
        releases: artistReleases.length,
        totalEarnings,
        totalStreams,
        followers: artist.followers || 0,
        lastRelease: artistReleases.length > 0 ? 
          artistReleases.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))[0].submissionDate : 
          null,
        avatar: artist.avatar || '🎤'
      };
    });
  }, [userRole, userBrand?.displayName]);



  // Dashboard content based on role
  const getDashboardContent = () => {

    
    switch (userRole) {
      case 'super_admin':
    
        return {
          title: 'Super Admin Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Company Overview`,
          description: 'Manage all brands, users, and platform settings',
          stats: [
            { label: 'Total Users', value: DASHBOARD_STATS.superAdmin.totalUsers.toLocaleString(), change: '+12%', changeType: 'positive' },
            { label: 'Active Projects', value: DASHBOARD_STATS.superAdmin.activeProjects.toString(), change: '+5%', changeType: 'positive' },
            { label: 'Revenue', value: formatCurrency(DASHBOARD_STATS.superAdmin.totalRevenue, selectedCurrency), change: '+8%', changeType: 'positive' },
            { label: 'Total Artists', value: ARTISTS.length.toString(), change: `${RELEASES.length} releases`, changeType: 'neutral' }
          ],
          cards: [
            {
              title: 'User Management',
              description: 'Manage all platform users and roles',
              icon: '👥',
              href: '/admin/users',
              stats: { users: DASHBOARD_STATS.superAdmin.totalUsers, roles: DASHBOARD_STATS.superAdmin.totalRoles }
            },
            {
              title: 'Content Management',
              description: 'Oversee all platform content',
              icon: '📁',
              href: '/admin/content',
              stats: { songs: DASHBOARD_STATS.superAdmin.totalSongs, projects: DASHBOARD_STATS.superAdmin.activeProjects }
            },
            {
              title: 'System Settings',
              description: 'Configure platform settings',
              icon: '⚙️',
              href: '/admin/settings',
              stats: { brands: DASHBOARD_STATS.superAdmin.totalBrands, features: DASHBOARD_STATS.superAdmin.systemFeatures }
            }
          ]
        };

      case 'company_admin':
    
        return {
          title: 'Company Admin Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Brand Management`,
          description: 'Manage your brand users and content',
          stats: [
            { label: 'Brand Artists', value: ARTISTS.filter(a => a.brand === displayBrand?.displayName).length.toString(), change: '+8%', changeType: 'positive' },
            { label: 'Active Projects', value: DASHBOARD_STATS.companyAdmin.activeProjects.toString(), change: '+3%', changeType: 'positive' },
            { label: 'Revenue', value: formatCurrency(DASHBOARD_STATS.companyAdmin.brandRevenue, selectedCurrency), change: '+6%', changeType: 'positive' },
            { label: 'Content Items', value: DASHBOARD_STATS.companyAdmin.contentItems.toString(), change: '+12%', changeType: 'positive' }
          ],
          cards: [
            {
              title: 'User Management',
              description: 'Manage brand users and permissions',
              icon: '👥',
              href: '/admin/users',
              stats: { users: DASHBOARD_STATS.companyAdmin.brandUsers, roles: DASHBOARD_STATS.companyAdmin.brandRoles }
            },
            {
              title: 'Content Management',
              description: 'Manage brand content and projects',
              icon: '📁',
              href: '/admin/content',
              stats: { songs: DASHBOARD_STATS.companyAdmin.contentItems, projects: DASHBOARD_STATS.companyAdmin.activeProjects }
            },
            {
              title: 'Analytics',
              description: 'View brand performance metrics',
              icon: '📈',
              href: '/admin/analytics',
              stats: { views: DASHBOARD_STATS.companyAdmin.totalViews, engagement: DASHBOARD_STATS.companyAdmin.engagement }
            }
          ]
        };

      case 'label_admin':
    
        return {
          title: `${displayBrand?.displayName || 'YHWH MSC'} - Label Management Dashboard`,
          subtitle: 'Manage label artists, contracts, and revenue streams',
          description: 'Complete label administration and artist management platform',
          stats: [
            { label: 'Label Artists', value: DASHBOARD_STATS.labelAdmin.labelArtists.toString(), change: '+3 this quarter', changeType: 'positive' },
            { label: 'Active Releases', value: DASHBOARD_STATS.labelAdmin.labelReleases.toString(), change: '+12%', changeType: 'positive' },
            { label: 'Label Revenue', value: formatCurrency(DASHBOARD_STATS.labelAdmin.labelRevenue, selectedCurrency), change: '+18%', changeType: 'positive' },
            { label: 'Total Streams', value: `${(DASHBOARD_STATS.labelAdmin.labelStreams / 1000).toFixed(0)}K`, change: '+25%', changeType: 'positive' }
          ],
          cards: [
            {
              title: 'Artist Management',
              description: 'Manage label artists and their contracts',
              icon: '🎤',
              href: '/label-admin/artists',
              stats: { artists: DASHBOARD_STATS.labelAdmin.labelArtists, contracts: DASHBOARD_STATS.labelAdmin.activeContracts }
            },
            {
              title: 'Revenue Tracking',
              description: 'Monitor label earnings and artist royalties',
              icon: '💰',
              href: '/label-admin/earnings',
              stats: { revenue: DASHBOARD_STATS.labelAdmin.labelRevenue, releases: DASHBOARD_STATS.labelAdmin.labelReleases }
            },
            {
              title: 'Performance Analytics',
              description: 'View label-wide performance metrics',
              icon: '📊',
              href: '/label-admin/analytics',
              stats: { streams: DASHBOARD_STATS.labelAdmin.labelStreams, countries: DASHBOARD_STATS.labelAdmin.labelCountries }
            },
            {
              title: 'All Releases',
              description: 'Manage all label releases and assets',
              icon: '🎵',
              href: '/label-admin/releases',
              stats: { releases: DASHBOARD_STATS.labelAdmin.labelReleases, tracks: DASHBOARD_STATS.labelAdmin.totalTracks || 45 }
            }
          ]
        };

      case 'distribution_partner':
    
        return {
          title: 'Distribution Partner Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Content Distribution`,
          description: 'Manage content distribution and partner relationships',
          stats: [
            { label: 'Distributed Content', value: DASHBOARD_STATS.distributionPartner.distributedContent.toString(), change: '+15%', changeType: 'positive' },
            { label: 'Partner Revenue', value: formatCurrency(DASHBOARD_STATS.distributionPartner.partnerRevenue, selectedCurrency), change: '+12%', changeType: 'positive' },
            { label: 'Active Artists', value: DASHBOARD_STATS.distributionPartner.totalArtists.toString(), change: `${RELEASES.length} total releases`, changeType: 'positive' },
            { label: 'Success Rate', value: `${DASHBOARD_STATS.distributionPartner.successRate}%`, change: '+2%', changeType: 'positive' }
          ],
          cards: [
            {
              title: 'Content Management',
              description: 'Manage distributed content and releases',
              icon: '📁',
              href: '/distribution-partner/dashboard',
              stats: { content: DASHBOARD_STATS.distributionPartner.distributedContent, releases: DASHBOARD_STATS.distributionPartner.totalReleases }
            },
            {
              title: 'Analytics',
              description: 'Track distribution performance',
              icon: '📈',
              href: '/partner/analytics',
              stats: { views: DASHBOARD_STATS.distributionPartner.totalViews, revenue: DASHBOARD_STATS.distributionPartner.partnerRevenue }
            },
            {
              title: 'Earnings',
              description: 'View earnings from all distributed releases',
              icon: '💰',
              href: '/partner/reports',
              stats: { earnings: formatCurrency(DASHBOARD_STATS.distributionPartner.partnerRevenue, selectedCurrency), releases: DASHBOARD_STATS.distributionPartner.totalReleases }
            }
          ]
        };

      case 'distributor':
    
        return {
          title: 'Distributor Dashboard',
          subtitle: `Welcome to ${displayBrand?.displayName || 'MSC & Co'} - Distribution Management`,
          description: 'Manage content distribution and platform settings',
          stats: [
            { label: 'Distributed Content', value: '567', change: '+18%', changeType: 'positive' },
            { label: 'Platform Revenue', value: formatCurrency(45678, selectedCurrency), change: '+14%', changeType: 'positive' },
            { label: 'Active Platforms', value: '12', change: '+2', changeType: 'positive' },
            { label: 'Success Rate', value: '96%', change: '+1%', changeType: 'positive' }
          ],
          cards: [
            {
              title: 'Distribution',
              description: 'Manage content distribution across platforms',
              icon: '🌐',
              href: '/distribution/content',
              stats: { content: 567, platforms: 12 }
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
    
        const artistData = ARTISTS.find(a => a.id === 'yhwh_msc') || ARTISTS[0];
        const artistReleases = RELEASES.filter(r => r.artistId === artistData.id);
        return {
          title: 'Artist Dashboard',
          subtitle: `Welcome to ${artistData.brand} - Your Music Career Hub`,
          description: 'Manage your releases, track earnings, and grow your audience',
          stats: [
            { label: 'Total Releases', value: DASHBOARD_STATS.artist.totalReleases.toString(), change: '+2 this month', changeType: 'positive' },
            { label: 'Total Streams', value: `${(DASHBOARD_STATS.artist.totalStreams / 1000).toFixed(0)}K`, change: `+${DASHBOARD_STATS.artist.growth}%`, changeType: 'positive' },
            { label: 'Total Earnings', value: formatCurrency(DASHBOARD_STATS.artist.totalEarnings, selectedCurrency), change: `+${formatCurrency(DASHBOARD_STATS.artist.thisMonthEarnings, selectedCurrency)}`, changeType: 'positive' },
            { label: 'Active Projects', value: DASHBOARD_STATS.artist.activeProjects.toString(), change: '3 in review', changeType: 'neutral' }
          ],
          cards: [
            {
              title: 'Release Management',
              description: 'Manage your music releases and track submissions',
              icon: '🎵',
              href: '/artist/releases',
              stats: { 
                total: artistReleases.length, 
                live: artistReleases.filter(r => r.status === 'LIVE').length
              }
            },
            {
              title: 'Revenue Tracking',
              description: 'Track your revenue from streaming platforms',
              icon: '💰',
              href: '/artist/earnings',
              stats: { 
                thisMonth: formatCurrency(DASHBOARD_STATS.artist.thisMonthEarnings, selectedCurrency), 
                totalEarnings: formatCurrency(DASHBOARD_STATS.artist.totalEarnings, selectedCurrency)
              }
            },
            {
              title: 'Performance Analytics',
              description: 'View detailed performance analytics',
              icon: '📊',
              href: '/artist/analytics',
              stats: { 
                streams: `${(DASHBOARD_STATS.artist.totalStreams / 1000).toFixed(0)}K`, 
                growth: `+${DASHBOARD_STATS.artist.growth}%`
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

  const dashboardContent = getDashboardContent();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Video Hero Banner for Artists */}
        {userRole === 'artist' && (
          <div className="relative mb-8 px-4 sm:px-0">
            <ArtistVideoSection />
            {/* Overlapping Dashboard Header */}
            <div className="absolute top-1/2 left-8 right-8 transform -translate-y-1/2 z-10">
              <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{dashboardContent.title}</h1>
                    <p className="text-lg opacity-90">{dashboardContent.subtitle}</p>
                    <p className="text-sm opacity-75">{dashboardContent.description}</p>
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
                <h1 className="text-3xl font-bold text-gray-900">{dashboardContent.title}</h1>
                <p className="mt-2 text-lg text-gray-600">{dashboardContent.subtitle}</p>
                <p className="mt-1 text-sm text-gray-500">{dashboardContent.description}</p>
              </div>

            </div>
          </div>
        )}

        {/* Stats */}
        <div className="px-4 sm:px-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardContent.stats.map((stat, index) => (
              <Card key={index} className="bg-white">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardContent.cards.map((card, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{card.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                      <p className="text-sm text-gray-600">{card.description}</p>
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
                  <h3 className="text-lg font-semibold text-gray-900">Approved Artists</h3>
                  <p className="text-sm text-gray-500">Artists under {userBrand?.displayName || 'YHWH MSC'} label</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {approvedArtists.map((artist) => (
                    <div key={artist.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {artist.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{artist.name}</h4>
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
                    <Link href="/label-admin/artists">
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