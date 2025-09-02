// Database-Driven Analytics Display - NO MOCK DATA
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Award, 
  Music, 
  Play,
  Pause
} from 'lucide-react';

// Helper function for relative dates
function calculateRelativeDate(dateString) {
  if (!dateString) return 'Recently';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

export default function DatabaseDrivenDisplay({ artistId, loading }) {
  const [latestRelease, setLatestRelease] = useState(null);
  const [platformStats, setPlatformStats] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);

  // Fetch data from analytics management system - REAL DATA
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!artistId) {
        setDataLoading(false);
        return;
      }

      try {
        console.log('📊 Fetching saved analytics data for artist:', artistId);

        // Fetch from the same source that analytics management saves to
        const response = await fetch('/api/debug/test-load-analytics');
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log('📦 Found saved analytics data:', result.data);
          
          // Set latest release data
          if (result.data.latestRelease) {
            setLatestRelease(result.data.latestRelease);
            
            // Convert platforms format to match platform stats
            const platforms = result.data.latestRelease.platforms || [];
            setPlatformStats(platforms.map((platform, index) => ({
              id: index + 1,
              platform_name: platform.name,
              value: platform.streams,
              percentage: platform.change,
              position: index + 1
            })));
          }
          
          // Set milestones data
          if (result.data.milestones) {
            setMilestones(result.data.milestones);
          }
        } else {
          console.log('📭 No saved analytics data found');
        }

      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [artistId]);

  // Audio player controls
  const toggleAudio = () => {
    if (!audioRef || !latestRelease?.audio_file_url) return;
    
    if (audioPlaying) {
      audioRef.pause();
      setAudioPlaying(false);
    } else {
      audioRef.play();
      setAudioPlaying(true);
    }
  };

  if (dataLoading || loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no data exists
  if (!latestRelease && milestones.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Music className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No Analytics Data</h2>
          <p className="text-slate-600 mb-8">
            Your analytics will appear here once your admin team adds your release and performance data.
          </p>
          <div className="text-sm text-slate-500">
            Contact your admin to set up your analytics dashboard.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Latest Release Performance - DATABASE DRIVEN */}
      {latestRelease && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
            Latest Release Performance
          </h3>
          
          {/* Release Header - FROM DATABASE */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <div className="flex items-center space-x-4">
              {/* Cover Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {latestRelease.cover_image_url ? (
                  <img 
                    src={latestRelease.cover_image_url} 
                    alt={latestRelease.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music className="w-8 h-8 text-white" />
                )}
              </div>
              
              {/* Release Info - FROM DATABASE */}
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {latestRelease.title || 'Untitled Release'}
                    </h4>
                    <p className="text-slate-600">
                      Released: {latestRelease.release_date ? new Date(latestRelease.release_date).toLocaleDateString() : 'Date not set'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {latestRelease.release_type || 'Unknown Type'} • Cross-platform performance
                    </p>
                  </div>
                  
                  {/* Audio Player - FROM DATABASE */}
                  {latestRelease.audio_file_url && (
                    <button
                      onClick={toggleAudio}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
                    >
                      {audioPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
                
                {/* Hidden audio element */}
                {latestRelease.audio_file_url && (
                  <audio
                    ref={(ref) => setAudioRef(ref)}
                    src={latestRelease.audio_file_url}
                    onEnded={() => setAudioPlaying(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Platform Performance - DATABASE DRIVEN */}
          {platformStats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platformStats
                .sort((a, b) => a.position - b.position)
                .map((platform, index) => (
                  <div key={platform.id} className="p-4 bg-slate-50 rounded-xl text-center">
                    <h4 className="font-semibold text-slate-900 mb-1">{platform.platform_name}</h4>
                    <p className="text-xl font-bold text-slate-900">{platform.value}</p>
                    <p className={`text-xs font-medium ${
                      platform.percentage?.startsWith('+') ? 'text-green-600' : 
                      platform.percentage?.startsWith('-') ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {platform.percentage}
                    </p>
                  </div>
                ))}
            </div>
          )}
          
          {/* Empty state for platforms */}
          {platformStats.length === 0 && latestRelease && (
            <div className="text-center py-8 text-slate-500">
              <p>No platform performance data available</p>
              <p className="text-sm">Admin needs to add platform statistics</p>
            </div>
          )}
        </div>
      )}

      {/* Recent Milestones - DATABASE DRIVEN */}
      {milestones.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <Award className="w-6 h-6 text-yellow-600 mr-3" />
            Recent Milestones
          </h3>
          
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={milestone.id || index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  {/* Title and Tag inline */}
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900">{milestone.title}</h4>
                    {milestone.tag && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {milestone.tag}
                      </span>
                    )}
                  </div>
                  
                  {/* Description in light gray */}
                  {milestone.milestone && (
                    <p className="text-gray-600 text-sm mb-2">{milestone.milestone}</p>
                  )}
                  
                  {/* Relative date */}
                  <p className="text-gray-500 text-xs">
                    {milestone.relativeDate || milestone.relative_date || (
                      milestone.date ? calculateRelativeDate(milestone.date) : 'Recently'
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for milestones */}
      {milestones.length === 0 && latestRelease && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <Award className="w-6 h-6 text-yellow-600 mr-3" />
            Recent Milestones
          </h3>
          <div className="text-center py-8 text-slate-500">
            <p>No milestones available</p>
            <p className="text-sm">Admin needs to add milestone achievements</p>
          </div>
        </div>
      )}

    </div>
  );
}
