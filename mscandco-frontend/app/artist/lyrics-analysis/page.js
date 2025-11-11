'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LyricsAnalysisPage() {
  const router = useRouter();
  const [lyrics, setLyrics] = useState('');
  const [trackName, setTrackName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const analyzeLyrics = async () => {
    if (!lyrics.trim()) {
      setError('Please enter lyrics to analyze');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/features/lyrics/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lyrics_text: lyrics,
          track_name: trackName || 'Untitled Track',
          language: 'en',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    const colors = {
      positive: 'text-green-600 bg-green-50',
      negative: 'text-red-600 bg-red-50',
      neutral: 'text-gray-600 bg-gray-50',
      mixed: 'text-blue-600 bg-blue-50',
    };
    return colors[sentiment] || colors.neutral;
  };

  const getComplexityColor = (complexity) => {
    const colors = {
      very_easy: 'text-green-600 bg-green-50',
      easy: 'text-blue-600 bg-blue-50',
      moderate: 'text-yellow-600 bg-yellow-50',
      difficult: 'text-red-600 bg-red-50',
    };
    return colors[complexity] || colors.moderate;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ✨ Lyrics Analysis AI
        </h1>
        <p className="text-gray-600">
          Get AI-powered insights on sentiment, themes, readability, and receive suggestions to improve your lyrics.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Enter Your Lyrics</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Track Name (Optional)
              </label>
              <input
                type="text"
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                placeholder="My Awesome Song"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lyrics
              </label>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Paste your lyrics here...

Verse 1:
[Your lyrics]

Chorus:
[Your lyrics]

..."
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="mt-2 text-sm text-gray-500">
                {lyrics.split(/\s+/).filter(w => w.length > 0).length} words
              </p>
            </div>

            <button
              onClick={analyzeLyrics}
              disabled={analyzing || !lyrics.trim()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {analyzing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing with AI...
                </span>
              ) : (
                'Analyze Lyrics'
              )}
            </button>

            {results?.usage && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Usage: {results.usage.current} / {results.usage.limit === 'unlimited' ? '∞' : results.usage.limit} this month
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div>
          {results && (
            <div className="space-y-6">
              {/* Sentiment Analysis */}
              {results.analyses?.find(a => a.type === 'sentiment') && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">😊</span> Sentiment Analysis
                  </h3>
                  {(() => {
                    const sentiment = results.analyses.find(a => a.type === 'sentiment').data;
                    return (
                      <div>
                        <div className="mb-4">
                          <span className={`inline-block px-3 py-1 rounded-full font-medium ${getSentimentColor(sentiment.overall_sentiment)}`}>
                            {sentiment.overall_sentiment?.toUpperCase()}
                          </span>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Primary Emotion</p>
                          <p className="text-lg capitalize">{sentiment.primary_emotion}</p>
                        </div>
                        {sentiment.secondary_emotions && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700">Secondary Emotions</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {sentiment.secondary_emotions.map((emotion, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm capitalize">
                                  {emotion}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-700">Emotional Intensity</p>
                          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${sentiment.intensity}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{sentiment.intensity}/100</p>
                        </div>
                        {sentiment.explanation && (
                          <p className="mt-3 text-sm text-gray-600 italic">{sentiment.explanation}</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Theme Analysis */}
              {results.analyses?.find(a => a.type === 'themes') && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">🎭</span> Themes & Topics
                  </h3>
                  {(() => {
                    const themes = results.analyses.find(a => a.type === 'themes').data;
                    return (
                      <div>
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Main Topic</p>
                          <p className="text-lg font-semibold capitalize">{themes.main_topic}</p>
                        </div>
                        {themes.themes && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Identified Themes</p>
                            {themes.themes.map((theme, i) => (
                              <div key={i} className="mb-2">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="capitalize">{theme.theme || theme.name}</span>
                                  <span className="text-gray-600">{theme.prevalence_percentage || theme.prevalence}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-purple-600 h-1.5 rounded-full"
                                    style={{ width: `${theme.prevalence_percentage || theme.prevalence}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {themes.lyrical_style && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700">Lyrical Style</p>
                            <p className="capitalize">{themes.lyrical_style}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Readability */}
              {results.analyses?.find(a => a.type === 'readability') && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">📊</span> Readability & Stats
                  </h3>
                  {(() => {
                    const readability = results.analyses.find(a => a.type === 'readability').data;
                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Complexity</p>
                          <span className={`inline-block px-3 py-1 rounded-full font-medium mt-1 ${getComplexityColor(readability.complexity)}`}>
                            {readability.complexity?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Flesch Score</p>
                          <p className="text-2xl font-bold">{readability.flesch_score}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Word Count</p>
                          <p className="text-2xl font-bold">{readability.word_count}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Lines</p>
                          <p className="text-2xl font-bold">{readability.line_count}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Grade Level</p>
                          <p className="text-2xl font-bold">{readability.grade_level}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Words/Line</p>
                          <p className="text-2xl font-bold">{readability.avg_words_per_sentence}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Profanity Check */}
              {results.analyses?.find(a => a.type === 'profanity') && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">⚠️</span> Content Advisory
                  </h3>
                  {(() => {
                    const profanity = results.analyses.find(a => a.type === 'profanity').data;
                    return (
                      <div>
                        <div className="mb-3">
                          <span className={`inline-block px-3 py-1 rounded-full font-medium ${
                            profanity.severity === 'clean' ? 'bg-green-50 text-green-700' :
                            profanity.severity === 'mild' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-red-50 text-red-700'
                          }`}>
                            {profanity.severity.toUpperCase()}
                          </span>
                        </div>
                        {profanity.has_profanity && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              Found {profanity.profanity_count} explicit {profanity.profanity_count === 1 ? 'word' : 'words'}
                            </p>
                          </div>
                        )}
                        <div className={`mt-3 p-3 rounded-md ${
                          profanity.explicit_label_needed ? 'bg-red-50' : 'bg-green-50'
                        }`}>
                          <p className="text-sm font-medium">
                            {profanity.recommendation}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {!results && (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500">
                Enter your lyrics and click "Analyze Lyrics" to see results here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
