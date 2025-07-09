import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  MusicalNoteIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

export default function CreateProject() {
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [genres, setGenres] = useState([]);
  const [formData, setFormData] = useState({
    projectName: '',
    artist: '',
    releaseType: 'single',
    genre: [],
    status: 'draft',
    submissionDate: new Date().toISOString().split('T')[0],
    expectedReleaseDate: '',
    musicFiles: [],
    artwork: null,
    trackListing: [],
    credits: '',
    publishingNotes: '',
    feedback: '',
    marketingPlan: '',
    priority: 'medium',
    tags: [],
    budget: '',
    currency: 'GBP',
    mood: '',
    tempo: '',
    language: '',
    isExplicit: false,
    publishingRights: '',
    performanceRights: '',
    mechanicalRights: '',
    syncRights: '',
    territory: [],
    exclusivity: 'exclusive',
    licenseType: 'all_rights',
    licenseDuration: 'perpetual',
    licenseStartDate: '',
    licenseEndDate: '',
    restrictions: '',
    usageNotes: ''
  });
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
      fetchGenres();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/get-profile', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
        setFormData(prev => ({
          ...prev,
          artist: data.profile?.stageName || data.profile?.firstName || user?.name || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await fetch('/api/genres');
      if (response.ok) {
        const data = await response.json();
        setGenres(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field, files) => {
    if (field === 'musicFiles') {
      setFormData(prev => ({
        ...prev,
        musicFiles: [...prev.musicFiles, ...Array.from(files)]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: files[0]
      }));
    }
  };

  const removeFile = (field, index) => {
    if (field === 'musicFiles') {
      setFormData(prev => ({
        ...prev,
        musicFiles: prev.musicFiles.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const addTrackListing = () => {
    setFormData(prev => ({
      ...prev,
      trackListing: [...prev.trackListing, {
        trackNumber: prev.trackListing.length + 1,
        title: '',
        duration: '',
        isExplicit: false,
        isBonus: false,
        isRemix: false,
        isLive: false,
        isAcoustic: false,
        isInstrumental: false,
        featuring: '',
        producer: '',
        mixer: '',
        masteringEngineer: '',
        notes: ''
      }]
    }));
  };

  const updateTrackListing = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      trackListing: prev.trackListing.map((track, i) => 
        i === index ? { ...track, [field]: value } : track
      )
    }));
  };

  const removeTrackListing = (index) => {
    setFormData(prev => ({
      ...prev,
      trackListing: prev.trackListing.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/distribution/publishing/artist-portal/releases/${data.data.id}`);
      } else {
        const error = await response.json();
        alert(`Error creating project: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Create Project</h1>
          <p className="text-gray-600 text-center mb-6">
            Please sign in to create a new project.
          </p>
          <button
            onClick={() => loginWithRedirect()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Create Project - Artist Portal - AudioStems</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link href="/distribution/publishing/artist-portal/releases" className="text-gray-600 hover:text-gray-900 mr-4">
                  <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artist
                  </label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => handleInputChange('artist', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Artist name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Release Type *
                  </label>
                  <select
                    required
                    value={formData.releaseType}
                    onChange={(e) => handleInputChange('releaseType', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="single">Single</option>
                    <option value="ep">EP</option>
                    <option value="album">Album</option>
                    <option value="mixtape">Mixtape</option>
                    <option value="compilation">Compilation</option>
                    <option value="live_album">Live Album</option>
                    <option value="remix_album">Remix Album</option>
                    <option value="soundtrack">Soundtrack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="released">Released</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Date
                  </label>
                  <input
                    type="date"
                    value={formData.submissionDate}
                    onChange={(e) => handleInputChange('submissionDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Release Date
                  </label>
                  <input
                    type="date"
                    value={formData.expectedReleaseDate}
                    onChange={(e) => handleInputChange('expectedReleaseDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Media & Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Media & Content</h2>
              
              {/* Music Files Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Music Files
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <input
                      type="file"
                      multiple
                      accept=".mp3,.wav,.flac"
                      onChange={(e) => handleFileUpload('musicFiles', e.target.files)}
                      className="hidden"
                      id="music-files"
                    />
                    <label htmlFor="music-files" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                      Choose Files
                    </label>
                    <p className="mt-2 text-sm text-gray-500">
                      Upload .mp3, .wav, or .flac files
                    </p>
                  </div>
                </div>
                {formData.musicFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.musicFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <MusicalNoteIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('musicFiles', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Artwork Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Artwork
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('artwork', e.target.files)}
                      className="hidden"
                      id="artwork"
                    />
                    <label htmlFor="artwork" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                      Choose Image
                    </label>
                    <p className="mt-2 text-sm text-gray-500">
                      Square format recommended
                    </p>
                  </div>
                </div>
                {formData.artwork && (
                  <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <PhotoIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{formData.artwork.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('artwork')}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Track Listing */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Track Listing
                  </label>
                  <button
                    type="button"
                    onClick={addTrackListing}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Track
                  </button>
                </div>
                {formData.trackListing.map((track, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Track {track.trackNumber}
                        </label>
                        <input
                          type="text"
                          value={track.title}
                          onChange={(e) => updateTrackListing(index, 'title', e.target.value)}
                          placeholder="Track title"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (seconds)
                        </label>
                        <input
                          type="number"
                          value={track.duration}
                          onChange={(e) => updateTrackListing(index, 'duration', e.target.value)}
                          placeholder="Duration"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={track.isExplicit}
                          onChange={(e) => updateTrackListing(index, 'isExplicit', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Explicit</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={track.isBonus}
                          onChange={(e) => updateTrackListing(index, 'isBonus', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Bonus Track</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeTrackListing(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Credits */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credits
                </label>
                <textarea
                  value={formData.credits}
                  onChange={(e) => handleInputChange('credits', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="All contributors, producers, etc."
                />
              </div>

              {/* Publishing Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publishing Notes
                </label>
                <textarea
                  value={formData.publishingNotes}
                  onChange={(e) => handleInputChange('publishingNotes', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional publishing information"
                />
              </div>
            </div>

            {/* Management */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Budget amount"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback
                </label>
                <textarea
                  value={formData.feedback}
                  onChange={(e) => handleInputChange('feedback', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Internal notes/feedback"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marketing Plan
                </label>
                <textarea
                  value={formData.marketingPlan}
                  onChange={(e) => handleInputChange('marketingPlan', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Summarized marketing plan"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/distribution/publishing/artist-portal/releases"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 