'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ArtworkGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('modern');
  const [colorScheme, setColorScheme] = useState('vibrant');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchCredits();
    fetchHistory();
  }, []);

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/features/artwork/credits');
      const data = await res.json();
      setCredits(data);
    } catch (err) {
      console.error('Failed to fetch credits:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/features/artwork/generate');
      const data = await res.json();
      setHistory(data.generations || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const generateArtwork = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your artwork');
      return;
    }

    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/features/artwork/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style,
          color_scheme: colorScheme,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setResult(data);
      fetchCredits(); // Refresh credit balance
      fetchHistory(); // Refresh history

    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎨 AI Artwork Generator
        </h1>
        <p className="text-gray-600">
          Create stunning album artwork using DALL-E 3. Powered by artificial intelligence.
        </p>
      </div>

      {/* Credits Banner */}
      {credits && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Credits</p>
              <p className="text-3xl font-bold text-purple-600">
                {credits.credits_available} {credits.credits_available === 1 ? 'credit' : 'credits'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Monthly allocation: {credits.monthly_allocation} ({credits.subscription_tier} plan)
              </p>
            </div>
            <div>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium">
                Buy More Credits
              </button>
              <p className="text-xs text-gray-500 mt-1 text-center">£5 per 5 credits</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generation Form */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Create Artwork</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Artwork <span className="text-red-500">*</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic cityscape at sunset with neon lights, cyberpunk style..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={400}
              />
              <p className="mt-1 text-sm text-gray-500">
                {prompt.length}/400 characters | Be specific for best results
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="abstract">Abstract</option>
                <option value="realistic">Realistic</option>
                <option value="minimalist">Minimalist</option>
                <option value="vintage">Vintage</option>
                <option value="modern">Modern</option>
                <option value="psychedelic">Psychedelic</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Scheme
              </label>
              <select
                value={colorScheme}
                onChange={(e) => setColorScheme(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="vibrant">Vibrant</option>
                <option value="dark">Dark</option>
                <option value="pastel">Pastel</option>
                <option value="monochrome">Monochrome (B&W)</option>
                <option value="warm">Warm Tones</option>
                <option value="cool">Cool Tones</option>
              </select>
            </div>

            <button
              onClick={generateArtwork}
              disabled={generating || !prompt.trim() || (credits && credits.credits_available < 1)}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating... (30-60 seconds)
                </span>
              ) : (
                <span>Generate Artwork (1 Credit)</span>
              )}
            </button>

            {credits && credits.credits_available < 1 && (
              <p className="mt-3 text-center text-sm text-red-600">
                ⚠️ No credits available. Purchase more to generate artwork.
              </p>
            )}

            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800 font-medium mb-2">💡 Tips for great artwork:</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Be specific with colors, mood, and objects</li>
                <li>Mention artistic style (e.g., "oil painting", "digital art")</li>
                <li>Include lighting details (e.g., "golden hour", "neon lights")</li>
                <li>Keep it under 400 characters for best results</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Result/History */}
        <div>
          {result && result.image_url ? (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Generated Artwork</h2>

              <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={result.image_url}
                  alt="Generated artwork"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Prompt:</strong> {prompt}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Style:</strong> {style} | <strong>Colors:</strong> {colorScheme}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => downloadImage(result.image_url)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  Download Image
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Generate New
                </button>
              </div>

              <p className="mt-3 text-center text-sm text-gray-600">
                Credits remaining: <strong>{result.credits_remaining}</strong>
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center mb-6">
              <p className="text-gray-500">
                Your generated artwork will appear here
              </p>
            </div>
          )}

          {/* Generation History */}
          {history.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Generations</h2>
              <div className="grid grid-cols-2 gap-3">
                {history.slice(0, 6).map((gen) => (
                  <div key={gen.id} className="relative group">
                    {gen.generated_image_url ? (
                      <>
                        <img
                          src={gen.generated_image_url}
                          alt={gen.prompt}
                          className="w-full aspect-square object-cover rounded-md cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => downloadImage(gen.generated_image_url)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button className="px-3 py-1 bg-white text-gray-900 rounded text-sm font-medium">
                            View
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                        <span className="text-gray-500 text-sm">
                          {gen.status === 'generating' ? 'Generating...' : 'Failed'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {history.length > 6 && (
                <button className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium">
                  View All ({history.length} total)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
