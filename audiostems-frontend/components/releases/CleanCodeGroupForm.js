// Clean Code Group Release Form - Dropdown Addition System
import { useState } from 'react';
import { RELEASE_TYPES, GENRES, LANGUAGES, ASSET_CONTRIBUTOR_TYPES, RELEASE_CONTRIBUTOR_TYPES, SOCIAL_MEDIA_TYPES } from '../../lib/constants';

export default function CleanCodeGroupForm({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    // Basic Release Info
    releaseTitle: '',
    releaseType: 'Single',
    primaryArtist: '',
    genre: '', // Primary genre
    secondaryGenre: '',
    releaseDate: '',
    hasPreOrder: false,
    preOrderDate: '',
    
    // State for dropdown additions
    socialDetails: [],
    releaseContributors: [],
    
    // Advanced Details
    label: '',
    upc: '',
    sellWorldwide: true,
    territoryRestrictionType: 'exclude',
    territoryRestrictions: [],
    
    // Distribution Details  
    digitalAssetsFolder: '',
    metadataApproved: false,
    initials: '',
    submittedToStores: false,
    luminate: '',
    mediabase: '',
    notes: '',
    
    // Assets
    assets: [{
      songTitle: '',
      anyOtherFeaturingArtists: '',
      duration: '',
      explicit: false,
      version: '',
      bpm: '',
      songKey: '',
      moodDescription: '',
      tags: '',
      lyrics: '',
      language: 'English',
      customLanguageDetails: '',
      vocalType: '',
      catalogueNo: '',
      format: 'Digital',
      productType: 'Single',
      barcode: '',
      tunecode: '',
      iceWorkKey: '',
      iswc: '',
      isrc: '',
      bowiPreviouslyReleased: false,
      previousReleaseDate: '',
      recordingCountry: '',
      
      // Asset contributors using dropdown addition
      contributors: []
    }]
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Add social media entry
  const addSocialDetail = (type) => {
    setFormData(prev => ({
      ...prev,
      socialDetails: [...prev.socialDetails, { type, value: '' }]
    }));
  };

  // Add release contributor  
  const addReleaseContributor = (type) => {
    setFormData(prev => ({
      ...prev,
      releaseContributors: [...prev.releaseContributors, { type, value: '' }]
    }));
  };

  // Add asset contributor
  const addAssetContributor = (assetIndex, type) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.map((asset, i) => 
        i === assetIndex ? {
          ...asset,
          contributors: [...asset.contributors, { type, name: '' }]
        } : asset
      )
    }));
  };

  // Calculate business days for validation
  const calculateBusinessDays = (date) => {
    const today = new Date();
    const releaseDate = new Date(date);
    let count = 0;
    const current = new Date(today);
    
    while (current < releaseDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🎵 Code Group release form submission:', formData);
    setLoading(true);
    
    try {
      // Set defaults
      const submitData = {
        ...formData,
        label: formData.label || 'MSC & Co',
        distributionCompany: 'MSC & Co',
        releaseLabel: 'MSC & Co'
      };
      
      const response = await fetch('/api/releases/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      console.log('📥 API Response:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Release created:', result);
        onSuccess(result);
        onClose();
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        setErrors({ submit: `Error: ${response.status} ${errorText}` });
      }
    } catch (error) {
      console.error('❌ Submission error:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const businessDays = formData.releaseDate ? calculateBusinessDays(formData.releaseDate) : null;
  const showWarning = businessDays !== null && businessDays < 20;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Create New Release</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Project Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Release Title *</label>
                <input
                  type="text"
                  value={formData.releaseTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, releaseTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter release title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Release Type *</label>
                <select
                  value={formData.releaseType}
                  onChange={(e) => setFormData(prev => ({ ...prev, releaseType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {RELEASE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Artist *</label>
                <input
                  type="text"
                  value={formData.primaryArtist}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryArtist: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter primary artist name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Genre *</label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select primary genre</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Genre</label>
                <select
                  value={formData.secondaryGenre}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryGenre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select secondary genre (optional)</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Release Date *</label>
                <input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                {showWarning && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>TIP:</strong> Set your release date 20 business days from today to give stores time to review your release
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Your release will go live on {new Date(formData.releaseDate).toLocaleDateString('en-US', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })} 12:00 AM in your listeners' timezones.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Pre-Order Section */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pre-Order (Optional)</label>
              <div className="flex items-center space-x-4 mb-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="preOrder"
                    checked={formData.hasPreOrder === true}
                    onChange={() => setFormData(prev => ({ ...prev, hasPreOrder: true }))}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="preOrder"
                    checked={formData.hasPreOrder === false}
                    onChange={() => setFormData(prev => ({ ...prev, hasPreOrder: false, preOrderDate: '' }))}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              
              {formData.hasPreOrder && (
                <div>
                  <input
                    type="date"
                    value={formData.preOrderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, preOrderDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    <strong>Best Practice:</strong> Set pre-order 2-4 weeks before release date for optimal campaign results
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Asset Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assets (1)</h3>
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Asset 1: {formData.assets[0].songTitle || 'Untitled'}</h4>
              
              {/* Basic Asset Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Song Title *</label>
                  <input
                    type="text"
                    value={formData.assets[0].songTitle}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: prev.assets.map((asset, i) => 
                        i === 0 ? { ...asset, songTitle: e.target.value } : asset
                      )
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter song title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Any Other Featuring Artists</label>
                  <input
                    type="text"
                    value={formData.assets[0].anyOtherFeaturingArtists}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: prev.assets.map((asset, i) => 
                        i === 0 ? { ...asset, anyOtherFeaturingArtists: e.target.value } : asset
                      )
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter featuring artists"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                  <input
                    type="text"
                    value={formData.assets[0].duration}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: prev.assets.map((asset, i) => 
                        i === 0 ? { ...asset, duration: e.target.value } : asset
                      )
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="3:45"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Explicit</label>
                  <select
                    value={formData.assets[0].explicit ? 'Yes' : 'No'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: prev.assets.map((asset, i) => 
                        i === 0 ? { ...asset, explicit: e.target.value === 'Yes' } : asset
                      )
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                  <input
                    type="text"
                    value={formData.assets[0].version}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: prev.assets.map((asset, i) => 
                        i === 0 ? { ...asset, version: e.target.value } : asset
                      )
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Original, Remix, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">BPM</label>
                  <input
                    type="number"
                    value={formData.assets[0].bpm}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: prev.assets.map((asset, i) => 
                        i === 0 ? { ...asset, bpm: e.target.value } : asset
                      )
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="120"
                  />
                </div>
              </div>
              
              {/* Language with conditional input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={formData.assets[0].language}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: prev.assets.map((asset, i) => 
                        i === 0 ? { ...asset, language: e.target.value, customLanguageDetails: '' } : asset
                      )
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {LANGUAGES.map(language => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                  </select>
                  
                  {(formData.assets[0].language === 'Multiple Languages' || formData.assets[0].language === 'Other') && (
                    <input
                      type="text"
                      value={formData.assets[0].customLanguageDetails}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        assets: prev.assets.map((asset, i) => 
                          i === 0 ? { ...asset, customLanguageDetails: e.target.value } : asset
                        )
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-2"
                      placeholder={formData.assets[0].language === 'Multiple Languages' ? 'Specify multiple languages' : 'Specify other language'}
                    />
                  )}
                </div>
              </div>

              {/* Asset Contributors - Dropdown Addition */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Asset Contributors</h4>
                <div className="flex items-center space-x-2 mb-4">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        addAssetContributor(0, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Add Contributor...</option>
                    {ASSET_CONTRIBUTOR_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  {formData.assets[0].contributors?.map((contributor, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            value={contributor.type}
                            disabled
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm bg-gray-100"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={contributor.name}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              assets: prev.assets.map((asset, i) => 
                                i === 0 ? {
                                  ...asset,
                                  contributors: asset.contributors.map((c, ci) => 
                                    ci === index ? { ...c, name: e.target.value } : c
                                  )
                                } : asset
                              )
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter name"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          assets: prev.assets.map((asset, i) => 
                            i === 0 ? {
                              ...asset,
                              contributors: asset.contributors.filter((_, ci) => ci !== index)
                            } : asset
                          )
                        }))}
                        className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  {(!formData.assets[0].contributors || formData.assets[0].contributors.length === 0) && (
                    <p className="text-gray-500 text-sm italic">No contributors added yet. Use the dropdown above to add contributors.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Release'}
            </button>
          </div>
          
          {errors.submit && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
