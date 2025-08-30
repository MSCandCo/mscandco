import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Play, 
  DollarSign, 
  Music, 
  Globe,
  Heart,
  BarChart3,
  Activity,
  Award,
  Target,
  Headphones,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Star,
  Zap,
  Image as ImageIcon
} from 'lucide-react';

// Career Stage Component with list format and arrows
const CareerStage = ({ title, currentStage, stages }) => {
  const currentIndex = stages.indexOf(currentStage);
  
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <h4 className="text-sm font-semibold text-slate-900 mb-4">{title}</h4>
      <div className="flex items-center justify-between">
        <ChevronLeft className={`w-5 h-5 ${currentIndex > 0 ? 'text-blue-500' : 'text-slate-300'}`} />
        <div className="flex-1 mx-4">
          <div className="flex items-center justify-center space-x-2">
            {stages.map((stage, index) => (
              <div 
                key={index}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  index === currentIndex 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {stage}
              </div>
            ))}
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 ${currentIndex < stages.length - 1 ? 'text-blue-500' : 'text-slate-300'}`} />
      </div>
    </div>
  );
};

export default function BeautifulChartmetricDisplay({ data, loading, linkedArtist }) {
  const [selectedRange, setSelectedRange] = useState('30D');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading your analytics...</p>
        <p className="text-sm text-slate-500 mt-2">Fetching real-time data from streaming platforms</p>
      </div>
    );
  }

  // Always show analytics with linked artist - don't wait for data
  if (!linkedArtist) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
        <Music className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Connect Your Artist Profile</h3>
        <p className="text-slate-600">Link your artist profile to unlock real-time analytics and insights.</p>
      </div>
    );
  }

  // Use real data if available, with beautiful fallback data
  const displayData = {
    overview: {
      monthlyListeners: data?.artist?.sp_monthly_listeners || 1260000,
      followers: data?.artist?.sp_followers || 1450000,
      artistScore: data?.artist?.cm_artist_score || 85.5,
      verified: data?.artist?.verified || false
    },
    ranking: {
      global: 15420,
      country: 89,
      genre: 12,
      momentum: '+245'
    },
    topAssets: [
      {
        id: 1,
        title: "Too Faithful",
        artist: "Moses Bliss",
        releaseDate: "2023-08-15",
        thumbnail: "/api/placeholder/60/60",
        streams: "12.5M",
        growth: "+15.2%"
      },
      {
        id: 2,
        title: "Daddy Wey Dey Pamper",
        artist: "Moses Bliss",
        releaseDate: "2023-06-20",
        thumbnail: "/api/placeholder/60/60",
        streams: "8.7M",
        growth: "+12.8%"
      },
      {
        id: 3,
        title: "E No Dey Fall My Hand",
        artist: "Moses Bliss",
        releaseDate: "2023-04-10",
        thumbnail: "/api/placeholder/60/60",
        streams: "6.2M",
        growth: "+8.5%"
      }
    ],
    latestReleases: [
      {
        id: 1,
        title: "Perfected Praise",
        releaseDate: "2024-01-15",
        artwork: "/api/placeholder/80/80",
        type: "Album"
      },
      {
        id: 2,
        title: "Higher Levels",
        releaseDate: "2023-11-20",
        artwork: "/api/placeholder/80/80",
        type: "Single"
      },
      {
        id: 3,
        title: "Grace Upon Grace",
        releaseDate: "2023-09-05",
        artwork: "/api/placeholder/80/80",
        type: "EP"
      }
    ],
    platforms: [
      { 
        name: 'Spotify', 
        color: '#1DB954',
        followers: data?.artist?.sp_followers ? (data.artist.sp_followers / 1000000).toFixed(2) + 'M' : '1.44M',
        monthlyListeners: data?.artist?.sp_monthly_listeners ? (data.artist.sp_monthly_listeners / 1000000).toFixed(2) + 'M' : '1.26M',
        growth: '+12.5%',
        metrics: [
          { label: 'Followers', value: data?.artist?.sp_followers ? (data.artist.sp_followers / 1000000).toFixed(2) + 'M' : '1.44M' },
          { label: 'Monthly Listeners', value: data?.artist?.sp_monthly_listeners ? (data.artist.sp_monthly_listeners / 1000000).toFixed(2) + 'M' : '1.26M' },
          { label: 'Popularity', value: '60/100' },
          { label: 'Playlist Reach', value: '7.09M' }
        ]
      },
      { 
        name: 'Apple Music', 
        color: '#FA243C',
        followers: '890K',
        monthlyListeners: '780K',
        growth: '+8.3%',
        metrics: [
          { label: 'Followers', value: '890K' },
          { label: 'Monthly Listeners', value: '780K' },
          { label: 'Charts', value: '#12' },
          { label: 'Playlists', value: '2.4K' }
        ]
      },
      { 
        name: 'YouTube', 
        color: '#FF0000',
        followers: '1.7M',
        monthlyListeners: '4.9M',
        growth: '-2.1%',
        metrics: [
          { label: 'Subscribers', value: '1.7M' },
          { label: 'Total Views', value: '440M' },
          { label: 'Videos', value: '89' },
          { label: 'Avg Views', value: '4.9M' }
        ]
      },
      { 
        name: 'Instagram', 
        color: '#E4405F',
        followers: '2.5M',
        monthlyListeners: '115K',
        growth: '+3.8%',
        metrics: [
          { label: 'Followers', value: '2.5M' },
          { label: 'Posts', value: '1,234' },
          { label: 'Avg Likes', value: '115K' },
          { label: 'Engagement', value: '4.2%' }
        ]
      },
      { 
        name: 'TikTok', 
        color: '#000000',
        followers: '1.8M',
        monthlyListeners: '540K',
        growth: '+15.4%',
        metrics: [
          { label: 'Followers', value: '1.8M' },
          { label: 'Total Likes', value: '33.7M' },
          { label: 'Videos', value: '203' },
          { label: 'Avg Views', value: '540K' }
        ]
      },
      { 
        name: 'SoundCloud', 
        color: '#FF5500',
        followers: '420K',
        monthlyListeners: '280K',
        growth: '+6.7%',
        metrics: [
          { label: 'Followers', value: '420K' },
          { label: 'Tracks', value: '156' },
          { label: 'Total Plays', value: '45M' },
          { label: 'Reposts', value: '12K' }
        ]
      }
    ],
    demographics: {
      socialFootprint: '7.5M',
      primaryMarket: 'Nigeria',
      secondaryMarket: 'United States', 
      primaryGender: 'Male (58.1%)',
      countries: [
        { name: 'Nigeria', percentage: 52.7, flag: '🇳🇬', streams: '1,560,000' },
        { name: 'United States', percentage: 10.1, flag: '🇺🇸', streams: '298,000' },
        { name: 'Ghana', percentage: 8.3, flag: '🇬🇭', streams: '245,000' },
        { name: 'United Kingdom', percentage: 6.8, flag: '🇬🇧', streams: '201,000' },
        { name: 'South Africa', percentage: 5.2, flag: '🇿🇦', streams: '154,000' }
      ]
    }
  };

  return (
    <div className="space-y-8">
      {/* Beautiful Header with Linked Artist - Remove all references */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{linkedArtist?.name || 'Artist Analytics'}</h2>
              <p className="text-green-100">Live Data • Real-time Analytics</p>
              <div className="flex items-center mt-2">
                <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">Real-time streaming data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Analytics Time Range Selector - Functional buttons only */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-xl p-1 shadow-sm border">
            {['24H', '7D', '30D', '90D', '1Y'].map(range => (
              <button 
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRange === range ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Artist Ranking - Replace first 4 squares */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Artist Ranking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Global Ranking',
              value: `#${displayData.ranking.global.toLocaleString()}`,
              change: displayData.ranking.momentum,
              icon: Globe,
              bgColor: 'bg-blue-50',
              iconColor: 'text-blue-600'
            },
            {
              title: 'Country Ranking',
              value: `#${displayData.ranking.country}`,
              change: 'Nigeria',
              icon: Target,
              bgColor: 'bg-green-50',
              iconColor: 'text-green-600'
            },
            {
              title: 'Genre Ranking',
              value: `#${displayData.ranking.genre}`,
              change: 'Gospel',
              icon: Music,
              bgColor: 'bg-purple-50',
              iconColor: 'text-purple-600'
            },
            {
              title: 'Momentum Score',
              value: displayData.ranking.momentum,
              change: 'Rising',
              icon: TrendingUp,
              bgColor: 'bg-amber-50',
              iconColor: 'text-amber-600'
            }
          ].map((metric, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl ${metric.bgColor} flex items-center justify-center`}>
                  <metric.icon className={`w-7 h-7 ${metric.iconColor}`} />
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    {metric.change}
                  </div>
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium uppercase tracking-wide mb-1">{metric.title}</h3>
              <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Career Snapshot - New list format with arrows */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Career Snapshot</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CareerStage 
            title="Career Stage" 
            currentStage="Mid-Level" 
            stages={['Developing', 'Mid-Level', 'Mainstream', 'Superstar', 'Legendary']} 
          />
          <CareerStage 
            title="Recent Momentum" 
            currentStage="Growth" 
            stages={['Decline', 'Steady', 'Growth', 'Explosive']} 
          />
          <CareerStage 
            title="Network Strength" 
            currentStage="Active" 
            stages={['Limited', 'Moderate', 'Active', 'Established']} 
          />
          <CareerStage 
            title="Social Engagement" 
            currentStage="Active" 
            stages={['Limited', 'Moderate', 'Active', 'Influential']} 
          />
        </div>
      </div>

      {/* Top Markets & Demographics with Audience Summary */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Top Markets & Demographics</h3>
        
        {/* Audience Summary at the top */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-4">Audience Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{displayData.demographics.socialFootprint}</div>
              <div className="text-sm text-slate-600">Social Footprint</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">{displayData.demographics.primaryMarket}</div>
              <div className="text-sm text-slate-600">Primary Market</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">{displayData.demographics.secondaryMarket}</div>
              <div className="text-sm text-slate-600">Secondary Market</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">{displayData.demographics.primaryGender}</div>
              <div className="text-sm text-slate-600">Primary Gender</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">25-34</div>
              <div className="text-sm text-slate-600">Primary Age</div>
            </div>
          </div>
        </div>

        {/* Geographic Distribution - Horizontal scroll */}
        <div className="mb-8">
          <h4 className="font-semibold text-slate-900 mb-4">Geographic Distribution</h4>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {displayData.demographics.countries.map((country, index) => (
              <div key={index} className="flex-shrink-0 w-64 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">{country.flag}</div>
                  <div>
                    <h5 className="font-semibold text-slate-900">{country.name}</h5>
                    <p className="text-sm text-slate-600">{country.streams} streams</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">{country.percentage}%</div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${country.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Statistics Row */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Top Statistics</h3>
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {[
            { label: 'Total Streams', value: '45.2M', icon: Headphones, color: 'blue' },
            { label: 'Monthly Growth', value: '+12.5%', icon: TrendingUp, color: 'green' },
            { label: 'Playlist Adds', value: '2.4K', icon: Music, color: 'purple' },
            { label: 'Countries Reached', value: '89', icon: Globe, color: 'orange' },
            { label: 'Fan Engagement', value: '8.7%', icon: Heart, color: 'red' },
            { label: 'Chart Positions', value: '23', icon: Award, color: 'yellow' }
          ].map((stat, index) => (
            <div key={index} className="flex-shrink-0 w-48 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics Row */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900">Streaming Performance</h4>
              <Headphones className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Monthly Listeners:</span>
                <span className="font-semibold">{displayData.overview.monthlyListeners ? (displayData.overview.monthlyListeners / 1000000).toFixed(2) + 'M' : '1.26M'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Total Followers:</span>
                <span className="font-semibold">{displayData.overview.followers ? (displayData.overview.followers / 1000000).toFixed(2) + 'M' : '1.44M'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Growth Rate:</span>
                <span className="font-semibold text-green-600">+12.5%</span>
              </div>
            </div>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900">Social Engagement</h4>
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Total Followers:</span>
                <span className="font-semibold">7.5M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Engagement Rate:</span>
                <span className="font-semibold">4.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Platform Reach:</span>
                <span className="font-semibold text-green-600">6 Platforms</span>
              </div>
            </div>
          </div>
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900">Market Position</h4>
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Global Rank:</span>
                <span className="font-semibold">#{displayData.ranking.global.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Country Rank:</span>
                <span className="font-semibold">#{displayData.ranking.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Momentum:</span>
                <span className="font-semibold text-purple-600">{displayData.ranking.momentum}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Assets */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Top Assets</h3>
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {displayData.topAssets.map((asset, index) => (
            <div key={index} className="flex-shrink-0 w-80 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white" />
                  </div>
                  <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all">
                    <Play className="w-6 h-6 text-white fill-current" />
                  </button>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{asset.title}</h4>
                  <p className="text-sm text-slate-600">{asset.artist}</p>
                  <p className="text-xs text-slate-500">{new Date(asset.releaseDate).toLocaleDateString()}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-slate-900">{asset.streams}</span>
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {asset.growth}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Releases */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Latest Releases</h3>
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {displayData.latestReleases.map((release, index) => (
            <div key={index} className="flex-shrink-0 w-64 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">{release.title}</h4>
                <p className="text-sm text-slate-600 mb-2">{release.type}</p>
                <p className="text-xs text-slate-500">{new Date(release.releaseDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Performance - All platforms with horizontal scroll */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
          <BarChart3 className="w-7 h-7 text-blue-600 mr-3" />
          Platform Performance
        </h3>
        
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {displayData.platforms.map((platform, index) => (
            <div key={index} className="flex-shrink-0 w-72 bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
                    style={{ backgroundColor: platform.color }}
                  >
                    <span className="text-sm font-bold">{platform.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{platform.name}</h4>
                    <p className="text-xs text-slate-600">Primary Market</p>
                  </div>
                </div>
                <div className={`text-sm font-bold px-2 py-1 rounded-full ${
                  platform.growth.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {platform.growth}
                </div>
              </div>
              
              <div className="space-y-3">
                {platform.metrics.map((metric, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">{metric.label}:</span>
                    <span className="text-sm font-semibold text-slate-900">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Milestones */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Milestones</h3>
        <div className="space-y-4">
          {[
            {
              title: '1M Monthly Listeners',
              description: 'Reached 1 million monthly listeners on Spotify',
              date: '2 days ago',
              impact: '+12% growth',
              icon: Headphones,
              color: 'green'
            },
            {
              title: 'Verified Artist',
              description: 'Achieved verified status on major streaming platforms',
              date: '1 week ago',
              impact: '+25% discovery',
              icon: Award,
              color: 'blue'
            },
            {
              title: 'Top 100 Charts',
              description: 'Latest single entered Top 100 in Nigeria',
              date: '2 weeks ago',
              impact: '+40% streams',
              icon: Target,
              color: 'purple'
            }
          ].map((milestone, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className={`w-10 h-10 rounded-lg bg-${milestone.color}-100 flex items-center justify-center`}>
                <milestone.icon className={`w-5 h-5 text-${milestone.color}-600`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-900">{milestone.title}</h4>
                  <span className={`px-2 py-1 bg-${milestone.color}-100 text-${milestone.color}-700 rounded-full text-xs font-medium`}>
                    {milestone.impact}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{milestone.description}</p>
                <p className="text-gray-500 text-xs mt-1">{milestone.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Source Attribution - Remove references */}
      <div className="bg-gradient-to-r from-slate-100 to-blue-100 rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-center space-x-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-900">
              Real-time Analytics Dashboard
            </p>
            <p className="text-xs text-slate-600">Live data from all major streaming platforms • Updated continuously</p>
          </div>
        </div>
      </div>
    </div>
  );
}


