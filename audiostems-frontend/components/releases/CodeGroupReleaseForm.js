// Code Group Distribution Partner Release Form
// Matches exact requirements from Code Group distribution partner

import { useState } from 'react';
import { GENRES } from '../../lib/constants';

export default function CodeGroupReleaseForm({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    // Artist Information
    companyName: '',
    legalNames: '',
    artistName: '',
    phoneticPronunciation: '',
    stylised: '',
    akaFka: '',
    artistType: 'Solo Artist',
    
    // Product Information
    productTitle: '',
    altTitle: '',
    
    // Release Information
    label: '', // Optional - defaults to MSC & Co if empty
    catalogueNo: '',
    format: 'Digital',
    productType: 'Single',
    barcode: '',
    tunecode: '',
    iceWorkKey: '',
    upc: '',
    releaseDate: '',
    preOrderDate: '', // Optional
    preReleaseDate: '',
    preReleaseUrl: '',
    releaseUrl: '',
    releaseLabel: 'MSC & Co',
    distributionCompany: 'MSC & Co',
    
    // Copyright
    copyrightYear: new Date().getFullYear(),
    copyrightOwner: '',
    pLine: '',
    cLine: '',
    
    // Assets (Tracks)
    assets: [{
      // Basic Track Info
      songTitle: '',
      trackPosition: 1,
      anyOtherFeaturingArtists: '',
      backGroundVocalists: '',
      duration: '',
      explicit: false,
      version: '',
      bpm: '',
      songKey: '',
      moodDescription: '',
      tags: '',
      lyrics: '',
      
      // Technical
      fileType: '.wav',
      audioFileName: '', // Distribution partner sets
      coverFileName: '', // Distribution partner sets
      language: 'English',
      vocalType: '',
      
      // Genre
      primaryGenre: '',
      subGenre: '',
      
      // Codes
      iswc: '',
      isrc: '',
      bowiPreviouslyReleased: false,
      previousReleaseDate: '',
      recordingCountry: '',
      
      // Contributors with Code Group fields
      composerAuthor: [{ name: '', role: 'Composer', pro: '', caeIpi: '', publishing: '', publisherIpi: '' }],
      executiveProducer: [{ name: '', pro: '', caeIpi: '' }],
      producer: [{ name: '', pro: '', caeIpi: '' }],
      mixingEngineer: [{ name: '', pro: '', caeIpi: '' }],
      masteringEngineer: [{ name: '', pro: '', caeIpi: '' }],
      coProducer: [{ name: '', pro: '', caeIpi: '' }],
      assistantProducer: [{ name: '', pro: '', caeIpi: '' }],
      engineer: [{ name: '', pro: '', caeIpi: '' }],
      editing: [{ name: '', pro: '', caeIpi: '' }],
      masteringStudio: '',
      recordingEngineer: [{ name: '', pro: '', caeIpi: '' }],
      additionalProduction: [{ name: '', pro: '', caeIpi: '' }],
      recordingStudio: '',
      
      // Musicians
      keyboards: [{ name: '', pro: '', caeIpi: '' }],
      programming: [{ name: '', pro: '', caeIpi: '' }],
      bass: [{ name: '', pro: '', caeIpi: '' }],
      drums: [{ name: '', pro: '', caeIpi: '' }],
      guitars: [{ name: '', pro: '', caeIpi: '' }],
      organ: [{ name: '', pro: '', caeIpi: '' }],
      percussion: [{ name: '', pro: '', caeIpi: '' }],
      strings: [{ name: '', pro: '', caeIpi: '' }],
      additionalInstrumentation: [{ name: '', pro: '', caeIpi: '' }],
      
      // Business
      designArtDirection: [{ name: '', pro: '', caeIpi: '' }],
      management: [{ name: '', pro: '', caeIpi: '' }],
      bookingAgent: [{ name: '', pro: '', caeIpi: '' }],
      pressContact: [{ name: '', email: '', phone: '' }],
      
      // Publishing
      publishing: [{ name: '', publisherIpi: '' }],
      publishingAdmin: [{ name: '', publishingAdminIpi: '' }],
      mechanical: [{ name: '' }],
      bmiWorkNumber: '',
      ascapWorkNumber: '',
      isni: '',
      subPublisher: [{ name: '' }],
      publishingType: 'Original',
      territory: 'Worldwide',
      
      // Contact Information
      primaryContactEmail: '',
      artistEmail: '',
      primaryContactPhone: '',
      secondaryContactPhone: '',
      
      // Online Presence
      wikipedia: '',
      socialMediaLink: '',
      shazam: '',
      tikTok: '',
      instagram: '',
      genius: '',
      allMusic: '',
      discogs: '',
      musicbrainz: '',
      imdb: '',
      jaxsta: '',
      website: '',
      youtube: '',
      youtubeMusicUrl: '',
      knowledgePanel: '',
      tourDates: '',
      spotifyUri: '',
      appleId: '',
      
      // Administrative
      digitalAssetsFolder: '',
      metadataApproved: false,
      initials: '',
      submittedToStores: false,
      luminate: '',
      mediabase: '',
      notes: ''
    }]
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Calculate business days for release date validation
  const calculateBusinessDays = (date) => {
    const today = new Date();
    const releaseDate = new Date(date);
    let count = 0;
    const current = new Date(today);
    
    while (current < releaseDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🎵 Code Group release form submission started...', formData);
    setLoading(true);
    
    try {
      // Set defaults for optional fields
      const submitData = {
        ...formData,
        label: formData.label || 'MSC & Co',
        distributionCompany: 'MSC & Co',
        releaseLabel: 'MSC & Co'
      };
      
      console.log('📤 Submitting to Code Group API:', submitData);
      
      const response = await fetch('/api/releases/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      console.log('📥 API Response:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Release created successfully:', result);
        onSuccess(result);
        onClose();
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        setErrors({ submit: `Error: ${response.status} ${errorText}` });
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const businessDaysUntilRelease = formData.releaseDate ? calculateBusinessDays(formData.releaseDate) : null;
  const showReleaseWarning = businessDaysUntilRelease !== null && businessDaysUntilRelease < 20;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Create New Release</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Artist Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Artist Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Legal Name/s</label>
                <input
                  type="text"
                  value={formData.legalNames}
                  onChange={(e) => setFormData(prev => ({ ...prev, legalNames: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter legal names"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Artist Name *</label>
                <input
                  type="text"
                  value={formData.artistName}
                  onChange={(e) => setFormData(prev => ({ ...prev, artistName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter artist name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phonetic Pronunciation</label>
                <input
                  type="text"
                  value={formData.phoneticPronunciation}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneticPronunciation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="How to pronounce artist name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stylised</label>
                <input
                  type="text"
                  value={formData.stylised}
                  onChange={(e) => setFormData(prev => ({ ...prev, stylised: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Stylised artist name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AKA/FKA</label>
                <input
                  type="text"
                  value={formData.akaFka}
                  onChange={(e) => setFormData(prev => ({ ...prev, akaFka: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Also known as / Formerly known as"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Artist Type</label>
                <select
                  value={formData.artistType}
                  onChange={(e) => setFormData(prev => ({ ...prev, artistType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Solo Artist">Solo Artist</option>
                  <option value="Band">Band</option>
                  <option value="Group">Group</option>
                  <option value="Duo">Duo</option>
                  <option value="Collective">Collective</option>
                </select>
              </div>
            </div>
          </div>

          {/* Release Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Release Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
                <input
                  type="text"
                  value={formData.productTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, productTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Name of the release/project"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Title</label>
                <input
                  type="text"
                  value={formData.altTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, altTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Alternative title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label (Optional)</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Defaults to MSC & Co if empty"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catalogue No.</label>
                <input
                  type="text"
                  value={formData.catalogueNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, catalogueNo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Catalogue number"
                />
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
                {showReleaseWarning && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>TIP:</strong> Set your release date 4 weeks from today to give stores time to review your release
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Your release will go live on {new Date(formData.releaseDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} 12:00 AM in your listeners' timezones.
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pre-Order Date (Optional)</label>
                <input
                  type="date"
                  value={formData.preOrderDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, preOrderDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Track Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Track Information</h3>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Track 1</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Genre *</label>
                  <select
                    value={formData.assets[0].primaryGenre}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: prev.assets.map((asset, i) => 
                        i === 0 ? { ...asset, primaryGenre: e.target.value } : asset
                      )
                    }))}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sub Genre</label>
                  <select
                    value={formData.assets[0].subGenre}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: prev.assets.map((asset, i) => 
                        i === 0 ? { ...asset, subGenre: e.target.value } : asset
                      )
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select sub genre (optional)</option>
                    {GENRES.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="explicit"
                    checked={formData.assets[0].explicit}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: prev.assets.map((asset, i) => 
                        i === 0 ? { ...asset, explicit: e.target.checked } : asset
                      )
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="explicit" className="text-sm font-medium text-gray-700">
                    Explicit Content
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={formData.assets[0].language}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: prev.assets.map((asset, i) => 
                        i === 0 ? { ...asset, language: e.target.value } : asset
                      )
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Other">Other</option>
                  </select>
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
