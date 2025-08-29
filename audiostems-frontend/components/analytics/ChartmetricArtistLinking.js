import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { Search, Link, Unlink, CheckCircle, AlertCircle, Music, ExternalLink } from 'lucide-react';

export default function ChartmetricArtistLinking({ onLinked }) {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [linkedArtist, setLinkedArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState(null);

  // Load current linked artist on component mount
  useEffect(() => {
    loadLinkedArtist();
  }, [user]);

  const loadLinkedArtist = async () => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/chartmetric/link-artist?current=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.linked) {
        setLinkedArtist(result.artist);
      }
    } catch (error) {
      console.error('Error loading linked artist:', error);
      setError('Failed to load linked artist information');
    } finally {
      setIsLoading(false);
    }
  };

  const searchArtists = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/chartmetric/link-artist?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        setSearchResults(result.results || []);
      } else {
        setError(result.error || 'Search failed');
      }
    } catch (error) {
      console.error('Error searching artists:', error);
      setError('Failed to search artists');
    } finally {
      setIsSearching(false);
    }
  };

  const linkArtist = async (artist) => {
    setIsLinking(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/chartmetric/link-artist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          artistId: artist.id,
          artistName: artist.name,
          verified: artist.verified || false
        })
      });

      const result = await response.json();
      
      console.log('Link artist API response:', {
        status: response.status,
        success: result.success,
        error: result.error,
        message: result.message
      });

      if (response.ok && result.success) {
        console.log('✅ Artist linking successful:', result.artist);
        setLinkedArtist(result.artist);
        setSearchResults([]);
        setSearchQuery('');
        setError(null);
        if (onLinked) onLinked(result.artist);
      } else {
        console.error('❌ Artist linking failed:', result);
        
        // Show specific message for already linked artists
        if (result.error === 'Artist profile already linked') {
          setError(`${result.message} Current artist: ${result.existingArtist?.name || 'Unknown'}`);
        } else {
          setError(result.message || result.error || `Failed to link artist (${response.status})`);
        }
      }
    } catch (error) {
      console.error('Error linking artist:', error);
      setError('Failed to link artist profile');
    } finally {
      setIsLinking(false);
    }
  };

  const unlinkArtist = async () => {
    setIsLinking(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/chartmetric/link-artist', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        setLinkedArtist(null);
        if (onLinked) onLinked(null);
      } else {
        setError(result.error || 'Failed to unlink artist');
      }
    } catch (error) {
      console.error('Error unlinking artist:', error);
      setError('Failed to unlink artist profile');
    } finally {
      setIsLinking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <Music className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">Chartmetric Artist Profile</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {linkedArtist ? (
        // Show linked artist
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-green-900">{linkedArtist.name}</h3>
                <p className="text-sm text-green-700">
                  Chartmetric ID: {linkedArtist.id}
                  {linkedArtist.verified && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Verified
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={unlinkArtist}
              disabled={isLinking}
              className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              <Unlink className="w-4 h-4 mr-1" />
              {isLinking ? 'Unlinking...' : 'Unlink'}
            </button>
          </div>

          <div className="text-sm text-gray-600">
            <p>✅ Your analytics are now powered by real Chartmetric data</p>
            <p>✅ Platform statistics, audience insights, and career metrics are live</p>
            <p>✅ Data updates automatically from streaming platforms</p>
          </div>

          {linkedArtist.details && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Artist Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {linkedArtist.details?.genres && Array.isArray(linkedArtist.details.genres) && (
                  <div>
                    <span className="text-gray-600">Genres:</span>
                    <span className="ml-2 text-gray-900">{linkedArtist.details.genres.join(', ')}</span>
                  </div>
                )}
                {linkedArtist.details.country && (
                  <div>
                    <span className="text-gray-600">Country:</span>
                    <span className="ml-2 text-gray-900">{linkedArtist.details.country}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Show search interface
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            <p>Link your Chartmetric artist profile to unlock:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Real-time streaming platform analytics</li>
              <li>Audience demographics and geographic insights</li>
              <li>Social media performance tracking</li>
              <li>Career stage analysis and recommendations</li>
              <li>Playlist placement and discovery metrics</li>
            </ul>
          </div>

          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchArtists()}
                placeholder="Search for your artist name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={searchArtists}
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Search Results</h3>
              {searchResults.map((artist) => (
                <div key={artist.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    {artist.image_url ? (
                      <img 
                        src={artist.image_url} 
                        alt={artist.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <Music className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">{artist.name}</h4>
                      <p className="text-sm text-gray-600">
                        ID: {artist.id}
                        {artist.verified && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Verified
                          </span>
                        )}
                      </p>
                      {artist.genres && Array.isArray(artist.genres) && artist.genres.length > 0 && (
                        <p className="text-xs text-gray-500">{artist.genres.join(', ')}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => linkArtist(artist)}
                    disabled={isLinking}
                    className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    <Link className="w-4 h-4 mr-1" />
                    {isLinking ? 'Linking...' : 'Link'}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important:</p>
                <p>Only link your own artist profile. Linking to another artist's profile may result in account suspension.</p>
                <p className="mt-2">
                  Don't see your artist? Make sure you're listed on major streaming platforms first, then contact{' '}
                  <a href="mailto:support@mscandco.com" className="underline">support@mscandco.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
