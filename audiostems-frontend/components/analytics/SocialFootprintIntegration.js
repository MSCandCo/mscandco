import { useState } from 'react';
import { 
  FaInstagram, 
  FaFacebook, 
  FaTiktok, 
  FaTwitter, 
  FaYoutube,
  FaSpotify,
  FaApple,
  FaSoundcloud,
  FaMusic,
  FaHeadphones,
  FaPlay,
  FaUsers,
  FaEye,
  FaHeart,
  FaShare,
  FaDownload
} from 'react-icons/fa';
import { SiShazam, SiPandora } from 'react-icons/si';

export default function SocialFootprintIntegration() {
  const [activeView, setActiveView] = useState('overview');

  // Mock data structure based on Chartmetric design
  const careerSnapshot = {
    careerStage: { level: 'Mainstream', sublevel: 'Mid-Level', status: 'Developing' },
    recentMomentum: { level: 'Steady', sublevel: 'Gradual Decline', status: 'Decline' },
    networkStrength: { level: 'Established', sublevel: 'Emerging', status: 'Active' },
    socialEngagement: { level: 'Established', sublevel: 'Emerging', status: 'Active' }
  };

  const audienceSummary = {
    socialFootprint: { value: '7.5M', label: 'Total Fanbase' },
    primaryMarket: { country: 'Nigeria', percentage: '52.7%' },
    secondaryMarket: { country: 'United States', percentage: '10.1%' },
    primaryGender: { gender: 'Male', percentage: '51.8%' },
    primaryAge: { range: '25-34', percentage: '58.1%' }
  };

  const platformStats = {
    spotify: {
      followers: { value: '1.44M', change: '2,898th' },
      monthlyListeners: { value: '1.25M', change: '(0.05%th)' },
      popularity: { value: '60/100', change: '(8,677th)' },
      playlistReach: { value: '7.09M', change: '' },
      fanConversionRate: { value: '115.54%', change: '' },
      reachFollowersRatio: { value: '4.92x', change: '' }
    },
    tiktok: {
      followers: { value: '1.80M', change: '(2,658th)' },
      likes: { value: '33.70M', change: '(2,820th)' },
      topVideosViews: { value: '109.71M', change: '(23,647th)' },
      postCount: { value: '2.28M', change: '(1,845th)' }
    },
    pandora: {
      monthlyListeners: { value: '19.15K', change: '(12,661st)' },
      streams: { value: '4.24M', change: '(21,875th)' },
      artistStations: { value: '6.69K', change: '(33,688th)' }
    },
    shazam: {
      totalCount: { value: '3.52M', change: '' }
    },
    airplay: {
      siriusXmSpins: { value: '15', change: '(40,740th)' },
      radioSpins: { value: '5.16K', change: '(22,836th)' }
    },
    instagram: {
      followers: { value: '2.54M', change: '(3,576th)' }
    },
    youtube: {
      channelSubscribers: { value: '1.71M', change: '(3,424th)' },
      channelViews: { value: '449.66M', change: '(5,357th)' }
    },
    deezer: {
      fans: { value: '16.05K', change: '(15,385th)' }
    },
    genius: {
      views: { value: '21.33K', change: '' }
    }
  };

  const notableFollowers = [
    { name: 'Davido', country: 'NG', followers: '30.56M', avatar: '/avatars/davido.jpg' },
    { name: 'MERCY AIGBE ADEOTI', country: 'NG', followers: '11.63M', avatar: '/avatars/mercy.jpg' },
    { name: 'Jackie Appiah', country: 'GH', followers: '11.22M', avatar: '/avatars/jackie.jpg' },
    { name: 'Cuppy', country: 'NG', followers: '8.87M', avatar: '/avatars/cuppy.jpg' },
    { name: 'AMB. KING TONTO', country: 'NG', followers: '7.56M', avatar: '/avatars/tonto.jpg' }
  ];

  const renderCareerSnapshot = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Career Snapshot</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(careerSnapshot).map(([key, data]) => (
          <div key={key} className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              {/* Circular progress indicator */}
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 50 * 0.7} ${2 * Math.PI * 50}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-sm font-semibold text-gray-900">{data.level}</div>
                <div className="text-xs text-gray-600">{data.sublevel}</div>
                <div className="text-xs text-blue-600 font-medium">{data.status}</div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-900 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAudienceSummary = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Audience Summary</h2>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          All Audience Stats →
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
            <FaUsers className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{audienceSummary.socialFootprint.value}</div>
          <div className="text-sm text-gray-600">{audienceSummary.socialFootprint.label}</div>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🌍</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{audienceSummary.primaryMarket.country}</div>
          <div className="text-sm text-gray-600">{audienceSummary.primaryMarket.percentage}</div>
          <div className="text-xs text-gray-500">Primary Market</div>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🇺🇸</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{audienceSummary.secondaryMarket.country}</div>
          <div className="text-sm text-gray-600">{audienceSummary.secondaryMarket.percentage}</div>
          <div className="text-xs text-gray-500">Secondary Market</div>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">👨</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{audienceSummary.primaryGender.gender}</div>
          <div className="text-sm text-gray-600">{audienceSummary.primaryGender.percentage}</div>
          <div className="text-xs text-gray-500">Primary Gender</div>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{audienceSummary.primaryAge.range}</div>
          <div className="text-sm text-gray-600">{audienceSummary.primaryAge.percentage}</div>
          <div className="text-xs text-gray-500">Primary Age</div>
        </div>
      </div>
    </div>
  );

  const renderPlatformStats = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Summary Statistics</h2>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          All Stats & Trends →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Spotify */}
        <div>
          <div className="flex items-center mb-4">
            <FaSpotify className="w-6 h-6 text-green-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Spotify</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Followers</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.spotify.followers.value}</div>
                <div className="text-xs text-blue-600">{platformStats.spotify.followers.change}</div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monthly Listeners</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.spotify.monthlyListeners.value}</div>
                <div className="text-xs text-blue-600">{platformStats.spotify.monthlyListeners.change}</div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Popularity</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.spotify.popularity.value}</div>
                <div className="text-xs text-blue-600">{platformStats.spotify.popularity.change}</div>
              </div>
            </div>
          </div>
        </div>

        {/* TikTok */}
        <div>
          <div className="flex items-center mb-4">
            <FaTiktok className="w-6 h-6 text-black mr-2" />
            <h3 className="font-semibold text-gray-900">TikTok</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Followers</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.tiktok.followers.value}</div>
                <div className="text-xs text-blue-600">{platformStats.tiktok.followers.change}</div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Likes</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.tiktok.likes.value}</div>
                <div className="text-xs text-blue-600">{platformStats.tiktok.likes.change}</div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Top Videos' Views</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.tiktok.topVideosViews.value}</div>
                <div className="text-xs text-blue-600">{platformStats.tiktok.topVideosViews.change}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pandora */}
        <div>
          <div className="flex items-center mb-4">
            <SiPandora className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Pandora</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monthly Listeners</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.pandora.monthlyListeners.value}</div>
                <div className="text-xs text-blue-600">{platformStats.pandora.monthlyListeners.change}</div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Streams</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.pandora.streams.value}</div>
                <div className="text-xs text-blue-600">{platformStats.pandora.streams.change}</div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Artist Stations</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.pandora.artistStations.value}</div>
                <div className="text-xs text-blue-600">{platformStats.pandora.artistStations.change}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Shazam */}
        <div>
          <div className="flex items-center mb-4">
            <SiShazam className="w-6 h-6 text-blue-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Shazam</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Count</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.shazam.totalCount.value}</div>
              </div>
            </div>
          </div>
        </div>

        {/* AirPlay */}
        <div>
          <div className="flex items-center mb-4">
            <FaPlay className="w-6 h-6 text-gray-700 mr-2" />
            <h3 className="font-semibold text-gray-900">AirPlay</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">SiriusXm Spins</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.airplay.siriusXmSpins.value}</div>
                <div className="text-xs text-blue-600">{platformStats.airplay.siriusXmSpins.change}</div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Radio Spins</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.airplay.radioSpins.value}</div>
                <div className="text-xs text-blue-600">{platformStats.airplay.radioSpins.change}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second row of platforms */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8 pt-8 border-t border-gray-200">
        {/* Instagram */}
        <div>
          <div className="flex items-center mb-4">
            <FaInstagram className="w-6 h-6 text-pink-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Instagram</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Followers</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.instagram.followers.value}</div>
                <div className="text-xs text-blue-600">{platformStats.instagram.followers.change}</div>
              </div>
            </div>
          </div>
        </div>

        {/* YouTube */}
        <div>
          <div className="flex items-center mb-4">
            <FaYoutube className="w-6 h-6 text-red-500 mr-2" />
            <h3 className="font-semibold text-gray-900">YouTube</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Channel Subscribers</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.youtube.channelSubscribers.value}</div>
                <div className="text-xs text-blue-600">{platformStats.youtube.channelSubscribers.change}</div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Channel Views</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.youtube.channelViews.value}</div>
                <div className="text-xs text-blue-600">{platformStats.youtube.channelViews.change}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Deezer */}
        <div>
          <div className="flex items-center mb-4">
            <FaMusic className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Deezer</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Fans</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.deezer.fans.value}</div>
                <div className="text-xs text-blue-600">{platformStats.deezer.fans.change}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Genius */}
        <div>
          <div className="flex items-center mb-4">
            <FaMusic className="w-6 h-6 text-yellow-500 mr-2" />
            <h3 className="font-semibold text-gray-900">Genius</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Views</span>
              <div className="text-right">
                <div className="font-medium">{platformStats.genius.views.value}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotableFollowers = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Notable Followers</h2>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          Export
        </button>
      </div>

      <div className="mb-4 flex space-x-4">
        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
          <FaInstagram className="inline w-4 h-4 mr-1" /> Instagram
        </button>
        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
          <FaTiktok className="inline w-4 h-4 mr-1" /> TikTok
        </button>
        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
          <FaYoutube className="inline w-4 h-4 mr-1" /> YouTube
        </button>
      </div>

      <div className="space-y-4">
        {notableFollowers.map((follower, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <FaUsers className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{follower.name}</div>
                <div className="text-sm text-gray-600">{follower.country}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">{follower.followers}</div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <div className="text-sm text-gray-500">1 to 10 of 60</div>
        <div className="flex justify-center space-x-2 mt-2">
          <button className="px-3 py-1 border border-gray-300 rounded text-sm">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm">2</button>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm">3</button>
          <span className="px-3 py-1 text-sm text-gray-500">...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Career Snapshot */}
      {renderCareerSnapshot()}
      
      {/* Audience Summary */}
      {renderAudienceSummary()}
      
      {/* Platform Statistics */}
      {renderPlatformStats()}
      
      {/* Notable Followers */}
      {renderNotableFollowers()}

      {/* Integration Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <div className="text-blue-600 mb-2">
          <FaMusic className="w-8 h-8 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-blue-900 mb-2">Connect Your Social Accounts</h3>
        <p className="text-blue-700 mb-4">
          Connect your social media accounts to get real-time analytics and insights like the data shown above.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg">
          Connect Accounts
        </button>
      </div>
    </div>
  );
}