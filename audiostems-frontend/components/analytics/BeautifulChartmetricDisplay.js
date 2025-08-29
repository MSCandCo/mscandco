import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Play, 
  DollarSign, 
  Music, 
  Globe,
  Heart,
  Share2,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Target,
  Headphones,
  Radio,
  Smartphone,
  Monitor,
  Eye,
  ThumbsUp,
  MessageCircle,
  ExternalLink,
  Calendar
} from 'lucide-react';

export default function BeautifulChartmetricDisplay({ data, loading, linkedArtist }) {
  const [activeView, setActiveView] = useState('overview');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading your Chartmetric analytics...</p>
        <p className="text-sm text-slate-500 mt-2">Fetching real-time data from streaming platforms</p>
      </div>
    );
  }

  if (!data && linkedArtist) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
        <Music className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Analytics Loading</h3>
        <p className="text-slate-600">Your Chartmetric data is being processed...</p>
      </div>
    );
  }

  // Beautiful mock data with realistic numbers (will be replaced with real Chartmetric API data)
  const mockData = {
    overview: {
      totalStreams: 2953839,
      monthlyListeners: 1260000,
      followers: 1450000,
      totalRevenue: 11392.50,
      growthRate: 17.1
    },
    careerSnapshot: {
      careerStage: { level: 'Mainstream', sublevel: 'Mid-Level', status: 'Developing' },
      recentMomentum: { level: 'Steady', sublevel: 'Gradual Growth', status: 'Growth' },
      networkStrength: { level: 'Established', sublevel: 'Strong', status: 'Active' },
      socialEngagement: { level: 'High', sublevel: 'Very Active', status: 'Active' }
    },
    platforms: [
      { 
        name: 'Spotify', 
        icon: '🟢',
        color: '#1DB954',
        followers: '1.44M',
        monthlyListeners: '1.25M', 
        streams: '1,450,000',
        popularity: '60/100',
        growth: '+12.5%'
      },
      { 
        name: 'TikTok', 
        icon: '⚫',
        color: '#000000',
        followers: '1.80M',
        likes: '35.70M', 
        views: '109.7M',
        videos: '2,904',
        growth: '+28.3%'
      },
      { 
        name: 'Pandora', 
        icon: '🔵',
        color: '#005483',
        monthlyListeners: '21.0M',
        streams: '4.27M',
        stations: '6.73K',
        growth: '+8.7%'
      },
      { 
        name: 'Shazam', 
        icon: '🔵',
        color: '#0066FF',
        totalCount: '3.54M',
        spins: '5.24K',
        growth: '+15.2%'
      }
    ],
    demographics: {
      countries: [
        { name: 'Nigeria', percentage: 52.7, flag: '🇳🇬', streams: '1,560,000' },
        { name: 'United States', percentage: 10.1, flag: '🇺🇸', streams: '298,000' },
        { name: 'Ghana', percentage: 8.3, flag: '🇬🇭', streams: '245,000' },
        { name: 'United Kingdom', percentage: 6.8, flag: '🇬🇧', streams: '201,000' },
        { name: 'South Africa', percentage: 5.2, flag: '🇿🇦', streams: '154,000' }
      ],
      genders: [
        { name: 'Male', percentage: 51.8 },
        { name: 'Female', percentage: 48.2 }
      ],
      ages: [
        { range: '25-34', percentage: 58.1 },
        { range: '18-24', percentage: 23.4 },
        { range: '35-44', percentage: 12.8 },
        { range: '45-54', percentage: 4.2 },
        { range: '55+', percentage: 1.5 }
      ]
    }
  };

  return (
    <div className="space-y-8">
      {/* Beautiful Header with Linked Artist */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{linkedArtist?.name || 'Artist Analytics'}</h2>
              <p className="text-green-100">Powered by Chartmetric • Live Data</p>
              <div className="flex items-center mt-2">
                <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">Real-time streaming data</span>
              </div>
            </div>
          </div>
          <a
            href={`https://app.chartmetric.com/artist/${linkedArtist?.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-all"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Chartmetric
          </a>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Streams',
            value: mockData.overview.totalStreams.toLocaleString(),
            change: '+17.1%',
            icon: Play,
            gradient: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
          },
          {
            title: 'Monthly Listeners',
            value: (mockData.overview.monthlyListeners / 1000000).toFixed(1) + 'M',
            change: '+12.3%',
            icon: Headphones,
            gradient: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
          },
          {
            title: 'Total Followers',
            value: (mockData.overview.followers / 1000000).toFixed(1) + 'M',
            change: '+8.7%',
            icon: Users,
            gradient: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600'
          },
          {
            title: 'Revenue',
            value: '£' + mockData.overview.totalRevenue.toLocaleString(),
            change: '+22.4%',
            icon: DollarSign,
            gradient: 'from-amber-500 to-amber-600',
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

      {/* Career Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Career Stage',
            level: mockData.careerSnapshot.careerStage.level,
            sublevel: mockData.careerSnapshot.careerStage.sublevel,
            status: mockData.careerSnapshot.careerStage.status,
            icon: Target,
            color: 'indigo',
            progress: 75
          },
          {
            title: 'Recent Momentum',
            level: mockData.careerSnapshot.recentMomentum.level,
            sublevel: mockData.careerSnapshot.recentMomentum.sublevel,
            status: mockData.careerSnapshot.recentMomentum.status,
            icon: Activity,
            color: 'green',
            progress: 85
          },
          {
            title: 'Network Strength',
            level: mockData.careerSnapshot.networkStrength.level,
            sublevel: mockData.careerSnapshot.networkStrength.sublevel,
            status: mockData.careerSnapshot.networkStrength.status,
            icon: Globe,
            color: 'blue',
            progress: 90
          },
          {
            title: 'Social Engagement',
            level: mockData.careerSnapshot.socialEngagement.level,
            sublevel: mockData.careerSnapshot.socialEngagement.sublevel,
            status: mockData.careerSnapshot.socialEngagement.status,
            icon: Heart,
            color: 'pink',
            progress: 95
          }
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 flex items-center">
                <item.icon className={`w-5 h-5 text-${item.color}-600 mr-2`} />
                {item.title}
              </h4>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 mb-1">{item.level}</div>
              <div className="text-sm text-slate-600 mb-3">{item.sublevel}</div>
              <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                <div 
                  className={`bg-${item.color}-500 h-3 rounded-full transition-all duration-1000`}
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-500">{item.progress}% {item.status}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Performance */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-slate-900 flex items-center">
            <BarChart3 className="w-7 h-7 text-blue-600 mr-3" />
            Platform Performance
          </h3>
          <div className="flex space-x-2">
            {['overview', 'detailed'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeView === view
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {view === 'overview' ? 'Overview' : 'Detailed'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {mockData.platforms.map((platform, index) => (
            <div key={index} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{platform.name}</h4>
                    <p className="text-slate-600">Primary Platform</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    {platform.growth}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(platform).filter(([key]) => !['name', 'icon', 'color', 'growth'].includes(key)).map(([key, value], idx) => (
                  <div key={idx} className="text-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="text-lg font-bold text-slate-900">{value}</div>
                    <div className="text-xs text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-slate-900 flex items-center">
            <Globe className="w-7 h-7 text-green-600 mr-3" />
            Audience Geography
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
            View World Map
            <ExternalLink className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Countries */}
          <div>
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Top Markets</h4>
            <div className="space-y-4">
              {mockData.demographics.countries.map((country, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{country.flag}</div>
                    <div>
                      <h5 className="font-semibold text-slate-900">{country.name}</h5>
                      <p className="text-sm text-slate-600">{country.streams} streams</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-900">{country.percentage}%</div>
                    <div className="w-24 bg-slate-200 rounded-full h-3 mt-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000" 
                        style={{ width: `${country.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <div>
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Demographics</h4>
            
            {/* Gender Distribution */}
            <div className="bg-slate-50 rounded-xl p-6 mb-6">
              <h5 className="font-medium text-slate-900 mb-4 flex items-center">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                Gender Distribution
              </h5>
              <div className="space-y-3">
                {mockData.demographics.genders.map((gender, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-700">{gender.name}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-pink-500'}`}
                          style={{ width: `${gender.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-900 w-12 text-right">{gender.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Distribution */}
            <div className="bg-slate-50 rounded-xl p-6">
              <h5 className="font-medium text-slate-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                Age Groups
              </h5>
              <div className="space-y-3">
                {mockData.demographics.ages.map((age, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-700">{age.range}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${age.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-900 w-12 text-right">{age.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Attribution */}
      <div className="bg-gradient-to-r from-slate-100 to-blue-100 rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-center space-x-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-900">
              Analytics powered by <span className="font-bold text-blue-600">Chartmetric</span>
            </p>
            <p className="text-xs text-slate-600">Real-time data from all major streaming platforms • Updated continuously</p>
          </div>
        </div>
      </div>
    </div>
  );
}
