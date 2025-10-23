'use client'

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Play, 
  Music, 
  Globe,
  BarChart3,
  Activity,
  Award,
  Target,
  Headphones,
  Crown
} from 'lucide-react';

// Helper function to get country flags
const getCountryFlag = (countryName) => {
  const flagMap = {
    'Nigeria': '🇳🇬', 'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'Ghana': '🇬🇭',
    'South Africa': '🇿🇦', 'Brazil': '🇧🇷', 'Canada': '🇨🇦', 'Germany': '🇩🇪',
    'France': '🇫🇷', 'Australia': '🇦🇺', 'Kenya': '🇰🇪', 'Uganda': '🇺🇬',
    'Tanzania': '🇹🇿', 'Rwanda': '🇷🇼', 'Cameroon': '🇨🇲'
  };
  return flagMap[countryName] || '🌍';
};

// Career Stage Component
const CareerStage = ({ title, currentStage, stages }) => {
  const currentIndex = stages.indexOf(currentStage);
  
  return (
    <div className="text-center min-w-[180px] flex-shrink-0 flex-1 max-w-xs">
      <h4 className="text-sm font-semibold text-slate-900 mb-4">{title}</h4>
      <div className="relative">
        <div className="space-y-1">
          {stages.map((stage, index) => (
            <div 
              key={index}
              className={`text-xs font-medium transition-all text-center whitespace-nowrap ${
                index === currentIndex 
                  ? 'text-blue-600 font-bold flex items-center justify-center gap-1' 
                  : 'text-slate-400'
              }`}
            >
              {index === currentIndex ? (
                <>
                  <span className="text-sm" style={{ color: 'inherit', margin: '0' }}>→</span>
                  <span>{stage}</span>
                  <span className="text-sm" style={{ color: 'inherit', margin: '0' }}>←</span>
                </>
              ) : (
                stage
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function CleanAnalyticsDisplay({ data, loading, linkedArtist, onRefresh }) {
  const [selectedRange, setSelectedRange] = useState('30D');
  
  // Manual analytics data state
  const [latestRelease, setLatestRelease] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Process manual analytics data
  useEffect(() => {
    if (data) {
      setLatestRelease(data.latestRelease);
      setMilestones(data.milestones || []);
      setDataLoading(false);
    } else {
      setDataLoading(false);
    }
  }, [data]);

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

  // If no data exists, show empty state
  if (!latestRelease && (!milestones || milestones.length === 0)) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No Analytics Data</h2>
          <p className="text-slate-600 mb-8">
            Your analytics data will appear here once your admin team adds your release and performance information.
          </p>
          <div className="text-sm text-slate-500">
            Contact your admin team to set up your analytics dashboard.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Latest Release Performance - Only show if data exists */}
      {latestRelease && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
            Latest Release Performance
          </h3>
          
          {/* Latest Release Header */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{latestRelease.title || 'Latest Release'}</h4>
                <p className="text-slate-600">Released: {latestRelease.releaseDate ? new Date(latestRelease.releaseDate).toLocaleDateString() : 'Recent'}</p>
                <p className="text-sm text-slate-500">{latestRelease.releaseType || 'Single'} • Cross-platform performance</p>
              </div>
            </div>
          </div>

          {/* Platform Performance - Only show if platforms exist */}
          {latestRelease.platforms && latestRelease.platforms.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {latestRelease.platforms
                .filter(platform => platform.name && (platform.streams || platform.change))
                .map((platform, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-xl text-center">
                    <h4 className="font-semibold text-slate-900 mb-1">{platform.name}</h4>
                    <p className="text-xl font-bold text-slate-900">{platform.streams || '—'}</p>
                    <p className="text-xs font-medium text-green-600">{platform.change || '—'}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Milestones - Only show if milestones exist */}
      {milestones && milestones.length > 0 && milestones.some(m => m.title || m.tag || m.milestone) && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center">
              <Award className="w-6 h-6 text-yellow-600 mr-3" />
              Recent Milestones
            </h3>
          </div>
          <div className="space-y-4">
            {milestones
              .filter(milestone => milestone.title || milestone.tag || milestone.milestone)
              .map((milestone, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{milestone.title || 'Milestone'}</h4>
                      {milestone.tag && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {milestone.tag}
                        </span>
                      )}
                    </div>
                    {milestone.milestone && (
                      <p className="text-gray-600 text-sm">{milestone.milestone}</p>
                    )}
                    {milestone.date && (
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(milestone.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Empty State for Advanced Analytics */}
      {(!latestRelease && (!milestones || milestones.length === 0)) && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Analytics Data Coming Soon</h2>
            <p className="text-slate-600 mb-8">
              Your comprehensive analytics will appear here once your admin team inputs your performance data.
            </p>
            <div className="text-sm text-slate-500">
              This includes platform breakdowns, career snapshots, audience demographics, and detailed insights.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
