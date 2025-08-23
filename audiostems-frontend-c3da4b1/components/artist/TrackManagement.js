import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { FaMusic, FaEdit, FaTrash, FaPlay, FaPause, FaDownload, FaEye, FaUpload } from 'react-icons/fa';
import { formatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import useModals from '@/hooks/useModals';

const RELEASE_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  LIVE: 'live'
};

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-purple-100 text-purple-800',
  live: 'bg-emerald-100 text-emerald-800'
};

const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  in_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  live: 'Live'
};

export default function TrackManagement() {
  const { user } = useUser();
  const [selectedCurrency] = useCurrencySync('GBP');
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const {
    showSuccess,
    showError,
    confirmModal,
    showConfirmation,
    closeConfirmModal
  } = useModals();

  useEffect(() => {
    if (user) {
      loadReleases();
    }
  }, [user]);

  const loadReleases = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return;
      }

      const response = await fetch('/api/artist/releases', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReleases(data.releases || []);
      } else {
        console.error('Failed to load releases');
      }
    } catch (error) {
      console.error('Error loading releases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (release, songId) => {
    if (currentlyPlaying === songId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(songId);
      // In a real app, you'd integrate with an audio player
      console.log('Playing song:', songId, 'from release:', release.title);
    }
  };

  const handleEdit = (release) => {
    if (!canEdit(release.status)) {
      showError('This release cannot be edited in its current status');
      return;
    }
    // Open edit modal
    setSelectedRelease(release);
  };

  const handleDelete = async (release) => {
    if (!canDelete(release.status)) {
      showError('This release cannot be deleted in its current status');
      return;
    }

    const confirmed = await showConfirmation({
      title: 'Delete Release',
      message: `Are you sure you want to delete "${release.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      type: 'danger'
    });

    if (confirmed) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(`/api/artist/releases/${release.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (response.ok) {
          showSuccess('Release deleted successfully');
          loadReleases(); // Refresh list
        } else {
          const error = await response.json();
          showError(error.error || 'Failed to delete release');
        }
      } catch (error) {
        console.error('Error deleting release:', error);
        showError('Failed to delete release');
      }
    }
  };

  const canEdit = (status) => {
    return ['draft', 'submitted', 'rejected'].includes(status);
  };

  const canDelete = (status) => {
    return ['draft'].includes(status);
  };

  const filteredReleases = releases.filter(release => {
    if (filter === 'all') return true;
    return release.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'live':
        return '🎉';
      case 'completed':
        return '✅';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'in_review':
        return '👀';
      case 'submitted':
        return '📤';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Track Management</h2>
          <p className="text-gray-600">Manage your releases and track their progress</p>
        </div>
        
        {/* Filter */}
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Releases</option>
            <option value="draft">Drafts</option>
            <option value="submitted">Submitted</option>
            <option value="in_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="live">Live</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Releases', value: releases.length, color: 'blue' },
          { label: 'Live Tracks', value: releases.filter(r => r.status === 'live').length, color: 'green' },
          { label: 'Under Review', value: releases.filter(r => r.status === 'in_review').length, color: 'yellow' },
          { label: 'Drafts', value: releases.filter(r => r.status === 'draft').length, color: 'gray' }
        ].map((stat, index) => (
          <div key={index} className={`bg-white border border-gray-200 rounded-lg p-4`}>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Releases List */}
      {filteredReleases.length === 0 ? (
        <div className="text-center py-12">
          <FaMusic className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No releases yet' : `No ${filter} releases`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'Create your first release to get started'
              : `You don't have any releases in ${filter} status`
            }
          </p>
          {filter === 'all' && (
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Create Release
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Your Releases ({filteredReleases.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredReleases.map((release) => (
              <div key={release.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Artwork */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {release.projects?.artwork_url ? (
                        <img 
                          src={release.projects.artwork_url} 
                          alt={release.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaMusic className="text-gray-400 text-2xl" />
                      )}
                    </div>
                    
                    {/* Release Info */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{release.title}</h4>
                      <p className="text-sm text-gray-600">
                        {release.release_type} • {release.projects?.genre}
                        {release.release_date && (
                          <> • {new Date(release.release_date).toLocaleDateString()}</>
                        )}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[release.status]}`}>
                          {getStatusIcon(release.status)} {STATUS_LABELS[release.status]}
                        </span>
                        {release.projects?.songs && (
                          <span className="text-xs text-gray-500">
                            {release.projects.songs.length} track{release.projects.songs.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {/* Play button for songs */}
                    {release.projects?.songs?.length > 0 && (
                      <button
                        onClick={() => handlePlay(release, release.projects.songs[0].id)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        title="Preview"
                      >
                        {currentlyPlaying === release.projects.songs[0].id ? <FaPause /> : <FaPlay />}
                      </button>
                    )}
                    
                    {/* Edit */}
                    {canEdit(release.status) && (
                      <button
                        onClick={() => handleEdit(release)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                    )}
                    
                    {/* View Details */}
                    <button
                      onClick={() => setSelectedRelease(release)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    
                    {/* Delete */}
                    {canDelete(release.status) && (
                      <button
                        onClick={() => handleDelete(release)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Songs List */}
                {release.projects?.songs && release.projects.songs.length > 0 && (
                  <div className="mt-4 pl-20">
                    <div className="space-y-2">
                      {release.projects.songs.map((song) => (
                        <div key={song.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">{song.title}</span>
                            {song.duration && (
                              <span className="text-xs text-gray-500">{song.duration}s</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {song.file_url && (
                              <button
                                onClick={() => handlePlay(release, song.id)}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Play"
                              >
                                {currentlyPlaying === song.id ? <FaPause className="text-xs" /> : <FaPlay className="text-xs" />}
                              </button>
                            )}
                            {!song.file_url && (
                              <span className="text-xs text-orange-600">No audio file</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
