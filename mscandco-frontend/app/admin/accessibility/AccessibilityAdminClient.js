'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import {
  Accessibility, Globe, Users, FileText, CheckCircle, AlertCircle, Clock,
  Search, Filter, RefreshCw, Eye, XCircle, Video, Languages, Award,
  TrendingUp, Shield, Zap, Ban, PlayCircle, Download
} from 'lucide-react';

export default function AccessibilityAdminClient({ user }) {
  const router = useRouter();
  const supabase = createClient();

  // State
  const [activeTab, setActiveTab] = useState('content');
  const [content, setContent] = useState([]);
  const [requests, setRequests] = useState([]);
  const [interpreters, setInterpreters] = useState([]);
  const [compliance, setCompliance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalContent: 0,
    languages: 0,
    avgCompliance: 0,
    pendingRequests: 0,
    activeInterpreters: 0,
    totalRequests: 0,
    completedRequests: 0,
    compliantReleases: 0
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');

  // Fetch all data
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, activeTab]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data from API route (single source of truth)
      const response = await fetch('/api/admin/accessibility/data', {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch accessibility data');
      }

      const { content, requests, interpreters, compliance } = result.data;

      // Set all data
      setContent(content || []);
      setRequests(requests || []);
      setInterpreters(interpreters || []);
      setCompliance(compliance || []);

      // Calculate stats
      await fetchStats(content || [], requests || [], interpreters || [], compliance || []);
    } catch (error) {
      console.error('Error fetching accessibility data:', error);
      // Set empty arrays on error
      setContent([]);
      setRequests([]);
      setInterpreters([]);
      setCompliance([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (contentData, requestsData, interpretersData, complianceData) => {
    try {
      // Calculate stats from fetched data (no database queries needed)
      const contentCount = contentData.length;

      // Unique languages from content
      const languages = new Set(contentData.map(c => c.language_code).filter(Boolean));

      // Compliance average - calculate from complianceData
      const wcagLevels = { 'A': 1, 'AA': 2, 'AAA': 3, 'non_compliant': 0 };
      const avgCompliance = complianceData && complianceData.length > 0
        ? Math.round(
            (complianceData.reduce((acc, c) => acc + (wcagLevels[c.wcag_level] || 0), 0) / complianceData.length) * 33.33
          )
        : 0;

      // Requests stats
      const pendingRequests = requestsData.filter(r => r.status === 'pending').length;
      const totalRequests = requestsData.length;
      const completedRequests = requestsData.filter(r => r.status === 'completed').length;

      // Interpreters stats
      const activeInterpreters = interpretersData.filter(i => i.is_active !== false || i.available_for_booking === true).length;

      // Compliance stats
      const compliantReleases = complianceData.filter(c => c.wcag_level === 'AAA').length;

      setStats({
        totalContent: contentCount || 0,
        languages: languages?.length || 0,
        avgCompliance,
        pendingRequests: pendingRequests || 0,
        activeInterpreters: activeInterpreters || 0,
        totalRequests: totalRequests || 0,
        completedRequests: completedRequests || 0,
        compliantReleases: compliantReleases || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateRequestStatus = async (requestId, newStatus, notes = '') => {
    try {
      const response = await fetch('/api/admin/accessibility/update-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ requestId, newStatus, notes })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update request');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update request');
      }

      // Refresh data after update
      await fetchAllData();
    } catch (error) {
      console.error('Error updating request status:', error);
      alert('Failed to update request status');
    }
  };

  const getFilteredContent = () => {
    return content.filter(item => {
      const matchesSearch = !searchTerm ||
        item.releases?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.releases?.artist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user_profiles?.artist_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || item.content_type === typeFilter;
      const matchesLanguage = languageFilter === 'all' || item.language_code === languageFilter;
      return matchesSearch && matchesType && matchesLanguage;
    });
  };

  const getFilteredRequests = () => {
    return requests.filter(req => {
      const matchesSearch = !searchTerm ||
        req.releases?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.releases?.artist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.user_profiles?.artist_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchesType = typeFilter === 'all' || req.request_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const getFilteredInterpreters = () => {
    return interpreters.filter(interpreter => {
      const matchesSearch = !searchTerm ||
        interpreter.interpreter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interpreter.user_profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = languageFilter === 'all' || 
        interpreter.languages?.includes(languageFilter);
      return matchesSearch && matchesLanguage;
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: 'Pending', classes: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      in_progress: { icon: Zap, text: 'In Progress', classes: 'bg-blue-100 text-blue-800 border-blue-300' },
      completed: { icon: CheckCircle, text: 'Completed', classes: 'bg-green-100 text-green-800 border-green-300' },
      rejected: { icon: XCircle, text: 'Rejected', classes: 'bg-red-100 text-red-800 border-red-300' },
      cancelled: { icon: Ban, text: 'Cancelled', classes: 'bg-gray-100 text-gray-800 border-gray-300' }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.classes}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const getContentTypeBadge = (type) => {
    const types = {
      audio_description: { text: 'Audio Description', color: 'bg-purple-100 text-purple-800' },
      lyric_transcription: { text: 'Transcription', color: 'bg-blue-100 text-blue-800' },
      lyric_translation: { text: 'Translation', color: 'bg-green-100 text-green-800' },
      sign_language_video: { text: 'Sign Language', color: 'bg-pink-100 text-pink-800' },
      instrumental_description: { text: 'Instrumental', color: 'bg-indigo-100 text-indigo-800' },
      mood_description: { text: 'Mood', color: 'bg-yellow-100 text-yellow-800' },
      genre_explanation: { text: 'Genre', color: 'bg-orange-100 text-orange-800' }
    };
    const typeInfo = types[type] || { text: type, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.text}
      </span>
    );
  };

  if (loading) {
    return <PageLoading message="Loading accessibility management..." />;
  }

  const statsCards = [
    {
      title: 'Total Content',
      value: stats.totalContent,
      icon: FileText,
      color: 'bg-blue-500',
      tab: 'content'
    },
    {
      title: 'Languages',
      value: stats.languages,
      icon: Globe,
      color: 'bg-purple-500',
      tab: 'content'
    },
    {
      title: 'WCAG Compliance',
      value: `${stats.avgCompliance}%`,
      icon: Shield,
      color: 'bg-green-500',
      tab: 'compliance'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'bg-yellow-500',
      tab: 'requests'
    },
    {
      title: 'Active Interpreters',
      value: stats.activeInterpreters,
      icon: Users,
      color: 'bg-pink-500',
      tab: 'interpreters'
    },
    {
      title: 'Total Requests',
      value: stats.totalRequests,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      tab: 'requests'
    },
    {
      title: 'Completed',
      value: stats.completedRequests,
      icon: CheckCircle,
      color: 'bg-green-600',
      tab: 'requests'
    },
    {
      title: 'AAA Compliant',
      value: stats.compliantReleases,
      icon: Award,
      color: 'bg-emerald-500',
      tab: 'compliance'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Accessibility className="w-8 h-8" />
                Accessibility Administration
              </h1>
              <p className="mt-2 text-gray-600 max-w-3xl">
                Monitor and manage accessibility content, requests, interpreters, and WCAG compliance across the platform
              </p>
            </div>
            <button
              onClick={fetchAllData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8 gap-4 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  setActiveTab(stat.tab);
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setLanguageFilter('all');
                }}
                className={`bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left ${
                  activeTab === stat.tab ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 truncate">{stat.title}</p>
                    <p className="text-xl 2xl:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-2 rounded-lg flex-shrink-0`}>
                    <Icon className="w-4 h-4 2xl:w-5 2xl:h-5 text-white" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'content', label: 'Content', count: content.length },
                { id: 'requests', label: 'Requests', count: requests.length },
                { id: 'interpreters', label: 'Interpreters', count: interpreters.length },
                { id: 'compliance', label: 'Compliance', count: compliance.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setLanguageFilter('all');
                  }}
                  className={`px-4 sm:px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by release, artist, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            {(activeTab === 'content' || activeTab === 'requests') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {activeTab === 'content' && (
                    <>
                      <option value="audio_description">Audio Description</option>
                      <option value="lyric_transcription">Transcription</option>
                      <option value="lyric_translation">Translation</option>
                      <option value="sign_language_video">Sign Language</option>
                      <option value="instrumental_description">Instrumental</option>
                      <option value="mood_description">Mood</option>
                      <option value="genre_explanation">Genre</option>
                    </>
                  )}
                  {activeTab === 'requests' && (
                    <>
                      <option value="audio_description">Audio Description</option>
                      <option value="lyric_translation">Translation</option>
                      <option value="sign_language_video">Sign Language</option>
                      <option value="braille_notation">Braille</option>
                      <option value="simplified_version">Simplified</option>
                      <option value="descriptive_audio">Descriptive Audio</option>
                    </>
                  )}
                </select>
              </div>
            )}
            {(activeTab === 'content' || activeTab === 'interpreters') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Languages</option>
                  {activeTab === 'content' && content.length > 0 && (() => {
                    const languages = [...new Set(content.map(c => c.language_code).filter(Boolean))];
                    if (languages.length === 0) {
                      return <option disabled>No languages available</option>;
                    }
                    return languages.sort().map(lang => (
                      <option key={lang} value={lang}>
                        {lang.toUpperCase()} {lang === 'en' ? '(English)' : lang === 'es' ? '(Spanish)' : lang === 'fr' ? '(French)' : ''}
                      </option>
                    ));
                  })()}
                  {activeTab === 'interpreters' && interpreters.length > 0 && (() => {
                    const allLanguages = new Set();
                    interpreters.forEach(interpreter => {
                      if (interpreter.languages && Array.isArray(interpreter.languages)) {
                        interpreter.languages.forEach(lang => allLanguages.add(lang));
                      }
                    });
                    const languageArray = Array.from(allLanguages).sort();
                    if (languageArray.length === 0) {
                      return <option disabled>No languages available</option>;
                    }
                    return languageArray.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ));
                  })()}
                  {(activeTab === 'content' && content.length === 0) || 
                   (activeTab === 'interpreters' && interpreters.length === 0) ? (
                    <option disabled>Loading languages...</option>
                  ) : null}
                </select>
              </div>
            )}
            {activeTab === 'requests' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'content' && (
          <ContentTable
            content={getFilteredContent()}
            getContentTypeBadge={getContentTypeBadge}
            router={router}
          />
        )}

        {activeTab === 'requests' && (
          <RequestsTable
            requests={getFilteredRequests()}
            onUpdateStatus={updateRequestStatus}
            getStatusBadge={getStatusBadge}
            getContentTypeBadge={getContentTypeBadge}
            router={router}
          />
        )}

        {activeTab === 'interpreters' && (
          <InterpretersTable
            interpreters={getFilteredInterpreters()}
            router={router}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceTable
            compliance={compliance.filter(c => {
              const matchesSearch = !searchTerm ||
                c.releases?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.releases?.artist_name?.toLowerCase().includes(searchTerm.toLowerCase());
              return matchesSearch;
            })}
            router={router}
          />
        )}
      </div>
    </div>
  );
}

// Content Table Component
function ContentTable({ content, getContentTypeBadge, router }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 xl:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Accessibility Content</h2>
        <span className="text-sm text-gray-500">{content.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Release</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Type</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Language</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Method</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Quality</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Verified</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Date</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {content.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                  No content found
                </td>
              </tr>
            ) : (
              content.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 xl:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.releases?.title || 'Unknown Release'}
                    </div>
                    <div className="text-xs text-gray-500">{item.releases?.artist_name}</div>
                  </td>
                  <td className="px-4 xl:px-6 py-4">
                    {getContentTypeBadge(item.content_type)}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{item.language_code?.toUpperCase()}</span>
                  </td>
                  <td className="px-4 xl:px-6 py-4">
                    <span className="text-sm text-gray-900 capitalize">{item.generation_method?.replace('_', ' ') || 'N/A'}</span>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    {item.quality_rating ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-900">{item.quality_rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    {item.is_verified ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => router.push(`/admin/accessibility/content/${item.id}`)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      {item.video_url && (
                        <a
                          href={item.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-900 flex items-center gap-1 whitespace-nowrap"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Play
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Requests Table Component
function RequestsTable({ requests, onUpdateStatus, getStatusBadge, getContentTypeBadge, router }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionNotes, setActionNotes] = useState('');

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 xl:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Accessibility Requests</h2>
          <span className="text-sm text-gray-500">{requests.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Release</th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Request Type</th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Requester</th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Priority</th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Status</th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Deadline</th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Date</th>
                <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 xl:px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.releases?.title || 'Unknown Release'}
                      </div>
                      <div className="text-xs text-gray-500">{request.releases?.artist_name}</div>
                    </td>
                    <td className="px-4 xl:px-6 py-4">
                      {getContentTypeBadge(request.request_type)}
                    </td>
                    <td className="px-4 xl:px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.user_profiles?.artist_name || request.user_profiles?.email || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.priority || 'low'}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.requested_deadline ? new Date(request.requested_deadline).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => router.push(`/admin/accessibility/request/${request.id}`)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 whitespace-nowrap"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRequest({ id: request.id, action: 'in_progress' });
                                setActionNotes('');
                              }}
                              className="text-green-600 hover:text-green-900 whitespace-nowrap"
                            >
                              Start
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest({ id: request.id, action: 'rejected' });
                                setActionNotes('');
                              }}
                              className="text-red-600 hover:text-red-900 whitespace-nowrap"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {request.status === 'in_progress' && (
                          <button
                            onClick={() => {
                              setSelectedRequest({ id: request.id, action: 'completed' });
                              setActionNotes('');
                            }}
                            className="text-green-600 hover:text-green-900 whitespace-nowrap"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedRequest.action === 'completed' ? 'Complete Request' :
               selectedRequest.action === 'in_progress' ? 'Start Request' :
               'Reject Request'}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Add any notes about this action..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onUpdateStatus(selectedRequest.id, selectedRequest.action, actionNotes);
                  setSelectedRequest(null);
                  setActionNotes('');
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-white ${
                  selectedRequest.action === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setActionNotes('');
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Interpreters Table Component
function InterpretersTable({ interpreters, router }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 xl:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Sign Language Interpreters</h2>
        <span className="text-sm text-gray-500">{interpreters.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Name</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Languages</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Experience</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Rate</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Rating</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Projects</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Available</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {interpreters.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                  No interpreters found
                </td>
              </tr>
            ) : (
              interpreters.map((interpreter) => (
                <tr key={interpreter.id} className="hover:bg-gray-50">
                  <td className="px-4 xl:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {interpreter.interpreter_name}
                    </div>
                    <div className="text-xs text-gray-500">{interpreter.user_profiles?.email}</div>
                  </td>
                  <td className="px-4 xl:px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {interpreter.languages?.slice(0, 3).map((lang, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {lang}
                        </span>
                      ))}
                      {interpreter.languages?.length > 3 && (
                        <span className="text-xs text-gray-500">+{interpreter.languages.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{interpreter.experience_years || 0} years</span>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {interpreter.hourly_rate ? `£${interpreter.hourly_rate}/hr` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    {interpreter.average_rating ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-900">{interpreter.average_rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{interpreter.completed_projects || 0}</span>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    {interpreter.available_for_booking ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/admin/accessibility/interpreter/${interpreter.id}`)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Compliance Table Component
function ComplianceTable({ compliance, router }) {
  const getWCAGBadge = (level) => {
    const badges = {
      'AAA': { text: 'AAA', classes: 'bg-green-100 text-green-800 border-green-300' },
      'AA': { text: 'AA', classes: 'bg-blue-100 text-blue-800 border-blue-300' },
      'A': { text: 'A', classes: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      'non_compliant': { text: 'Non-Compliant', classes: 'bg-red-100 text-red-800 border-red-300' }
    };
    const badge = badges[level] || badges.non_compliant;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badge.classes}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 xl:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">WCAG Compliance</h2>
        <span className="text-sm text-gray-500">{compliance.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Release</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">WCAG Level</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Transcripts</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Captions</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Audio Desc</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Languages</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Certified</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Last Audit</th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {compliance.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                  No compliance data found
                </td>
              </tr>
            ) : (
              compliance.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 xl:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.releases?.title || 'Unknown Release'}
                    </div>
                    <div className="text-xs text-gray-500">{item.releases?.artist_name}</div>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    {getWCAGBadge(item.wcag_level)}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    {item.has_transcripts ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    {item.has_captions ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    {item.has_audio_descriptions ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-4 xl:px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.languages_available?.slice(0, 3).map((lang, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {lang.toUpperCase()}
                        </span>
                      ))}
                      {item.languages_available?.length > 3 && (
                        <span className="text-xs text-gray-500">+{item.languages_available.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                    {item.certified ? (
                      <Award className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <span className="text-sm text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.last_audit_date ? new Date(item.last_audit_date).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/admin/accessibility/compliance/${item.id}`)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
