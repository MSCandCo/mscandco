'use client'

// Clean Manual Analytics Display Component - CREATIVE VERSION (MUTED COLORS)
import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { 
  TrendingUp, 
  Award, 
  Music, 
  BarChart3,
  Crown,
  Sparkles,
  Target,
  Globe,
  Users as UsersIcon
} from 'lucide-react';
import SimpleScrollIndicator from '../shared/SimpleScrollIndicator';

export default function CleanManualDisplay({ artistId, showAdvanced = false }) {
  const { session } = useUser();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch manual analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!artistId || !session) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching manual analytics for artist:', artistId);

        // Get auth token
        const token = session.access_token;

        if (!token) {
          console.error('No auth token');
          setError('Authentication required');
          setLoading(false);
          return;
        }

        // Call analytics data API (with artistId for label admins)
        const url = artistId ? `/api/artist/analytics-data?artistId=${artistId}` : '/api/artist/analytics-data';
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (response.ok && result.data) {
          console.log('Data received:', result.data);
          console.log('Has latestRelease?', !!result.data.latestRelease);
          console.log('Has milestones?', result.data.milestones?.length || 0);
          console.log('SectionVisibility:', result.data.sectionVisibility);
          console.log('AdvancedData keys:', Object.keys(result.data.advancedData || {}));
          
          setAnalyticsData(result.data);
        } else {
          console.error('Failed to fetch analytics:', result);
          setError(result.message || 'Failed to load analytics data');
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [artistId, session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold mb-2">Error Loading Analytics</p>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const { latestRelease, milestones, sectionVisibility, advancedData } = analyticsData;

  // Define which sections are allowed based on subscription
  const basicSections = ['latestRelease', 'milestones'];
  const advancedSections = [
    'latestRelease', 'milestones', 'artistRanking', 'careerSnapshot', 
    'audienceSummary', 'topMarkets', 'topStatistics', 'platformPerformance',
    'topTracks', 'allReleases'
  ];
  const allowedSections = showAdvanced ? advancedSections : basicSections;

  return (
    <div className="space-y-8">
            {/* Career Snapshot - Bento Grid Style (MOVED TO TOP) */}
            {showAdvanced && allowedSections.includes('careerSnapshot') && sectionVisibility.careerSnapshot && advancedData?.careerSnapshot && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-slate-800 rounded-2xl shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Career Snapshot
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {advancedData.careerSnapshot.map((snapshot, index) => (
                    <div key={index} 
                         className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 group bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <Target className="w-8 h-8 text-violet-600 group-hover:rotate-180 transition-transform duration-500" />
                        <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                      </div>
                      <h4 className="font-semibold text-gray-600 mb-2 text-sm uppercase tracking-wide">{snapshot.title}</h4>
                      <p className="text-3xl font-black text-gray-900">{snapshot.value || 'Not set'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

      {/* Latest Release Section - Hero Card */}
      {allowedSections.includes('latestRelease') && sectionVisibility.latestRelease && latestRelease && (
        <div className="relative overflow-hidden rounded-3xl shadow-xl p-8 sm:p-10 transition-all duration-500 hover:shadow-2xl border border-gray-200 group bg-gradient-to-br from-violet-50 to-purple-50">
          {/* Subtle Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-200/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200/30 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-slate-800 rounded-2xl shadow-lg">
                <Music className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Latest Release Performance
              </h3>
            </div>

            {/* Streams Display */}
            {(latestRelease.streams || latestRelease.value) && (
              <div className="mb-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
                <p className="text-gray-600 text-sm font-medium mb-2">Total Streams</p>
                <p className="text-5xl sm:text-6xl font-black text-gray-900 mb-2 tracking-tight">
                  {latestRelease.streams || latestRelease.value}
                </p>
                {latestRelease.change && (
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${latestRelease.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                      {latestRelease.change}
                    </span>
                    <span className="text-gray-500 text-sm">vs last period</span>
                  </div>
                )}
              </div>
            )}

            {/* Release Info */}
            <div className="flex items-start space-x-4">
              {latestRelease.coverArt && (
                <img 
                  src={latestRelease.coverArt} 
                  alt={latestRelease.title} 
                  className="w-24 h-24 rounded-xl shadow-lg object-cover border-2 border-gray-200"
                />
              )}
              <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">
                    {latestRelease.title}
                  </h4>
                  {latestRelease.artist && (
                    <p className="text-gray-700 mb-2">by {latestRelease.artist}</p>
                  )}
                  {latestRelease.featuring && (
                    <p className="text-gray-600 text-sm">feat. {latestRelease.featuring}</p>
                  )}
                  {latestRelease.releaseDate && (
                    <p className="text-gray-600 text-sm">Released: {new Date(latestRelease.releaseDate).toLocaleDateString()}</p>
                  )}
                  {latestRelease.releaseType && (
                    <span className="inline-block bg-violet-100 text-violet-700 text-xs px-3 py-1 rounded-full mt-2 border border-violet-200">
                      {latestRelease.releaseType}
                    </span>
                  )}
              </div>
            </div>

            {/* Platform Performance */}
            {latestRelease.platforms && latestRelease.platforms.length > 0 && (
              <div className="mt-6">
                <SimpleScrollIndicator>
                  <div className="flex space-x-4">
                    {latestRelease.platforms.map((platform, index) => (
                  <div key={index} className="flex-shrink-0 w-64 p-5 bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <h5 className="font-semibold text-gray-900 mb-2">{platform.name}</h5>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {platform.value || platform.streams || '0'}
                    </p>
                        {(platform.percentage || platform.change) && (
                          <p className={`text-sm font-medium ${
                            (platform.percentage || platform.change || '').startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {platform.percentage || platform.change}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </SimpleScrollIndicator>
              </div>
            )}
          </div>
        </div>
      )}

          {/* Top Markets - Horizontal Scroll Cards (MOVED ABOVE MILESTONES) */}
          {showAdvanced && allowedSections.includes('topMarkets') && sectionVisibility.topMarkets && advancedData?.topMarkets && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-slate-800 rounded-2xl shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Top Markets
                </h3>
              </div>
          
          <SimpleScrollIndicator>
            <div className="flex space-x-6 pb-4">
              {advancedData.topMarkets.map((market, index) => (
                <div key={index} 
                     className="flex-shrink-0 w-80 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      <h4 className="font-bold text-gray-900 text-xl">{market.title}</h4>
                    </div>
                    <Globe className="w-6 h-6 text-violet-600" />
                  </div>
                  <p className="text-3xl font-black text-gray-900">{market.value || 'Not set'}</p>
                </div>
              ))}
            </div>
          </SimpleScrollIndicator>
        </div>
      )}

      {/* Milestones Section - Timeline Style */}
      {allowedSections.includes('milestones') && sectionVisibility.milestones && milestones && milestones.length > 0 && (
        <div className="relative">
          {/* Decorative line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-600 rounded-full"></div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6 ml-4">
              <div className="p-3 bg-slate-800 rounded-2xl shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Recent Milestones
              </h3>
            </div>
            
            {milestones.map((milestone, index) => (
              <div key={index} className="relative ml-16 group">
                {/* Timeline dot */}
                <div className="absolute -left-[34px] top-6 w-4 h-4 bg-white border-4 border-slate-600 rounded-full group-hover:scale-150 transition-transform duration-300 z-10"></div>
                
                {/* Milestone card */}
                <div className="p-6 rounded-2xl shadow-lg border border-gray-200 hover:border-slate-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Sparkles className="w-5 h-5 text-gray-700" />
                      </div>
                      <h4 className="font-bold text-xl text-gray-900">{milestone.title}</h4>
                    </div>
                    {milestone.tag && (
                      <span className="bg-slate-800 text-white text-xs px-3 py-1 rounded-full font-medium shadow">
                        {milestone.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3 text-lg">{milestone.milestone}</p>
                  <p className="text-sm text-gray-600 font-medium">{milestone.relativeDate || milestone.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Analytics Sections */}
      {showAdvanced && advancedData && (
        <>
          {/* Audience Summary - Card Grid */}
          {allowedSections.includes('audienceSummary') && sectionVisibility.audienceSummary && advancedData.audienceSummary && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-slate-800 rounded-2xl shadow-lg">
                  <UsersIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Audience Summary
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {advancedData.audienceSummary.map((item, index) => (
                  <div key={index} 
                       className="relative p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group border border-gray-200 bg-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gray-100 rounded-xl">
                          <UsersIcon className="w-6 h-6 text-gray-700" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                      </div>
                      <p className="text-4xl font-black text-gray-900">
                        {item.value || 'Not set'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Tracks - Grid Cards (MOVED ABOVE TOP STATISTICS) */}
          {allowedSections.includes('topTracks') && sectionVisibility.topTracks && advancedData.topTracks && advancedData.topTracks.length > 0 && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-slate-800 rounded-2xl shadow-lg">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Top Tracks
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {advancedData.topTracks.map((track, index) => (
                  <div key={index} 
                       className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 bg-white group">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">#{index + 1}</span>
                      </div>
                      {track.artwork && (
                        <img 
                          src={track.artwork} 
                          alt={track.title} 
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200 shadow-sm"
                        />
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">{track.title || 'Untitled'}</h4>
                    {track.artist && (
                      <p className="text-gray-600 text-sm mb-3">by {track.artist}</p>
                    )}
                    <div className="space-y-2">
                      {track.streams && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm">Streams</span>
                          <span className="text-gray-900 font-bold">{track.streams}</span>
                        </div>
                      )}
                      {track.change && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm">Change</span>
                          <span className={`font-bold ${track.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                            {track.change}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Statistics - Staggered Cards */}
          {allowedSections.includes('topStatistics') && sectionVisibility.topStatistics && advancedData.topStatistics && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-slate-800 rounded-2xl shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Top Statistics
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {advancedData.topStatistics.map((stat, index) => (
                  <div key={index} 
                       className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-200 group bg-white"
                       style={{
                         transform: `translateY(${index % 2 === 0 ? '0' : '1rem'})`,
                       }}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-gray-100 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                        <BarChart3 className="w-5 h-5 text-gray-700" />
                      </div>
                      <h4 className="font-bold text-gray-900">{stat.title}</h4>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{stat.value || 'Not set'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artist Ranking - Podium Style */}
          {allowedSections.includes('artistRanking') && sectionVisibility.artistRanking && advancedData.artistRanking && (
            <div className="relative overflow-hidden rounded-3xl p-8 shadow-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-slate-100">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gray-200/30 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-slate-800 rounded-2xl shadow-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Artist Ranking
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {advancedData.artistRanking.map((ranking, index) => (
                    <div key={index} 
                         className="relative p-6 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-2 border border-gray-200 bg-white"
                         style={{
                           transform: `scale(${index === 0 ? 1.05 : 1})`
                         }}>
                      <div className="absolute -top-4 -right-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                          index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : 'bg-orange-600'
                        }`}>
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">{ranking.title}</h4>
                      <p className="text-4xl font-black text-gray-900">{ranking.value || 'Not set'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* All Releases - Grid Cards */}
          {allowedSections.includes('allReleases') && sectionVisibility.allReleases && advancedData.allReleases && advancedData.allReleases.length > 0 && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-slate-800 rounded-2xl shadow-lg">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  All Releases
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {advancedData.allReleases.map((release, index) => (
                  <div key={index} 
                       className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 bg-white overflow-hidden group">
                    {release.artwork && (
                      <div className="relative w-full aspect-square overflow-hidden">
                        <img 
                          src={release.artwork} 
                          alt={release.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h4 className="font-bold text-gray-900 text-lg mb-2">{release.title || 'Untitled'}</h4>
                      {release.artist && (
                        <p className="text-gray-600 text-sm mb-3">by {release.artist}</p>
                      )}
                      {release.releaseDate && (
                        <p className="text-gray-500 text-xs mb-3">
                          Released: {new Date(release.releaseDate).toLocaleDateString()}
                        </p>
                      )}
                      {release.type && (
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full border border-gray-200">
                          {release.type}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform Performance - Wide Cards (MOVED TO BOTTOM) */}
          {allowedSections.includes('platformPerformance') && sectionVisibility.platformPerformance && advancedData.platformPerformance && advancedData.platformPerformance.length > 0 && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-slate-800 rounded-2xl shadow-lg">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Platform Performance
                </h3>
              </div>
              
              <div className="space-y-4">
                {advancedData.platformPerformance.map((platform, index) => (
                  <div key={index} 
                       className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-8 border-violet-500 hover:border-violet-700 group bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gray-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                          <Music className="w-6 h-6 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-xl mb-1">{platform.platformTitle || 'Not set'}</h4>
                          <p className="text-gray-600 text-sm mb-2">{platform.metadataTitle || 'Not set'}</p>
                          <div className="flex items-center space-x-3">
                            <p className="text-3xl font-black text-gray-900">{platform.metadataStat || 'Not set'}</p>
                            {platform.tag && (
                              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                                platform.tag.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 
                                platform.tag.startsWith('-') ? 'bg-red-100 text-red-700' : 
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {platform.tag}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">#{index + 1}</span>
                        </div>
                      </div>
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
