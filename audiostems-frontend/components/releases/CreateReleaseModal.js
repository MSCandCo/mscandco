import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaMusic, FaImage, FaPlus, FaTrash } from 'react-icons/fa';
import React from 'react'; // Added missing import
import { GENRES, RELEASE_TYPES, RELEASE_STATUSES, isStatusEditableByArtist, isStatusEditableByLabelAdmin } from '../../lib/constants';
import { ARTISTS } from '../../lib/emptyData';
import NotificationModal from '@/components/shared/NotificationModal';
import useModals from '@/hooks/useModals';

export default function CreateReleaseModal({ isOpen, onClose, existingRelease = null, isEditRequest = false, isApprovalEdit = false, userRole = 'artist' }) {
  
  // Get approved artists for label admin dropdown
  const getApprovedArtists = () => {
    if (userRole === 'label_admin') {
      // Filter artists with approvalStatus 'approved' and label 'YHWH MSC'
      return ARTISTS.filter(artist => 
        artist.approvalStatus === 'approved' && 
        artist.label === 'YHWH MSC'
      );
    }
    return [];
  };

  const approvedArtists = getApprovedArtists();

  const [formData, setFormData] = useState({
    projectName: 'New Release Project',
    artist: userRole === 'label_admin' && approvedArtists.length > 0 ? approvedArtists[0].name : 'YHWH MSC',
    releaseType: 'Single',
    genre: 'Hip Hop',
    status: 'draft',
    submissionDate: '',
    expectedReleaseDate: '',
    musicFiles: [],
    artworkFile: null,
    trackListing: [{ title: 'New Track', duration: '3:45', isrc: 'USRC12345678', bpm: '', songKey: '' }],
    credits: [{ role: 'Producer', fullName: 'YHWH MSC' }],
    publishingNotes: 'All tracks written and produced by YHWH MSC',
    marketingPlan: 'Social media campaign + playlist pitching'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize modals hook
  const {
    notificationModal,
    showSuccess,
    closeNotificationModal
  } = useModals();
  
  // Auto-save functionality for artist and label admin
  const [hasStartedEditing, setHasStartedEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimeoutRef = useRef(null);

  // Cleanup auto-save timeout when modal closes
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Populate form with existing release data when modal opens
  React.useEffect(() => {
    if (isOpen && existingRelease && isEditRequest) {
      setFormData({
        projectName: existingRelease.projectName || '',
        artist: existingRelease.artist || '',
        releaseType: existingRelease.releaseType || '',
        genre: existingRelease.genre || '',
        status: existingRelease.status || 'draft',
        submissionDate: existingRelease.submissionDate || '',
        expectedReleaseDate: existingRelease.expectedReleaseDate || '',
        musicFiles: existingRelease.musicFiles || [],
        artworkFile: existingRelease.artworkFile || null,
        trackListing: existingRelease.trackListing || [{ title: '', duration: '', isrc: '', bpm: '', songKey: '' }],
        credits: existingRelease.credits || [{ role: '', fullName: '' }],
        publishingNotes: existingRelease.publishingNotes || '',
        marketingPlan: existingRelease.marketingPlan || ''
      });
    }
  }, [isOpen, existingRelease, isEditRequest]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleTrackChange = (index, field, value) => {
    const newTrackListing = [...formData.trackListing];
    newTrackListing[index] = {
      ...newTrackListing[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      trackListing: newTrackListing
    }));
  };

  const addTrack = () => {
    setFormData(prev => ({
      ...prev,
      trackListing: [...prev.trackListing, { title: '', duration: '', isrc: '', bpm: '', songKey: '' }]
    }));
  };

  const removeTrack = (index) => {
    if (formData.trackListing.length > 1) {
      const newTrackListing = formData.trackListing.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        trackListing: newTrackListing
      }));
    }
  };

  const handleCreditChange = (index, field, value) => {
    const newCredits = [...formData.credits];
    newCredits[index] = {
      ...newCredits[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      credits: newCredits
    }));
  };

  const addCredit = () => {
    setFormData(prev => ({
      ...prev,
      credits: [...prev.credits, { role: '', fullName: '' }]
    }));
  };

  const removeCredit = (index) => {
    if (formData.credits.length > 1) {
      const newCredits = formData.credits.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        credits: newCredits
      }));
    }
  };

  // Auto-save function for draft saves
  const autoSaveDraft = async () => {
    if (userRole === 'artist' || userRole === 'label_admin') {
      setIsSaving(true);
      try {
        // Simulate API call to save draft
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In production, this would be an API call:
        // await fetch('/api/releases/save-draft', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ ...formData, status: 'draft' })
        // });
        
        setLastSaved(new Date());
        console.log('Auto-saved draft:', { ...formData, status: 'draft' });
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Handle form changes with auto-save trigger
  const handleFormChange = (field, value) => {
    // Mark as started editing on first change
    if (!hasStartedEditing) {
      setHasStartedEditing(true);
      // Auto-save to draft immediately when user starts editing
      setTimeout(() => autoSaveDraft(), 100);
    }

    // Update form data
    handleInputChange(field, value);

    // Clear existing timeout and set new one for auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Auto-save after 3 seconds of inactivity
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveDraft();
    }, 3000);
  };

  const handleMusicFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      musicFiles: [...prev.musicFiles, ...files]
    }));
  };

  const removeMusicFile = (index) => {
    const newFiles = formData.musicFiles.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      musicFiles: newFiles
    }));
  };

  const handleArtworkUpload = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      artworkFile: file
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }

    if (!formData.artist.trim()) {
      newErrors.artist = 'Artist name is required';
    }

    if (!formData.releaseType) {
      newErrors.releaseType = 'Release type is required';
    }

    if (!formData.genre) {
      newErrors.genre = 'Genre is required';
    }

    if (!formData.expectedReleaseDate) {
      newErrors.expectedReleaseDate = 'Expected release date is required';
    }

    if (formData.trackListing.some(track => !track.title.trim())) {
      newErrors.trackListing = 'All tracks must have titles';
    }

    if (formData.credits.some(credit => !credit.role.trim() || !credit.fullName.trim())) {
      newErrors.credits = 'All credits must have role and full name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // For artist and label admin, automatically set status to 'submitted' on form submission
      const submissionData = { ...formData };
      if (userRole === 'artist' || userRole === 'label_admin') {
        submissionData.status = RELEASE_STATUSES.SUBMITTED;
      }

      if (isEditRequest) {
        console.log('Submitting edit request:', submissionData);
        await new Promise(resolve => setTimeout(resolve, 2000));
        showSuccess('Edit request submitted successfully! The distribution team will review your changes.', 'Request Submitted');
      } else {
        console.log('Submitting release:', submissionData);
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (userRole === 'artist' || userRole === 'label_admin') {
          showSuccess('Release submitted successfully! Your release has been sent for review.', 'Release Submitted');
        }
      }
      onClose();
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 px-6 pt-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditRequest ? 'Edit Request' : isApprovalEdit ? 'Update Release' : 'Create New Release'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Auto-save indicator for artist and label admin */}
        {(userRole === 'artist' || userRole === 'label_admin') && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Saving draft...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">
                      Auto-saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </>
                ) : hasStartedEditing ? (
                  <>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">Changes will be auto-saved</span>
                  </>
                ) : null}
              </div>
              {hasStartedEditing && (
                <span className="text-xs text-gray-500">
                  Submit to send for review
                </span>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => handleFormChange('projectName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.projectName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter project name"
              />
              {errors.projectName && (
                <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artist *
              </label>
              {userRole === 'label_admin' ? (
                <select
                  value={formData.artist}
                  onChange={(e) => handleFormChange('artist', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.artist ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select an approved artist</option>
                  {approvedArtists.map((artist) => (
                    <option key={artist.id} value={artist.name}>
                      {artist.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => handleFormChange('artist', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.artist ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter artist name"
                />
              )}
              {errors.artist && (
                <p className="text-red-500 text-sm mt-1">{errors.artist}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Release Type *
              </label>
              <select
                value={formData.releaseType}
                onChange={(e) => handleInputChange('releaseType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.releaseType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select release type</option>
                {RELEASE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.releaseType && (
                <p className="text-red-500 text-sm mt-1">{errors.releaseType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre *
              </label>
              <select
                value={formData.genre}
                onChange={(e) => handleInputChange('genre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.genre ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select genre</option>
                {GENRES.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              {errors.genre && (
                <p className="text-red-500 text-sm mt-1">{errors.genre}</p>
              )}
            </div>

            {/* Status dropdown only visible for distribution partner, company admin, and super admin */}
            {(userRole === 'distribution_partner' || userRole === 'company_admin' || userRole === 'super_admin') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(RELEASE_STATUSES)
                    .filter(([, value]) => {
                      if (userRole === 'label_admin') {
                        return isStatusEditableByLabelAdmin(value);
                      }
                      return isStatusEditableByArtist(value);
                    })
                    .map(([, value]) => (
                      <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Release Date *
              </label>
              <input
                type="date"
                value={formData.expectedReleaseDate}
                onChange={(e) => handleInputChange('expectedReleaseDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.expectedReleaseDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.expectedReleaseDate && (
                <p className="text-red-500 text-sm mt-1">{errors.expectedReleaseDate}</p>
              )}
            </div>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Music Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={handleMusicFileUpload}
                  className="hidden"
                  id="music-upload"
                />
                <label htmlFor="music-upload" className="cursor-pointer">
                  <FaMusic className="mx-auto text-3xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload music files</p>
                  <p className="text-xs text-gray-500 mt-1">MP3, WAV, FLAC accepted</p>
                </label>
              </div>
              
              {formData.musicFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.musicFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeMusicFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Artwork
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleArtworkUpload}
                  className="hidden"
                  id="artwork-upload"
                />
                <label htmlFor="artwork-upload" className="cursor-pointer">
                  <FaImage className="mx-auto text-3xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload artwork</p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG accepted</p>
                </label>
              </div>
              
              {formData.artworkFile && (
                <div className="mt-3 flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-700">{formData.artworkFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, artworkFile: null }))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Track Listing */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Track Listing ({formData.trackListing.length} tracks)</h3>
              <button
                type="button"
                onClick={addTrack}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                <FaPlus className="mr-1" />
                Add Track
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.trackListing.map((track, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="w-80 flex-shrink-0">
                    <input
                      type="text"
                      placeholder="Track title"
                      value={track.title}
                      onChange={(e) => handleTrackChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="w-20 flex-shrink-0">
                    <input
                      type="text"
                      placeholder="3:45"
                      value={track.duration}
                      onChange={(e) => handleTrackChange(index, 'duration', e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="w-16 flex-shrink-0">
                    <input
                      type="text"
                      placeholder="140"
                      value={track.bpm || ''}
                      onChange={(e) => handleTrackChange(index, 'bpm', e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="w-24 flex-shrink-0">
                    <input
                      type="text"
                      placeholder="C Minor"
                      value={track.songKey || ''}
                      onChange={(e) => handleTrackChange(index, 'songKey', e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="w-32 flex-shrink-0">
                    <input
                      type="text"
                      placeholder="USRC1234567"
                      value={track.isrc}
                      onChange={(e) => handleTrackChange(index, 'isrc', e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    />
                  </div>
                  {formData.trackListing.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTrack(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.trackListing && (
              <p className="text-red-500 text-sm mt-1">{errors.trackListing}</p>
            )}
          </div>

          {/* Credits */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Credits</h3>
              <button
                type="button"
                onClick={addCredit}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                <FaPlus className="mr-1" />
                Add Credit
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.credits.map((credit, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                  <select
                    value={credit.role}
                    onChange={(e) => handleCreditChange(index, 'role', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select role</option>
                    <optgroup label="Production">
                      <option value="Executive Producer">Executive Producer</option>
                      <option value="Producer">Producer</option>
                      <option value="Co-Producer">Co-Producer</option>
                      <option value="Assistant Producer">Assistant Producer</option>
                      <option value="Additional Production">Additional Production</option>
                    </optgroup>
                    <optgroup label="Engineering">
                      <option value="Mixing Engineer">Mixing Engineer</option>
                      <option value="Mastering Engineer">Mastering Engineer</option>
                      <option value="Recording Engineer">Recording Engineer</option>
                      <option value="Engineer">Engineer</option>
                      <option value="Editing">Editing</option>
                    </optgroup>
                    <optgroup label="Studio">
                      <option value="Mastering Studio">Mastering Studio</option>
                      <option value="Recording Studio">Recording Studio</option>
                    </optgroup>
                    <optgroup label="Instruments">
                      <option value="Keyboards">Keyboards</option>
                      <option value="Programming">Programming</option>
                      <option value="Bass">Bass</option>
                      <option value="Drums">Drums</option>
                      <option value="Guitars">Guitars</option>
                      <option value="Organ">Organ</option>
                      <option value="Percussion">Percussion</option>
                      <option value="Strings">Strings</option>
                      <option value="Additional Instrumentation">Additional Instrumentation</option>
                    </optgroup>
                    <optgroup label="Creative">
                      <option value="Design/Art Direction">Design/Art Direction</option>
                    </optgroup>
                    <optgroup label="Management">
                      <option value="Management">Management</option>
                      <option value="Booking Agent">Booking Agent</option>
                      <option value="Press Contact">Press Contact</option>
                    </optgroup>
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={credit.fullName}
                      onChange={(e) => handleCreditChange(index, 'fullName', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.credits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCredit(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.credits && (
              <p className="text-red-500 text-sm mt-1">{errors.credits}</p>
            )}
          </div>

          {/* Publishing Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Publishing Notes
            </label>
            <textarea
              value={formData.publishingNotes}
              onChange={(e) => handleInputChange('publishingNotes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter publishing information..."
            />
          </div>

          {/* Marketing Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marketing Plan
            </label>
            <textarea
              value={formData.marketingPlan}
              onChange={(e) => handleInputChange('marketingPlan', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter marketing strategy..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEditRequest ? 'Finalise Request' : isApprovalEdit ? 'Update Release' : 'Create Release'}
            </button>
          </div>
        </form>
      </div>

      {/* Branded Modals */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={closeNotificationModal}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
        buttonText={notificationModal.buttonText}
      />
    </div>
  );
} 