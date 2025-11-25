'use client';

/**
 * Touring Platform - Set List Builder
 * Drag-and-drop set list creation
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Music, GripVertical, Trash2, Clock } from 'lucide-react';

export default function SetListBuilderClient({ tourId, dateId, userId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [songs, setSongs] = useState([]);
  const [setlistSongs, setSetlistSongs] = useState([]);
  const [setlistName, setSetlistName] = useState('Main Set');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchData();
  }, [tourId, dateId]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch available songs
      const songsRes = await fetch(`/api/touring/tours/${tourId}/songs`);
      const songsData = await songsRes.json();
      
      if (songsData.success) {
        setSongs(songsData.songs || []);
      }
      
      // Fetch existing setlist
      const setlistRes = await fetch(`/api/touring/tour-dates/${dateId}/setlist`);
      const setlistData = await setlistRes.json();
      
      if (setlistData.success) {
        if (setlistData.setlist) {
          setSetlistName(setlistData.setlist.name);
          setSetlistSongs(setlistData.songs || []);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const addSong = (song) => {
    setSetlistSongs([...setlistSongs, {
      song_id: song.id,
      songs: song,
      position: setlistSongs.length + 1,
      is_break: false
    }]);
  };
  
  const removeSong = (index) => {
    const newSongs = setlistSongs.filter((_, i) => i !== index);
    // Reorder positions
    setSetlistSongs(newSongs.map((song, i) => ({ ...song, position: i + 1 })));
  };
  
  const addBreak = (index) => {
    const newSongs = [...setlistSongs];
    newSongs.splice(index, 0, {
      song_id: null,
      songs: null,
      position: index + 1,
      is_break: true,
      break_duration: 5
    });
    // Reorder positions
    setSetlistSongs(newSongs.map((song, i) => ({ ...song, position: i + 1 })));
  };
  
  const moveSong = (fromIndex, toIndex) => {
    const newSongs = [...setlistSongs];
    const [moved] = newSongs.splice(fromIndex, 1);
    newSongs.splice(toIndex, 0, moved);
    // Reorder positions
    setSetlistSongs(newSongs.map((song, i) => ({ ...song, position: i + 1 })));
  };
  
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/touring/tour-dates/${dateId}/setlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: setlistName,
          songs: setlistSongs.map(song => ({
            song_id: song.song_id,
            is_break: song.is_break,
            break_duration: song.break_duration || null,
            notes: song.notes || null
          }))
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save setlist');
      }
      
      router.push(`/touring/tours/${tourId}/dates/${dateId}?tab=setlist`);
    } catch (err) {
      console.error('Error saving setlist:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  
  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (song.artist && song.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const totalDuration = setlistSongs.reduce((sum, song) => {
    if (song.is_break) return sum + (song.break_duration || 0);
    return sum + (song.songs?.duration || 0);
  }, 0);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading set list builder...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/touring/tours/${tourId}/dates/${dateId}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Set List Builder</h1>
                <p className="text-gray-600 mt-1">Create your set list for this show</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Set List
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Song Library */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search songs..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-3">Song Library</h3>
              
              {songs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Music className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm mb-4">No songs yet</p>
                  <button className="text-sm text-blue-600 hover:underline">Add your first song</button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredSongs.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => addSong(song)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-semibold text-gray-900">{song.title}</p>
                      {song.artist && (
                        <p className="text-sm text-gray-600 mt-1">{song.artist}</p>
                      )}
                      {song.duration && (
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Set List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <input
                  type="text"
                  value={setlistName}
                  onChange={(e) => setSetlistName(e.target.value)}
                  className="text-2xl font-bold text-gray-900 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Set List Name"
                />
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                  <span>{setlistSongs.length} songs</span>
                  {totalDuration > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
              </div>
              
              {setlistSongs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="mb-4">Your set list is empty</p>
                  <p className="text-sm">Add songs from the library to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {setlistSongs.map((song, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0 text-gray-400">
                        <GripVertical size={20} />
                      </div>
                      
                      <div className="flex-1">
                        {song.is_break ? (
                          <div>
                            <p className="font-semibold text-gray-900">Break</p>
                            <p className="text-sm text-gray-600">{song.break_duration || 5} minutes</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-gray-900">{song.songs?.title || 'Unknown'}</p>
                            {song.songs?.artist && (
                              <p className="text-sm text-gray-600">{song.songs.artist}</p>
                            )}
                            {song.songs?.duration && (
                              <p className="text-xs text-gray-500 mt-1">
                                {Math.floor(song.songs.duration / 60)}:{(song.songs.duration % 60).toString().padStart(2, '0')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">#{song.position}</span>
                        <button
                          onClick={() => removeSong(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-3">
                <button
                  onClick={() => addBreak(setlistSongs.length)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
                >
                  <Plus size={16} />
                  Add Break
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

