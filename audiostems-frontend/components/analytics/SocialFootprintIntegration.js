import { useState } from 'react';
import { Card, Button, Badge } from 'flowbite-react';
import { 
  FaInstagram, 
  FaFacebook, 
  FaTiktok, 
  FaTwitter, 
  FaYoutube,
  FaSpotify,
  FaApple,
  FaSoundcloud,
  FaDeezer,
  FaAmazon,
  FaShazam,
  FaPandora,
  FaAirplay
} from 'react-icons/fa';

export default function SocialFootprintIntegration() {
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  const socialPlatforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: FaInstagram,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      apiEndpoint: '/api/social/instagram/connect',
      description: 'Connect your Instagram account to track followers and engagement'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-blue-600',
      apiEndpoint: '/api/social/facebook/connect',
      description: 'Connect your Facebook page to track likes and engagement'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: FaTiktok,
      color: 'bg-black',
      apiEndpoint: '/api/social/tiktok/connect',
      description: 'Connect your TikTok account to track followers and views'
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: FaTwitter,
      color: 'bg-black',
      apiEndpoint: '/api/social/twitter/connect',
      description: 'Connect your X account to track followers and engagement'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: FaYoutube,
      color: 'bg-red-600',
      apiEndpoint: '/api/social/youtube/connect',
      description: 'Connect your YouTube channel to track subscribers and views'
    }
  ];

  const musicPlatforms = [
    {
      id: 'spotify',
      name: 'Spotify',
      icon: FaSpotify,
      color: 'bg-green-500',
      apiEndpoint: '/api/music/spotify/connect',
      description: 'Connect your Spotify artist profile to track followers and streams'
    },
    {
      id: 'apple',
      name: 'Apple Music',
      icon: FaApple,
      color: 'bg-pink-500',
      apiEndpoint: '/api/music/apple/connect',
      description: 'Connect your Apple Music profile to track followers and plays'
    },
    {
      id: 'soundcloud',
      name: 'SoundCloud',
      icon: FaSoundcloud,
      color: 'bg-orange-500',
      apiEndpoint: '/api/music/soundcloud/connect',
      description: 'Connect your SoundCloud profile to track followers and plays'
    },
    {
      id: 'deezer',
      name: 'Deezer',
      icon: FaDeezer,
      color: 'bg-blue-500',
      apiEndpoint: '/api/music/deezer/connect',
      description: 'Connect your Deezer profile to track followers and plays'
    },
    {
      id: 'amazon',
      name: 'Amazon Music',
      icon: FaAmazon,
      color: 'bg-orange-600',
      apiEndpoint: '/api/music/amazon/connect',
      description: 'Connect your Amazon Music profile to track plays and engagement'
    },
    {
      id: 'shazam',
      name: 'Shazam',
      icon: FaShazam,
      color: 'bg-red-500',
      apiEndpoint: '/api/music/shazam/connect',
      description: 'Connect your Shazam account to track song recognition'
    },
    {
      id: 'pandora',
      name: 'Pandora',
      icon: FaPandora,
      color: 'bg-purple-500',
      apiEndpoint: '/api/music/pandora/connect',
      description: 'Connect your Pandora account to track listeners'
    },
    {
      id: 'airplay',
      name: 'AirPlay',
      icon: FaAirplay,
      color: 'bg-blue-700',
      apiEndpoint: '/api/music/airplay/connect',
      description: 'Connect your AirPlay device to track playback'
    }
  ];

  const handleConnectPlatform = async (platform) => {
    setIsConnecting(true);
    try {
      // This would open OAuth flow for the specific platform
      const response = await fetch(platform.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform: platform.id })
      });
      
      if (response.ok) {
        setConnectedPlatforms(prev => [...prev, platform.id]);
      }
    } catch (error) {
      console.error('Error connecting platform:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const calculateTotalFootprint = () => {
    // This would be calculated from actual API data
    return {
      socialFollowers: 23456,
      musicFollowers: 12345,
      totalStreams: 67890,
      totalViews: 45678,
      totalFootprint: 23456 + 12345 + 67890 + 45678
    };
  };

  const footprint = calculateTotalFootprint();

  return (
    <div className="space-y-6">
      {/* Social Footprint Overview */}
      <Card className="bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Social Footprint Overview</h3>
          <Badge color="info" className="text-sm">
            {connectedPlatforms.length} Platforms Connected
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{footprint.socialFollowers.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Social Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{footprint.musicFollowers.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Music Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{footprint.totalStreams.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Streams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{footprint.totalViews.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{footprint.totalFootprint.toLocaleString()}</div>
            <div className="text-lg text-gray-600">Total Social Footprint</div>
          </div>
        </div>
      </Card>

      {/* Social Platforms */}
      <Card className="bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialPlatforms.map((platform) => (
            <div key={platform.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-lg ${platform.color}`}>
                  <platform.icon className="text-white text-lg" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{platform.name}</h4>
                  <p className="text-sm text-gray-600">{platform.description}</p>
                </div>
              </div>
              
              <Button
                size="sm"
                color={connectedPlatforms.includes(platform.id) ? 'success' : 'gray'}
                disabled={isConnecting}
                onClick={() => handleConnectPlatform(platform)}
                className="w-full"
              >
                {connectedPlatforms.includes(platform.id) ? 'Connected' : 'Connect'}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Music Platforms */}
      <Card className="bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Music Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {musicPlatforms.map((platform) => (
            <div key={platform.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-lg ${platform.color}`}>
                  <platform.icon className="text-white text-lg" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{platform.name}</h4>
                  <p className="text-sm text-gray-600">{platform.description}</p>
                </div>
              </div>
              
              <Button
                size="sm"
                color={connectedPlatforms.includes(platform.id) ? 'success' : 'gray'}
                disabled={isConnecting}
                onClick={() => handleConnectPlatform(platform)}
                className="w-full"
              >
                {connectedPlatforms.includes(platform.id) ? 'Connected' : 'Connect'}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 