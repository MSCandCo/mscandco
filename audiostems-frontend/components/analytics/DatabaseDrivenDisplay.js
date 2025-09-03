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

export default function DatabaseDrivenDisplay({ artistId, loading, showAdvanced = false }) {
  const [latestRelease, setLatestRelease] = useState(null);
  const [platformStats, setPlatformStats] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [advancedData, setAdvancedData] = useState(null);
  const [sectionVisibility, setSectionVisibility] = useState({});
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

          // Set advanced analytics data
          if (result.data.advancedData) {
            setAdvancedData(result.data.advancedData);
            console.log('🔮 Advanced analytics data loaded:', result.data.advancedData);
          }

          // Set visibility settings
          if (result.data.sectionVisibility) {
            setSectionVisibility(result.data.sectionVisibility);
            console.log('👁️ Section visibility settings loaded:', result.data.sectionVisibility);
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
    const audioUrl = latestRelease?.audioFileUrl || latestRelease?.audio_file_url;
    if (!audioRef || !audioUrl) {
      console.log('❌ Audio not available:', { audioRef: !!audioRef, audioUrl: !!audioUrl });
      return;
    }
    
    console.log('🎵 Toggle audio:', audioPlaying ? 'PAUSE' : 'PLAY');
    
    if (audioPlaying) {
      audioRef.pause();
      setAudioPlaying(false);
    } else {
      audioRef.play().catch(error => {
        console.error('❌ Audio play error:', error);
        setAudioPlaying(false);
      });
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
      {latestRelease && sectionVisibility.latestRelease !== false && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 sm:mr-3" />
            Latest Release Performance
          </h3>
          
          {/* Release Header - FROM DATABASE */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <div className="flex items-center space-x-6">
              {/* Cover Image with Overlay Play Button */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {latestRelease.artworkUrl || latestRelease.cover_image_url ? (
                    <img 
                      src={latestRelease.artworkUrl || latestRelease.cover_image_url} 
                      alt={latestRelease.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center" style={{ display: latestRelease.artworkUrl || latestRelease.cover_image_url ? 'none' : 'flex' }}>
                    <Music className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                {/* Overlay Play Button - Only show if audio exists */}
                {(latestRelease.audioFileUrl || latestRelease.audio_file_url) && (
                  <button
                    onClick={toggleAudio}
                    className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center group"
                  >
                    <div className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 sm:p-3 shadow-lg transition-all duration-200">
                      {audioPlaying ? (
                        <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
                      ) : (
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800 ml-0.5" />
                      )}
                    </div>
                  </button>
                )}
              </div>
              
              {/* Release Info - FROM DATABASE */}
              <div className="flex-1">
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                    {latestRelease.title || 'Untitled Release'}
                  </h4>
                  <p className="text-slate-600 mb-1">
                    Released: {latestRelease.releaseDate ? new Date(latestRelease.releaseDate).toLocaleDateString() : 'Date not set'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {latestRelease.releaseType || 'Unknown Type'} • Cross-platform performance
                  </p>
                </div>
                
                {/* Hidden audio element */}
                {(latestRelease.audioFileUrl || latestRelease.audio_file_url) && (
                  <audio
                    ref={(ref) => setAudioRef(ref)}
                    src={latestRelease.audioFileUrl || latestRelease.audio_file_url || ''}
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

      {/* Recent Milestones - Only in Basic tab (not in Advanced - it shows at bottom) */}
      {!showAdvanced && milestones.length > 0 && sectionVisibility.milestones !== false && (
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

      {/* Advanced Analytics Sections - Only show if showAdvanced is true and data exists */}
      {showAdvanced && advancedData && (
        <>
          {/* Artist Ranking */}
          {advancedData.artistRanking && advancedData.artistRanking.length > 0 && sectionVisibility.artistRanking !== false && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">Artist Ranking</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {advancedData.artistRanking
                  .filter(ranking => ranking.title && ranking.value)
                  .map((ranking, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-slate-50 rounded-xl text-center">
                      <h4 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">{ranking.title}</h4>
                      <p className="text-lg sm:text-xl font-bold text-slate-900">{ranking.value}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Career Snapshot */}
          {advancedData.careerSnapshot && advancedData.careerSnapshot.length > 0 && sectionVisibility.careerSnapshot !== false && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">Career Snapshot</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {advancedData.careerSnapshot
                  .filter(stage => stage.title && stage.value)
                  .map((stage, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-slate-50 rounded-xl text-center">
                      <h4 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">{stage.title}</h4>
                      <p className="text-base sm:text-lg font-bold text-purple-600">{stage.value}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Audience Summary */}
          {advancedData.audienceSummary && advancedData.audienceSummary.length > 0 && sectionVisibility.audienceSummary !== false && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">Audience Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {advancedData.audienceSummary
                  .filter(field => field.title && field.value)
                  .map((field, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-slate-50 rounded-xl text-center">
                      <h4 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">{field.title}</h4>
                      <p className="text-base sm:text-lg font-bold text-orange-600">{field.value}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Top Markets & Demographics */}
          {advancedData.topMarkets && advancedData.topMarkets.length > 0 && sectionVisibility.topMarkets !== false && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">Top Markets & Demographics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {advancedData.topMarkets
                  .filter(market => market.title && market.value)
                  .map((market, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-slate-50 rounded-xl text-center">
                      <h4 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">{market.title}</h4>
                      <p className="text-base sm:text-lg font-bold text-green-600">{market.value}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Top Statistics */}
          {advancedData.topStatistics && advancedData.topStatistics.length > 0 && sectionVisibility.topStatistics !== false && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">Top Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {advancedData.topStatistics
                  .filter(stat => stat.title && stat.value)
                  .map((stat, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-slate-50 rounded-xl text-center">
                      <h4 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">{stat.title}</h4>
                      <p className="text-lg sm:text-xl font-bold text-blue-600">{stat.value}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Top Tracks */}
          {advancedData.topTracks && advancedData.topTracks.length > 0 && sectionVisibility.topTracks !== false && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">Top Tracks</h3>
              <div className="space-y-3 sm:space-y-4">
                {advancedData.topTracks
                  .filter(track => track.title || track.artist || track.metrics)
                  .map((track, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-xl">
                      {/* Track artwork placeholder */}
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Music className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      
                      {/* Track info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">{track.title}</h4>
                        <p className="text-slate-600 text-xs sm:text-sm truncate">{track.artist}</p>
                        {track.platform && (
                          <p className="text-slate-500 text-xs">via {track.platform}</p>
                        )}
                      </div>
                      
                      {/* Metrics */}
                      {track.metrics && (
                        <div className="text-right">
                          <p className="text-sm sm:text-base font-semibold text-slate-900">{track.metrics}</p>
                        </div>
                      )}
                      
                      {/* Play button placeholder */}
                      <button className="bg-pink-100 hover:bg-pink-200 text-pink-600 p-2 rounded-full flex-shrink-0">
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* All Releases */}
          {advancedData.allReleases && advancedData.allReleases.length > 0 && sectionVisibility.allReleases !== false && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">All Releases</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {advancedData.allReleases
                  .filter(release => release.title || release.releaseDate)
                  .map((release, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        {/* Release artwork placeholder */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">{release.title}</h4>
                          <p className="text-slate-600 text-xs sm:text-sm">
                            {release.releaseType} • {release.releaseDate ? new Date(release.releaseDate).getFullYear() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                      {release.releaseDate && (
                        <p className="text-slate-500 text-xs">
                          Released: {new Date(release.releaseDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Platform Performance */}
          {advancedData.platformPerformance && advancedData.platformPerformance.length > 0 && sectionVisibility.platformPerformance !== false && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">Platform Performance</h3>
              <div className="space-y-3 sm:space-y-4">
                {advancedData.platformPerformance
                  .filter(platform => platform.platformTitle && (platform.metadataStat || platform.tag))
                  .map((platform, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl gap-2 sm:gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                        <h4 className="font-semibold text-slate-900 text-sm sm:text-base">{platform.platformTitle}</h4>
                        <span className="text-xs sm:text-sm text-slate-600">{platform.metadataTitle}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base sm:text-lg font-bold text-slate-900">{platform.metadataStat}</span>
                        {platform.tag && (
                          <span className={`text-xs sm:text-sm font-medium ${
                            platform.tag.startsWith('+') ? 'text-green-600' : 
                            platform.tag.startsWith('-') ? 'text-red-600' : 'text-slate-600'
                          }`}>
                            {platform.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recent Milestones - At bottom of Advanced tab */}
          {milestones.length > 0 && sectionVisibility.milestones !== false && (
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
        </>
      )}

    </div>
  );
}
