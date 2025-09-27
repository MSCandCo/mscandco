// Clean Manual Analytics Display Component - WORKING VERSION
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, 
  Award, 
  Music, 
  BarChart3
} from 'lucide-react';
import SimpleScrollIndicator from '../shared/SimpleScrollIndicator';

export default function CleanManualDisplay({ artistId, showAdvanced = false }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch manual analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!artistId) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching manual analytics for artist:', artistId);

        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          console.error('No auth token');
          setError('Authentication required');
          setLoading(false);
          return;
        }

        // Call analytics data API
        const response = await fetch('/api/artist/analytics-data', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        if (response.ok && result.data) {
          console.log('Data received:', result.data);
          console.log('Has latestRelease?', !!result.data?.latestRelease);
          console.log('Has milestones?', result.data?.milestones?.length);
          console.log('SectionVisibility:', result.data?.sectionVisibility);
          console.log('AdvancedData keys:', result.data?.advancedData ? Object.keys(result.data.advancedData) : 'none');
          
          setAnalyticsData(result.data);
        } else {
          console.log('No analytics data found:', result);
          setAnalyticsData(null);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [artistId]);

  // Loading state
  if (loading) {
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

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
        <div className="text-red-600 mb-4">
          <BarChart3 className="w-12 h-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Error Loading Analytics</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state - only show if NO data exists at all (completely empty object or null)
  if (!analyticsData || (analyticsData && Object.keys(analyticsData).length === 0)) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{color: '#1f2937'}}>No Analytics Data</h2>
          <p className="mb-8" style={{color: '#64748b'}}>
            Your analytics data will appear here once your admin team adds your release and performance information.
          </p>
          <div className="text-sm" style={{color: '#9ca3af'}}>
            Contact your admin team to set up your analytics dashboard.
          </div>
        </div>
      </div>
    );
  }

  const { latestRelease, milestones = [], sectionVisibility = {}, advancedData } = analyticsData;

  // Define which sections to show based on showAdvanced prop
  const basicSections = ['latestRelease', 'milestones'];
  const advancedSections = [
    'latestRelease', 'milestones', 'artistRanking', 'careerSnapshot', 
    'audienceSummary', 'topMarkets', 'topStatistics', 'platformPerformance'
  ];
  
  const allowedSections = showAdvanced ? advancedSections : basicSections;

  return (
    <div className="space-y-8">
      
      {/* Latest Release Performance */}
      {allowedSections.includes('latestRelease') && sectionVisibility.latestRelease && latestRelease && (
        <div className="rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)', border: '1px solid rgba(31, 41, 55, 0.08)'}}>
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center" style={{color: '#1f2937'}}>
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 mr-2 sm:mr-3" />
            Latest Release Performance
          </h3>
          
          {/* Release Header */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
            <div className="flex items-center space-x-6">
              {/* Cover Image */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {(latestRelease.coverImageUrl || latestRelease.artworkUrl) ? (
                  <img 
                    src={latestRelease.coverImageUrl || latestRelease.artworkUrl} 
                    alt={`${latestRelease.title} cover`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music className="w-12 h-12 text-white" />
                )}
              </div>
              
              {/* Release Info */}
              <div className="flex-1">
                <h4 className="text-xl font-bold text-slate-900 mb-1">
                  {latestRelease.title}
                </h4>
                {latestRelease.artist && (
                  <p className="text-slate-600 mb-2">by {latestRelease.artist}</p>
                )}
                {latestRelease.featuring && (
                  <p className="text-slate-500 text-sm">feat. {latestRelease.featuring}</p>
                )}
                {latestRelease.releaseDate && (
                  <p className="text-slate-500 text-sm">Released: {new Date(latestRelease.releaseDate).toLocaleDateString()}</p>
                )}
                {latestRelease.releaseType && (
                  <span className="inline-block bg-purple-100 text-slate-900 text-xs px-2 py-1 rounded-full mt-2">
                    {latestRelease.releaseType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Platform Performance */}
          {latestRelease.platforms && latestRelease.platforms.length > 0 && (
            <SimpleScrollIndicator>
              <div className="flex space-x-4">
                {latestRelease.platforms.map((platform, index) => (
                  <div key={index} className="flex-shrink-0 w-64 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h5 className="font-semibold text-slate-900 mb-2">{platform.name}</h5>
                    <p className="text-2xl font-bold text-slate-900 mb-1">
                      {platform.value || platform.streams || '0'}
                    </p>
                    {(platform.percentage || platform.change) && (
                      <p className={`text-sm ${
                        (platform.percentage || platform.change || '').startsWith('+') ? 'text-slate-900' : 'text-red-600'
                      }`}>
                        {platform.percentage || platform.change}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </SimpleScrollIndicator>
          )}
        </div>
      )}

      {/* Milestones Section */}
      {allowedSections.includes('milestones') && sectionVisibility.milestones && milestones && milestones.length > 0 && (
        <div className="rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)', border: '1px solid rgba(31, 41, 55, 0.08)'}}>
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center" style={{color: '#1f2937'}}>
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 mr-2 sm:mr-3" />
            Recent Milestones
          </h3>
          
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-purple-100">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-800 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{milestone.title}</h4>
                    {milestone.tag && (
                      <span className="bg-purple-800 text-white text-xs px-2 py-1 rounded-full">
                        {milestone.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 mb-2">{milestone.milestone}</p>
                  <p className="text-sm text-slate-500">{milestone.relativeDate || milestone.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Analytics Sections */}
      {showAdvanced && advancedData && (
        <>
          {/* Career Snapshot */}
          {allowedSections.includes('careerSnapshot') && sectionVisibility.careerSnapshot && advancedData.careerSnapshot && (
            <div className="rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)', border: '1px solid rgba(31, 41, 55, 0.08)'}}>
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center" style={{color: '#1f2937'}}>
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 mr-2 sm:mr-3" />
                Career Snapshot
              </h3>
              
              <SimpleScrollIndicator>
                <div className="flex space-x-4">
                  {advancedData.careerSnapshot.map((snapshot, index) => (
                    <div key={index} className="flex-shrink-0 w-64 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <h4 className="font-semibold text-slate-900 mb-2">{snapshot.title}</h4>
                      <p className="text-lg font-bold text-slate-900">{snapshot.value || 'Not set'}</p>
                    </div>
                  ))}
                </div>
              </SimpleScrollIndicator>
            </div>
          )}
        </>
      )}

    </div>
  );
}