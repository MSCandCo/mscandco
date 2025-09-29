import { useState, useEffect } from 'react';
import { FaTimes, FaMusic, FaImage, FaPlus, FaTrash, FaUser, FaCopy } from 'react-icons/fa';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { RELEASE_TYPES, GENRES, VOCAL_TYPES, SONG_KEYS, LANGUAGES, ASSET_CONTRIBUTOR_TYPES, RELEASE_CONTRIBUTOR_TYPES, SOCIAL_MEDIA_TYPES } from '../../lib/constants';

// Comprehensive release form with asset-level data collection
export default function ComprehensiveReleaseForm({ isOpen, onClose, existingRelease = null, userRole = 'artist' }) {
  const [formData, setFormData] = useState({
    // Project/Release Level Data
    releaseTitle: '',
    releaseType: 'Single', // Single, EP, Album
    primaryArtist: '',
    label: '',
    catalogueNo: '',
    upc: '',
    
    // Code Group Required Fields
    companyName: '',
    legalNames: '',
    artistName: '',
    phoneticPronunciation: '',
    stylised: '',
    akaFka: '',
    artistType: 'Solo Artist',
    productTitle: '', // Same as projectName
    altTitle: '',
    label: '', // Optional - defaults to MSC & Co if empty
    catalogueNo: '',
    format: 'Digital',
    productType: 'Single',
    barcode: '',
    tunecode: '',
    iceWorkKey: '',
    upc: '',
    releaseDate: '', // Main release date
    preOrderDate: '', // Optional pre-order
    preReleaseDate: '',
    preReleaseUrl: '',
    releaseUrl: '',
    releaseLabel: 'MSC & Co',
    distributionCompany: 'MSC & Co',
    copyrightYear: new Date().getFullYear(),
    copyrightOwner: '',
    pLine: '',
    cLine: '',
    
    // Assets (individual tracks)
    assets: [{
      // Basic Asset Info
      songTitle: '',
      assetPosition: 1,
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
      customLanguageDetails: '', // For "Multiple Languages" or "Other"
      vocalType: '',
      
      // Code Group Required Fields
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
      preReleaseDate: '',
      preReleaseUrl: '',
      releaseDate: '',
      releaseUrl: '',
      releaseLabel: 'MSC & Co',
      distributionCompany: 'MSC & Co',
      copyrightYear: new Date().getFullYear(),
      copyrightOwner: '',
      pLine: '',
      cLine: '',
      composerAuthor: '',
      role: '',
      pro: '',
      caeIpi: '',
      publishing: '',
      publisherIpi: '',
      publishingAdmin: '',
      publishingAdminIpi: '',
      mechanical: '',
      bmiWorkNumber: '',
      ascapWorkNumber: '',
      isni: '',
      subPublisher: '',
      publishingType: 'Original',
      
      // Rights & Publishing
      isrc: '',
      iswc: '',
      copyrightYear: new Date().getFullYear(),
      copyrightOwner: '',
      pLine: '',
      cLine: '',
      
      // Previous Release Info
      previouslyReleased: false,
      previousReleaseDate: '',
      recordingCountry: '',
      
      // Distribution & Platforms
      distributionPlatforms: ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Deezer', 'Tidal'],
      excludedPlatforms: [],
      releaseStrategy: 'immediate', // immediate, scheduled, pre-order
      
      // Royalty Information  
      artistRoyaltyPercentage: 70,
      labelRoyaltyPercentage: 20,
      distributorRoyaltyPercentage: 10,
      
      // Contributors (People who will be added to roster)
      contributors: {
        // Primary Contributors
        composers: [],
        producers: [],
        featuredArtists: [],
        backgroundVocalists: [],
        
        // Technical Contributors
        mixingEngineers: [],
        masteringEngineers: [],
        recordingEngineers: [],
        
        // Musicians
        keyboardists: [],
        guitarists: [],
        bassists: [],
        drummers: [],
        
        // Other
        executiveProducers: [],
        coProducers: [],
        assistantProducers: []
      },
      
      // Publishing Information
      publishingInfo: {
        publishers: [],
        publishingAdmins: [],
        pro: '',
        caeIpi: '',
        publisherIpi: '',
        publishingAdminIpi: '',
        bmWorkNumber: '',
        ascapWorkNumber: '',
        territory: 'Worldwide'
      },
      
      // Recording Details
      recordingInfo: {
        recordingStudio: '',
        masteringStudio: '',
        recordingDate: ''
      }
    }]
  });

  const [expandedAssets, setExpandedAssets] = useState([0]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // All dropdown options come from centralized constants

  // Add new asset
  const addAsset = () => {
    const newAsset = {
      ...formData.assets[0], // Copy structure from first asset
      songTitle: '',
      assetPosition: formData.assets.length + 1,
      contributors: {
        composers: [],
        producers: [],
        featuredArtists: [],
        backgroundVocalists: [],
        mixingEngineers: [],
        masteringEngineers: [],
        recordingEngineers: [],
        keyboardists: [],
        guitarists: [],
        bassists: [],
        drummers: [],
        executiveProducers: [],
        coProducers: [],
        assistantProducers: []
      }
    };

    setFormData(prev => ({
      ...prev,
      assets: [...prev.assets, newAsset]
    }));

    setExpandedAssets(prev => [...prev, formData.assets.length]);
  };

  // Remove asset
  const removeAsset = (index) => {
    if (formData.assets.length <= 1) return; // Don't allow removing the last asset
    
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.filter((_, i) => i !== index).map((asset, i) => ({
        ...asset,
        assetPosition: i + 1
      }))
    }));

    setExpandedAssets(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  // Update asset data
  const updateAsset = (assetIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.map((asset, i) => 
        i === assetIndex ? { ...asset, [field]: value } : asset
      )
    }));
  };

  // Update nested asset data (like contributors)
  const updateAssetNested = (assetIndex, section, field, value) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.map((asset, i) => 
        i === assetIndex ? {
          ...asset,
          [section]: {
            ...asset[section],
            [field]: value
          }
        } : asset
      )
    }));
  };

  // Add contributor to asset
  const addContributor = (assetIndex, contributorType) => {
    const newContributor = {
      id: Date.now(),
      name: '',
      role: contributorType,
      isni: '',
      pro: '',
      caeIpi: ''
    };

    setFormData(prev => ({
      ...prev,
      assets: prev.assets.map((asset, i) => 
        i === assetIndex ? {
          ...asset,
          contributors: {
            ...asset.contributors,
            [contributorType]: [...asset.contributors[contributorType], newContributor]
          }
        } : asset
      )
    }));
  };

  // Remove contributor from asset
  const removeContributor = (assetIndex, contributorType, contributorId) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.map((asset, i) => 
        i === assetIndex ? {
          ...asset,
          contributors: {
            ...asset.contributors,
            [contributorType]: asset.contributors[contributorType].filter(c => c.id !== contributorId)
          }
        } : asset
      )
    }));
  };

  // Update contributor data
  const updateContributor = (assetIndex, contributorType, contributorId, field, value) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.map((asset, i) => 
        i === assetIndex ? {
          ...asset,
          contributors: {
            ...asset.contributors,
            [contributorType]: asset.contributors[contributorType].map(c => 
              c.id === contributorId ? { ...c, [field]: value } : c
            )
          }
        } : asset
      )
    }));
  };

  // Copy contributors from one asset to another
  const copyContributors = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.map((asset, i) => 
        i === toIndex ? {
          ...asset,
          contributors: { ...prev.assets[fromIndex].contributors }
        } : asset
      )
    }));
  };

  // Toggle asset expansion
  const toggleAssetExpansion = (index) => {
    setExpandedAssets(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🎵 Release form submission started...', formData);
    setIsSubmitting(true);

    try {
      // Collect all unique contributors for roster population
      const allContributors = new Set();
      
      formData.assets.forEach(asset => {
        Object.values(asset.contributors).forEach(contributorArray => {
          contributorArray.forEach(contributor => {
            if (contributor.name.trim()) {
              allContributors.add(JSON.stringify({
                name: contributor.name,
                role: contributor.role,
                isni: contributor.isni || '',
                pro: contributor.pro || '',
                caeIpi: contributor.caeIpi || ''
              }));
            }
          });
        });
      });

      const submitData = {
        ...formData,
        allContributors: Array.from(allContributors).map(c => JSON.parse(c)),
        submissionDate: new Date().toISOString(),
        status: 'draft'
      };

      // Submit to API
      console.log('📤 Submitting to API:', submitData);
      
      const response = await fetch('/api/releases/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      console.log('📥 API Response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to create release: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Release created successfully:', result);
      console.log(`Added ${result.contributorsAdded.length} contributors to roster`);
      
      // Close modal on success
      onClose();
      
    } catch (error) {
      console.error('Error submitting release:', error);
      setErrors({ submit: 'Error creating release. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {existingRelease ? 'Edit Release' : 'Create New Release'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Project Level Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Release Title *
                </label>
                <input
                  type="text"
                  value={formData.releaseTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, releaseTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter release title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Release Type *
                </label>
                <select
                  value={formData.releaseType}
                  onChange={(e) => setFormData(prev => ({ ...prev, releaseType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {RELEASE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Artist *
                </label>
                <input
                  type="text"
                  value={formData.primaryArtist}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryArtist: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Primary artist name"
                  required
                />
              </div>

            </div>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Genre *
                </label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select primary genre</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Genre
                </label>
                <select
                  value={formData.secondaryGenre}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryGenre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select secondary genre (optional)</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Release Date *
                </label>
                <input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, releaseDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                {formData.releaseDate && (() => {
                  const today = new Date();
                  const releaseDate = new Date(formData.releaseDate);
                  let businessDays = 0;
                  const current = new Date(today);
                  
                  while (current < releaseDate) {
                    const dayOfWeek = current.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) businessDays++;
                    current.setDate(current.getDate() + 1);
                  }
                  
                  return businessDays < 20 ? (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>TIP:</strong> Set your release date 20 business days from today to give stores time to review your release
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Your release will go live on {releaseDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })} 12:00 AM in your listeners' timezones.
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pre-Order (Optional)
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="preOrder"
                        value="yes"
                        checked={formData.hasPreOrder === true}
                        onChange={(e) => setFormData(prev => ({ ...prev, hasPreOrder: true }))}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="preOrder"
                        value="no"
                        checked={formData.hasPreOrder === false}
                        onChange={(e) => setFormData(prev => ({ ...prev, hasPreOrder: false, preOrderDate: '' }))}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Best Practice:</strong> Set pre-order 2-4 weeks before release date for optimal campaign results
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Assets Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Assets ({formData.assets.length})
              </h3>
              <button
                type="button"
                onClick={addAsset}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Add Asset
              </button>
            </div>

            {formData.assets.map((asset, assetIndex) => (
              <div key={assetIndex} className="border border-gray-200 rounded-lg mb-4">
                <div 
                  className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleAssetExpansion(assetIndex)}
                >
                  <div className="flex items-center">
                    <FaMusic className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="font-medium">
                      Asset {asset.assetPosition}: {asset.songTitle || 'Untitled'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {formData.assets.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAsset(assetIndex);
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    )}
                    {expandedAssets.includes(assetIndex) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {expandedAssets.includes(assetIndex) && (
                  <div className="p-6">
                    {/* Code Group Asset Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Song Title *
                        </label>
                        <input
                          type="text"
                          value={asset.songTitle}
                          onChange={(e) => updateAsset(assetIndex, 'songTitle', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter song title"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Any Other Featuring Artists
                        </label>
                        <input
                          type="text"
                          value={asset.anyOtherFeaturingArtists}
                          onChange={(e) => updateAsset(assetIndex, 'anyOtherFeaturingArtists', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter featuring artists"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration *
                        </label>
                        <input
                          type="text"
                          value={asset.duration}
                          onChange={(e) => updateAsset(assetIndex, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="3:45"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Explicit
                        </label>
                        <select
                          value={asset.explicit ? 'Yes' : 'No'}
                          onChange={(e) => updateAsset(assetIndex, 'explicit', e.target.value === 'Yes')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Version
                        </label>
                        <input
                          type="text"
                          value={asset.version}
                          onChange={(e) => updateAsset(assetIndex, 'version', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Original, Remix, Acoustic, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          BPM
                        </label>
                        <input
                          type="number"
                          value={asset.bpm}
                          onChange={(e) => updateAsset(assetIndex, 'bpm', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="120"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Song Key
                        </label>
                        <select
                          value={asset.songKey}
                          onChange={(e) => updateAsset(assetIndex, 'songKey', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select key</option>
                          {SONG_KEYS.map(key => (
                            <option key={key} value={key}>{key}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mood Description
                        </label>
                        <input
                          type="text"
                          value={asset.moodDescription}
                          onChange={(e) => updateAsset(assetIndex, 'moodDescription', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Upbeat, Emotional, Energetic, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags
                        </label>
                        <input
                          type="text"
                          value={asset.tags}
                          onChange={(e) => updateAsset(assetIndex, 'tags', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="summer, party, love, etc."
                        />
                      </div>
                    </div>

                    {/* Language with conditional custom input */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          value={asset.language}
                          onChange={(e) => updateAsset(assetIndex, 'language', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {LANGUAGES.map(language => (
                            <option key={language} value={language}>{language}</option>
                          ))}
                        </select>
                        {(asset.language === 'Multiple Languages' || asset.language === 'Other') && (
                          <input
                            type="text"
                            value={asset.customLanguageDetails}
                            onChange={(e) => updateAsset(assetIndex, 'customLanguageDetails', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
                            placeholder={asset.language === 'Multiple Languages' ? 'Specify multiple languages' : 'Specify other language'}
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vocal Type
                        </label>
                        <select
                          value={asset.vocalType}
                          onChange={(e) => updateAsset(assetIndex, 'vocalType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select vocal type</option>
                          {VOCAL_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Lyrics */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lyrics
                      </label>
                      <textarea
                        value={asset.lyrics}
                        onChange={(e) => updateAsset(assetIndex, 'lyrics', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter song lyrics..."
                      />
                    </div>

                    {/* Asset Contributors - Dropdown Addition System */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-semibold text-gray-900">Asset Contributors</h4>
                        <div className="flex items-center space-x-2">
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                addContributor(assetIndex, e.target.value, { 
                                  name: '',
                                  role: e.target.value 
                                });
                                e.target.value = ''; // Reset dropdown
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
                      </div>
                      
                      {/* Dynamic contributor list */}
                      <div className="space-y-3">
                        {asset.contributors && Object.entries(asset.contributors).map(([contributorType, contributors]) => 
                          contributors.map((contributor, contributorIndex) => (
                            <div key={`${contributorType}-${contributorIndex}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                                  <input
                                    type="text"
                                    value={contributorType}
                                    disabled
                                    className="w-full px-2 py-1 border border-gray-200 rounded text-sm bg-gray-100"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                  <input
                                    type="text"
                                    value={contributor.name}
                                    onChange={(e) => updateContributor(assetIndex, contributorType, contributorIndex, 'name', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                                    placeholder="Enter name"
                                  />
                                </div>
                                <div className="flex items-end">
                                  <button
                                    type="button"
                                    onClick={() => removeContributor(assetIndex, contributorType, contributorIndex)}
                                    className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                        
                        {(!asset.contributors || Object.keys(asset.contributors).length === 0) && (
                          <p className="text-gray-500 text-sm italic">No contributors added yet. Use the dropdown above to add contributors.</p>
                        )}
                      </div>
                    </div>

                    {/* Code Group Technical Fields */}
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Technical Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Catalogue No.</label>
                          <input
                            type="text"
                            value={asset.catalogueNo}
                            onChange={(e) => updateAsset(assetIndex, 'catalogueNo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter catalogue number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                          <select
                            value={asset.format}
                            onChange={(e) => updateAsset(assetIndex, 'format', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Digital">Digital</option>
                            <option value="Physical">Physical</option>
                            <option value="Both">Both</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                          <select
                            value={asset.productType}
                            onChange={(e) => updateAsset(assetIndex, 'productType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Single">Single</option>
                            <option value="EP">EP</option>
                            <option value="Album">Album</option>
                            <option value="Compilation">Compilation</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Barcode</label>
                          <input
                            type="text"
                            value={asset.barcode}
                            onChange={(e) => updateAsset(assetIndex, 'barcode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter barcode"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tunecode</label>
                          <input
                            type="text"
                            value={asset.tunecode}
                            onChange={(e) => updateAsset(assetIndex, 'tunecode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter tunecode"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ICE Work Key</label>
                          <input
                            type="text"
                            value={asset.iceWorkKey}
                            onChange={(e) => updateAsset(assetIndex, 'iceWorkKey', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter ICE work key"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ISWC</label>
                          <input
                            type="text"
                            value={asset.iswc}
                            onChange={(e) => updateAsset(assetIndex, 'iswc', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter ISWC code"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ISRC</label>
                          <input
                            type="text"
                            value={asset.isrc}
                            onChange={(e) => updateAsset(assetIndex, 'isrc', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter ISRC code"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Recording Country</label>
                          <input
                            type="text"
                            value={asset.recordingCountry}
                            onChange={(e) => updateAsset(assetIndex, 'recordingCountry', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter recording country"
                          />
                        </div>
                      </div>

                      {/* BOWI Previously Released */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">BOWI Previously Released</label>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`bowiPrevious-${assetIndex}`}
                              value="yes"
                              checked={asset.bowiPreviouslyReleased === true}
                              onChange={(e) => updateAsset(assetIndex, 'bowiPreviouslyReleased', true)}
                              className="mr-2"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`bowiPrevious-${assetIndex}`}
                              value="no"
                              checked={asset.bowiPreviouslyReleased === false}
                              onChange={(e) => updateAsset(assetIndex, 'bowiPreviouslyReleased', false)}
                              className="mr-2"
                            />
                            No
                          </label>
                        </div>
                        
                        {asset.bowiPreviouslyReleased && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Previous Release Date</label>
                            <input
                              type="date"
                              value={asset.previousReleaseDate}
                              onChange={(e) => updateAsset(assetIndex, 'previousReleaseDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {assetIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => copyContributors(0, assetIndex)}
                            className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                          >
                            <FaCopy className="w-3 h-3 mr-1" />
                            Copy from Asset 1
                          </button>
                        )}
                      </div>

                      {/* Primary Contributors */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Producers */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Producers
                            </label>
                            <button
                              type="button"
                              onClick={() => addContributor(assetIndex, 'producers')}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              + Add
                            </button>
                          </div>
                          {asset.contributors.producers.map(contributor => (
                            <div key={contributor.id} className="flex items-center space-x-2 mb-2">
                              <input
                                type="text"
                                value={contributor.name}
                                onChange={(e) => updateContributor(assetIndex, 'producers', contributor.id, 'name', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Producer name"
                              />
                              <button
                                type="button"
                                onClick={() => removeContributor(assetIndex, 'producers', contributor.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <FaTrash className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Featured Artists */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Featured Artists
                            </label>
                            <button
                              type="button"
                              onClick={() => addContributor(assetIndex, 'featuredArtists')}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              + Add
                            </button>
                          </div>
                          {asset.contributors.featuredArtists.map(contributor => (
                            <div key={contributor.id} className="flex items-center space-x-2 mb-2">
                              <input
                                type="text"
                                value={contributor.name}
                                onChange={(e) => updateContributor(assetIndex, 'featuredArtists', contributor.id, 'name', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Featured artist name"
                              />
                              <button
                                type="button"
                                onClick={() => removeContributor(assetIndex, 'featuredArtists', contributor.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <FaTrash className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Composers */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Composers
                            </label>
                            <button
                              type="button"
                              onClick={() => addContributor(assetIndex, 'composers')}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              + Add
                            </button>
                          </div>
                          {asset.contributors.composers.map(contributor => (
                            <div key={contributor.id} className="flex items-center space-x-2 mb-2">
                              <input
                                type="text"
                                value={contributor.name}
                                onChange={(e) => updateContributor(assetIndex, 'composers', contributor.id, 'name', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Composer name"
                              />
                              <button
                                type="button"
                                onClick={() => removeContributor(assetIndex, 'composers', contributor.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <FaTrash className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Musicians */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Keyboardists
                            </label>
                            <button
                              type="button"
                              onClick={() => addContributor(assetIndex, 'keyboardists')}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              + Add
                            </button>
                          </div>
                          {asset.contributors.keyboardists.map(contributor => (
                            <div key={contributor.id} className="flex items-center space-x-2 mb-2">
                              <input
                                type="text"
                                value={contributor.name}
                                onChange={(e) => updateContributor(assetIndex, 'keyboardists', contributor.id, 'name', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Keyboardist name"
                              />
                              <button
                                type="button"
                                onClick={() => removeContributor(assetIndex, 'keyboardists', contributor.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <FaTrash className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Guitarists */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Guitarists
                            </label>
                            <button
                              type="button"
                              onClick={() => addContributor(assetIndex, 'guitarists')}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              + Add
                            </button>
                          </div>
                          {asset.contributors.guitarists.map(contributor => (
                            <div key={contributor.id} className="flex items-center space-x-2 mb-2">
                              <input
                                type="text"
                                value={contributor.name}
                                onChange={(e) => updateContributor(assetIndex, 'guitarists', contributor.id, 'name', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Guitarist name"
                              />
                              <button
                                type="button"
                                onClick={() => removeContributor(assetIndex, 'guitarists', contributor.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <FaTrash className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Engineers */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Mixing Engineers
                            </label>
                            <button
                              type="button"
                              onClick={() => addContributor(assetIndex, 'mixingEngineers')}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              + Add
                            </button>
                          </div>
                          {asset.contributors.mixingEngineers.map(contributor => (
                            <div key={contributor.id} className="flex items-center space-x-2 mb-2">
                              <input
                                type="text"
                                value={contributor.name}
                                onChange={(e) => updateContributor(assetIndex, 'mixingEngineers', contributor.id, 'name', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Mixing engineer name"
                              />
                              <button
                                type="button"
                                onClick={() => removeContributor(assetIndex, 'mixingEngineers', contributor.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <FaTrash className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Rights Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ISRC
                        </label>
                        <input
                          type="text"
                          value={asset.isrc}
                          onChange={(e) => updateAsset(assetIndex, 'isrc', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="USRC17607839"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Copyright Year
                        </label>
                        <input
                          type="number"
                          value={asset.copyrightYear}
                          onChange={(e) => updateAsset(assetIndex, 'copyrightYear', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                        />
                      </div>
                    </div>

                    {/* Explicit Content */}
                    <div className="mb-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={asset.explicit}
                          onChange={(e) => updateAsset(assetIndex, 'explicit', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">This track contains explicit content</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Release'}
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