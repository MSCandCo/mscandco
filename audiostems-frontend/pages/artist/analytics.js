import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import Layout from '../../components/layouts/mainLayout';
import SubscriptionGate from '../../components/auth/SubscriptionGate';
import ChartmetricArtistLinking from '../../components/analytics/ChartmetricArtistLinking';
import { 
  TrendingUp, 
  Users, 
  Play, 
  DollarSign, 
  Music, 
  Globe,
  Calendar,
  Eye,
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
  Disc,
  ExternalLink
} from 'lucide-react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function BeautifulArtistAnalytics() {
  const { user, isLoading } = useUser();
  const [linkedArtist, setLinkedArtist] = useState(null);
  const [chartmetricData, setChartmetricData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Load Chartmetric data
  useEffect(() => {
    if (linkedArtist) {
      loadChartmetricData();
    }
  }, [linkedArtist]);

  const loadChartmetricData = async () => {
    if (!linkedArtist) return;
    
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) return;

      const response = await fetch('/api/chartmetric/artist-analytics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          artistId: linkedArtist.id,
          period: selectedPeriod
        })
      });

      if (response.ok) {
        const result = await response.json();
        setChartmetricData(result.data);
      }
    } catch (error) {
      console.error('Error loading Chartmetric data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArtistLinked = (artist) => {
    setLinkedArtist(artist);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Please log in to view analytics</h2>
          </div>
        </div>
      </Layout>
    );
  }

  // Mock data structure for beautiful display (will be replaced with real Chartmetric data)
  const mockData = {
    overview: {
      totalStreams: 2953839,
      monthlyListeners: 1260000,
      followers: 1450000,
      totalRevenue: 11392.50,
      growthRate: 17.1
    },
    platforms: [
      { name: 'Spotify', streams: 1450000, listeners: 1260000, followers: 1450000, growth: 12.5, color: '#1DB954' },
      { name: 'Apple Music', streams: 890000, listeners: 780000, followers: 650000, growth: 8.3, color: '#FA243C' },
      { name: 'YouTube Music', streams: 450000, listeners: 380000, followers: 290000, growth: 15.7, color: '#FF0000' },
      { name: 'Amazon Music', streams: 163839, listeners: 140000, followers: 110000, growth: 22.1, color: '#00A8E1' }
    ],
    demographics: {
      countries: [
        { name: 'Nigeria', percentage: 48.7, streams: 1437839 },
        { name: 'United States', percentage: 19.6, streams: 578752 },
        { name: 'United Kingdom', percentage: 12.3, streams: 363322 },
        { name: 'Ghana', percentage: 8.1, strings: 239261 },
        { name: 'South Africa', percentage: 6.2, streams: 183080 }
      ],
      genders: [
        { name: 'Male', percentage: 58.5 },
        { name: 'Female', percentage: 41.5 }
      ],
      ages: [
        { range: '18-24', percentage: 32.1 },
        { range: '25-34', percentage: 41.7 },
        { range: '35-44', percentage: 18.9 },
        { range: '45-54', percentage: 5.8 },
        { range: '55+', percentage: 1.5 }
      ]
    }
  };

  return (
    <SubscriptionGate 
      requiredFor="analytics and insights"
      showFeaturePreview={true}
      userRole="artist"
    >
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          {/* Beautiful Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Artist Analytics
                </h1>
                <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                  Track your music performance and audience insights with real-time data from all major streaming platforms
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Chartmetric Artist Linking Section */}
            {!linkedArtist ? (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
                <ChartmetricArtistLinking onLinked={handleArtistLinked} />
              </div>
            ) : (
              <>
                {/* Linked Artist Header */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <Music className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{linkedArtist.name}</h2>
                        <p className="text-slate-600">Chartmetric ID: {linkedArtist.id}</p>
                        <div className="flex items-center mt-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          <span className="text-sm text-green-600 font-medium">Live Data Connected</span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={`https://app.chartmetric.com/artist/${linkedArtist.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Chartmetric
                    </a>
                  </div>
                </div>

                {/* Period Selection */}
                <div className="flex justify-center mb-8">
                  <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-2">
                    {[
                      { value: '7d', label: '7 Days' },
                      { value: '30d', label: '30 Days' },
                      { value: '90d', label: '90 Days' },
                      { value: '1y', label: '1 Year' }
                    ].map((period) => (
                      <button
                        key={period.value}
                        onClick={() => setSelectedPeriod(period.value)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                          selectedPeriod === period.value
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Key Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    {
                      title: 'Total Streams',
                      value: mockData.overview.totalStreams.toLocaleString(),
                      change: '+17.1%',
                      icon: Play,
                      color: 'from-blue-500 to-blue-600',
                      bgColor: 'bg-blue-50',
                      textColor: 'text-blue-600'
                    },
                    {
                      title: 'Monthly Listeners',
                      value: (mockData.overview.monthlyListeners / 1000000).toFixed(1) + 'M',
                      change: '+12.3%',
                      icon: Headphones,
                      color: 'from-green-500 to-green-600',
                      bgColor: 'bg-green-50',
                      textColor: 'text-green-600'
                    },
                    {
                      title: 'Followers',
                      value: (mockData.overview.followers / 1000000).toFixed(1) + 'M',
                      change: '+8.7%',
                      icon: Users,
                      color: 'from-purple-500 to-purple-600',
                      bgColor: 'bg-purple-50',
                      textColor: 'text-purple-600'
                    },
                    {
                      title: 'Revenue',
                      value: '£' + mockData.overview.totalRevenue.toLocaleString(),
                      change: '+22.4%',
                      icon: DollarSign,
                      color: 'from-amber-500 to-amber-600',
                      bgColor: 'bg-amber-50',
                      textColor: 'text-amber-600'
                    }
                  ].map((metric, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl ${metric.bgColor} flex items-center justify-center`}>
                          <metric.icon className={`w-6 h-6 ${metric.textColor}`} />
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            {metric.change}
                          </div>
                        </div>
                      </div>
                      <h3 className="text-slate-600 text-sm font-medium mb-1">{metric.title}</h3>
                      <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
                    </div>
                  ))}
                </div>

                {/* Platform Performance Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Streaming Platforms */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center">
                        <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                        Platform Performance
                      </h3>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View All →
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {mockData.platforms.map((platform, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: platform.color }}
                            >
                              {platform.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900">{platform.name}</h4>
                              <p className="text-sm text-slate-600">{platform.streams.toLocaleString()} streams</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-900">{platform.listeners.toLocaleString()}</div>
                            <div className="text-sm text-green-600 font-medium">+{platform.growth}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Geographic Distribution */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center">
                        <Globe className="w-6 h-6 text-green-600 mr-3" />
                        Top Countries
                      </h3>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View All →
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {mockData.demographics.countries.map((country, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{index === 0 ? '🇳🇬' : index === 1 ? '🇺🇸' : index === 2 ? '🇬🇧' : index === 3 ? '🇬🇭' : '🇿🇦'}</div>
                            <div>
                              <h4 className="font-semibold text-slate-900">{country.name}</h4>
                              <p className="text-sm text-slate-600">{country.streams.toLocaleString()} streams</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-900">{country.percentage}%</div>
                            <div className="w-20 bg-slate-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${country.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Streams Over Time */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                      <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
                      Streams Over Time
                    </h3>
                    <div className="h-64">
                      <Line
                        data={{
                          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                          datasets: [{
                            label: 'Streams',
                            data: [45000, 52000, 48000, 61000],
                            borderColor: 'rgb(59, 130, 246)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false }
                          },
                          scales: {
                            y: { beginAtZero: true }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Platform Distribution */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                      <PieChart className="w-6 h-6 text-purple-600 mr-3" />
                      Platform Distribution
                    </h3>
                    <div className="h-64">
                      <Doughnut
                        data={{
                          labels: mockData.platforms.map(p => p.name),
                          datasets: [{
                            data: mockData.platforms.map(p => p.streams),
                            backgroundColor: mockData.platforms.map(p => p.color),
                            borderWidth: 0
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                usePointStyle: true,
                                padding: 20
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Detailed Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Career Stage */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-900 flex items-center">
                        <Target className="w-5 h-5 text-indigo-600 mr-2" />
                        Career Stage
                      </h4>
                    </div>
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 relative">
                        <div className="w-full h-full border-8 border-indigo-200 rounded-full"></div>
                        <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-r-transparent border-b-transparent transform rotate-45"></div>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">Developing</p>
                      <p className="text-sm text-slate-600">Mid-Level Artist</p>
                    </div>
                  </div>

                  {/* Recent Momentum */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-900 flex items-center">
                        <Activity className="w-5 h-5 text-green-600 mr-2" />
                        Recent Momentum
                      </h4>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">Steady</div>
                      <div className="text-sm text-slate-600 mb-4">Gradual Growth</div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>

                  {/* Social Engagement */}
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-900 flex items-center">
                        <Heart className="w-5 h-5 text-pink-600 mr-2" />
                        Social Engagement
                      </h4>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-pink-600 mb-2">High</div>
                      <div className="text-sm text-slate-600 mb-4">Active Fanbase</div>
                      <div className="flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-pink-300 rounded-full"></div>
                        <div className="w-3 h-3 bg-pink-200 rounded-full"></div>
                        <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Platform Analytics */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                    <Monitor className="w-7 h-7 text-blue-600 mr-3" />
                    Platform Deep Dive
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {mockData.platforms.slice(0, 2).map((platform, index) => (
                      <div key={index} className="border border-slate-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: platform.color }}
                            >
                              {platform.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-slate-900">{platform.name}</h4>
                              <p className="text-slate-600">Primary Market</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-900">{platform.listeners.toLocaleString()}</div>
                            <div className="text-sm text-slate-600">Monthly Listeners</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <div className="text-lg font-bold text-slate-900">{platform.streams.toLocaleString()}</div>
                            <div className="text-xs text-slate-600">Total Streams</div>
                          </div>
                          <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <div className="text-lg font-bold text-slate-900">{platform.followers.toLocaleString()}</div>
                            <div className="text-xs text-slate-600">Followers</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Layout>
    </SubscriptionGate>
  );
}
