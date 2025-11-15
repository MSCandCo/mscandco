'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/providers/SupabaseProvider';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import { Accessibility, Users, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function LabelAdminAccessibilityPage() {
  const { user } = useUser();
  const supabase = createClient();
  const [linkedArtists, setLinkedArtists] = useState([]);
  const [accessibilityData, setAccessibilityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    try {
      // Get all artists linked to this label admin
      const { data: artistsData, error: artistsError } = await supabase
        .from('user_profiles')
        .select('id, artist_name, first_name, last_name, email')
        .eq('label_admin_id', user.id)
        .eq('role', 'artist');

      if (artistsError) throw artistsError;
      setLinkedArtists(artistsData || []);

      // Get all accessibility content for linked artists
      if (artistsData && artistsData.length > 0) {
        const artistIds = artistsData.map(a => a.id);
        const { data: contentData, error: contentError } = await supabase
          .from('accessibility_content')
          .select('*, releases(title, release_date), user_profiles(artist_name, first_name, last_name)')
          .in('user_id', artistIds)
          .order('created_at', { ascending: false });

        if (contentError) throw contentError;
        setAccessibilityData(contentData || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading accessibility data:', error);
      setLoading(false);
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

  const getArtistName = (artist) => {
    return artist?.artist_name || `${artist?.first_name || ''} ${artist?.last_name || ''}`.trim() || artist?.email || 'Unknown Artist';
  };

  const filteredData = selectedArtist 
    ? accessibilityData.filter(item => item.user_id === selectedArtist)
    : accessibilityData;

  const groupedByArtist = filteredData.reduce((acc, item) => {
    const artistId = item.user_id;
    if (!acc[artistId]) {
      acc[artistId] = {
        artist: item.user_profiles,
        content: []
      };
    }
    acc[artistId].content.push(item);
    return acc;
  }, {});

  if (loading) {
    return <PageLoading message="Loading accessibility data..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Accessibility className="w-8 h-8 text-purple-600" />
          Accessibility Overview
        </h1>
        <p className="mt-2 text-gray-600">
          View accessibility data for all your linked artists
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Linked Artists</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {linkedArtists.length}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Content</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {accessibilityData.length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Verified</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {accessibilityData.filter(c => c.is_verified).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Languages</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {new Set(accessibilityData.map(c => c.language_code)).size}
              </p>
            </div>
            <Accessibility className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Filter by Artist */}
      {linkedArtists.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Artist
          </label>
          <select
            value={selectedArtist || ''}
            onChange={(e) => setSelectedArtist(e.target.value || null)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All Artists</option>
            {linkedArtists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {getArtistName(artist)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content by Artist */}
      {Object.keys(groupedByArtist).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Accessibility className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Accessibility Content</h3>
          <p className="text-gray-500">
            {linkedArtists.length === 0 
              ? 'No artists are currently linked to your label.'
              : 'Your artists haven\'t created any accessibility content yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByArtist).map(([artistId, { artist, content }]) => (
            <div key={artistId} className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {getArtistName(artist)}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {content.length} accessibility {content.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {content.filter(c => c.is_verified).length > 0 && (
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {content.filter(c => c.is_verified).length} Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {content.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {contentTypeLabels[item.content_type] || item.content_type}
                            </span>
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {item.language_code.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {item.releases?.title || 'Unknown Release'}
                          </p>
                          {item.releases?.release_date && (
                            <p className="text-xs text-gray-500 mt-1">
                              Released: {new Date(item.releases.release_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {item.is_verified ? (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      {item.text_content && (
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {item.text_content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

