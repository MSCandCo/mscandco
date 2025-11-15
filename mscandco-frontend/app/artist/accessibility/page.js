'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/providers/SupabaseProvider';
import { PageLoading } from '@/components/ui/LoadingSpinner';

export default function AccessibilityPage() {
  const { user } = useUser();
  const supabase = createClient();

  const [releases, setReleases] = useState([]);
  const [accessibilityContent, setAccessibilityContent] = useState([]);
  const [compliance, setCompliance] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    if (!user) return;
    
    try {

      // Load releases
      const { data: releasesData } = await supabase
        .from('releases')
        .select('*')
        .eq('user_id', user.id)
        .order('release_date', { ascending: false });

      setReleases(releasesData || []);

      // Load accessibility content
      const { data: contentData } = await supabase
        .from('accessibility_content')
        .select('*, releases(title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setAccessibilityContent(contentData || []);

      // Load compliance summary
      const { data: complianceData } = await supabase
        .from('accessibility_compliance')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setCompliance(complianceData);

      // Load user preferences
      const { data: prefsData } = await supabase
        .from('accessibility_user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setPreferences(prefsData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading accessibility data:', error);
      setLoading(false);
    }
  }

  async function generateContent() {
    if (!selectedRelease) {
      alert('Please select a release');
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch('/api/grant-features/accessibility/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          release_id: selectedRelease.id,
          content_types: ['audio_description', 'lyric_transcription'],
          languages: ['en', 'es', 'fr', 'de'],
        }),
      });

      const result = await response.json();

      if (result.success) {
        await loadData();
        setSelectedRelease(null);
      } else {
        alert('Generation failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  }

  const contentTypeLabels = {
    audio_description: '🎧 Audio Description',
    lyric_transcription: '📝 Lyric Transcription',
    lyric_translation: '🌍 Translation',
    sign_language_video: '👋 Sign Language',
    instrumental_description: '🎹 Instrumental Description',
    mood_description: '😊 Mood Description',
  };

  if (loading || !user) {
    return <PageLoading message="Loading accessibility data..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Accessibility Center
        </h1>
        <p className="mt-2 text-gray-600">
          Make your music accessible to everyone in 94 languages
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Total Content</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {accessibilityContent.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Accessibility items</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Languages</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {new Set(accessibilityContent.map(c => c.language_code)).size}
          </p>
          <p className="text-xs text-gray-500 mt-1">Supported</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">WCAG Score</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {compliance?.overall_score || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Level {compliance?.wcag_level || 'AA'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Reach</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">1.5M+</p>
          <p className="text-xs text-gray-500 mt-1">People with disabilities</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Content Generation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Generate Content Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Generate AI Content</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Release
                </label>
                <select
                  value={selectedRelease?.id || ''}
                  onChange={(e) => {
                    const release = releases.find(r => r.id === e.target.value);
                    setSelectedRelease(release);
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="">Choose a release...</option>
                  {releases.map((release) => (
                    <option key={release.id} value={release.id}>
                      {release.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={generateContent}
                disabled={!selectedRelease || generating}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating AI Content...
                  </>
                ) : (
                  'Generate Accessibility Content'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                AI-powered generation in 94 languages using OpenAI GPT-4 + Whisper
              </p>
            </div>
          </div>

          {/* Existing Content */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Content</h2>

            {accessibilityContent.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No content yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Generate accessibility content to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {accessibilityContent.map((content) => (
                  <div
                    key={content.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {contentTypeLabels[content.content_type] || content.content_type}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {content.language_code.toUpperCase()}
                          </span>
                          {content.is_verified && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {content.releases?.title || 'Unknown Release'}
                        </p>
                        {content.text_content && (
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                            {content.text_content}
                          </p>
                        )}
                        {content.generation_method && (
                          <p className="text-xs text-gray-500 mt-2">
                            Generated: {content.generation_method.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                      <button className="ml-4 text-purple-600 hover:text-purple-700">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Info & Tools */}
        <div className="space-y-6">
          {/* WCAG Compliance */}
          {compliance && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">WCAG Compliance</h3>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Level A</span>
                    <span className="font-medium">{compliance.level_a_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${compliance.level_a_score}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Level AA</span>
                    <span className="font-medium">{compliance.level_aa_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${compliance.level_aa_score}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Level AAA</span>
                    <span className="font-medium">{compliance.level_aaa_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${compliance.level_aaa_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              What We Provide
            </h3>
            <ul className="space-y-2 text-sm text-purple-700">
              <li className="flex items-start">
                <span className="mr-2">🎧</span>
                <span>AI audio descriptions (GPT-4)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📝</span>
                <span>Automated lyric transcription</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🌍</span>
                <span>Translation in 94 languages</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">👋</span>
                <span>Sign language video integration</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <span>WCAG 2.1 compliance checking</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎹</span>
                <span>Instrumental descriptions</span>
              </li>
            </ul>
          </div>

          {/* Supported Languages */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Supported Languages</h3>
            <p className="text-sm text-gray-600 mb-4">94 languages including:</p>
            <div className="flex flex-wrap gap-2">
              {['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'].map(
                (lang) => (
                  <span
                    key={lang}
                    className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800"
                  >
                    {lang.toUpperCase()}
                  </span>
                )
              )}
              <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                +82 more
              </span>
            </div>
          </div>

          {/* Professional Services */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Need Professional Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect with certified sign language interpreters and accessibility experts
            </p>
            <button className="w-full px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition">
              Browse Professionals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
