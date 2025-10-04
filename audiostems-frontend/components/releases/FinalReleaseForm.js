// Final Code Group Release Form - Complete & Working
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RELEASE_TYPES, GENRES, LANGUAGES, ASSET_CONTRIBUTOR_TYPES, RELEASE_CONTRIBUTOR_TYPES, SOCIAL_MEDIA_TYPES, OTHER_RELEASE_DETAIL_TYPES } from '../../lib/constants';
import FileUploader from '../FileUploader';

// Comprehensive country list (alphabetical)
const ALL_COUNTRIES = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CD', name: 'Congo (Democratic Republic)' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KP', name: 'Korea (North)' },
  { code: 'KR', name: 'Korea (South)' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'São Tomé and Príncipe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' }
];

export default function FinalReleaseForm({ isOpen, onClose, onSuccess, editingRelease = null }) {
  // Artist profile for pre-filling
  const [artistProfile, setArtistProfile] = useState(null);

  const [formData, setFormData] = useState({
    // Basic Release Info
    releaseTitle: '',
    releaseType: 'Single',
    primaryArtist: '',
    genre: '',
    secondaryGenre: '',
    releaseDate: '',
    hasPreOrder: false,
    preOrderDate: '',
    previouslyReleased: false,
    previousReleaseDate: '',
    
    // Other Release Details (optional)
    otherReleaseDetails: [],
    
    // File uploads
    coverArt: null,
    artworkUrl: '',
    artworkFilename: '',
    
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
    
    // Dynamic Arrays
    socialDetails: [],
    releaseContributors: [],
    
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
      contributors: [],
      audioFile: null,
      audioFileUrl: '',
      audioFilename: '',
      hasAppleLossless: false,
      appleLosslessFile: null,
      appleLosslessUrl: '',
      appleLosslessFilename: ''
    }]
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [userCountry, setUserCountry] = useState(null);

  // STEP 2: Load artist profile for pre-filling
  useEffect(() => {
    const loadArtistProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.warn('⚠️ No session found, cannot load profile');
          return;
        }

        console.log('🔄 Loading artist profile for form prefill...');
        const response = await fetch('/api/artist/profile', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (response.ok) {
          const profileData = await response.json();
          console.log('✅ Profile loaded:', profileData);
          setArtistProfile(profileData);

          // Validate that artist has a name set in profile
          if (!profileData.artistName && !profileData.artist_name) {
            console.warn('⚠️ Artist name not set in profile');
            setErrors({
              submit: 'Please set your artist name in your profile before creating a release. Go to Profile → Edit Profile to add your artist name.'
            });
          }

          // Pre-fill form with profile data (only if not editing existing release)
          if (!editingRelease) {
            const artistName = profileData.artistName || profileData.artist_name || '';
            const recordLabel = profileData.recordLabel || profileData.record_label || '';
            const primaryGenre = profileData.primaryGenre || profileData.primary_genre || '';
            const secondaryGenre = profileData.secondaryGenre || profileData.secondary_genre || '';

            setFormData(prev => ({
              ...prev,
              primaryArtist: artistName || prev.primaryArtist,
              label: recordLabel || prev.label,
              genre: primaryGenre || prev.genre,
              secondaryGenre: secondaryGenre || prev.secondaryGenre
            }));

            console.log('📋 Pre-filled release form with profile data:', {
              primaryArtist: artistName,
              label: recordLabel,
              genre: primaryGenre,
              secondaryGenre: secondaryGenre
            });
          }
        } else {
          console.error('❌ Failed to load profile:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('❌ Error loading artist profile for pre-fill:', error);
      }
    };

    if (isOpen) {
      loadArtistProfile();
    }
  }, [isOpen, editingRelease]);

  // Branded success notification function
  const showSuccessNotification = (message) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f0fdf4;
      border-left: 4px solid #065f46;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      z-index: 10000;
      max-width: 400px;
      font-family: 'Inter', sans-serif;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; color: #065f46;">
        <svg style="width: 20px; height: 20px; margin-right: 12px; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span style="font-weight: 600; font-size: 14px;">${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  // Populate form when editing existing release
  useEffect(() => {
    if (editingRelease && isOpen) {
      console.log('✏️ Loading existing release for editing:', editingRelease);
      console.log('🔍 editingRelease fields:', {
        id: editingRelease.id,
        title: editingRelease.title,
        artist_name: editingRelease.artist_name,
        release_date: editingRelease.release_date,
        genre: editingRelease.genre
      });
      console.log('🖼️ File URLs from database:');
      console.log('  - artwork_url:', editingRelease.artwork_url);
      console.log('  - audio_file_url:', editingRelease.audio_file_url);
      console.log('  - apple_lossless_url:', editingRelease.apple_lossless_url);
      console.log('🔍 All editingRelease keys:', Object.keys(editingRelease));
      console.log('🔍 Publishing info exists:', !!editingRelease.publishing_info);
      if (editingRelease.publishing_info) {
        try {
          const publishingData = JSON.parse(editingRelease.publishing_info);
          console.log('🔍 Publishing info file URLs:');
          console.log('  - artworkUrl:', publishingData.artworkUrl);
          console.log('  - audioFileUrl:', publishingData.audioFileUrl);
          console.log('  - appleLosslessUrl:', publishingData.appleLosslessUrl);
        } catch (e) {
          console.log('🔍 Publishing info parse error:', e);
        }
      }
      
      // Reset form to defaults first, then populate with existing data
      // Try to load complete form data from publishing_info if available
      let savedFormData = {};
      if (editingRelease.publishing_info) {
        try {
          savedFormData = JSON.parse(editingRelease.publishing_info);
          console.log('📊 Loaded saved form data:', savedFormData);
        } catch (e) {
          console.warn('⚠️ Could not parse publishing_info:', e);
        }
      }

      setFormData({
        // Basic Release Info - use saved form data first, then database fields
        releaseTitle: savedFormData.releaseTitle || editingRelease.title || editingRelease.releaseTitle || '',
        releaseType: savedFormData.releaseType || editingRelease.release_type || editingRelease.releaseType || 'Single',
        primaryArtist: savedFormData.primaryArtist || editingRelease.artist_name || editingRelease.primaryArtist || editingRelease.artist || '',
        genre: savedFormData.genre || editingRelease.genre || '',
        secondaryGenre: savedFormData.secondaryGenre || editingRelease.subgenre || editingRelease.secondaryGenre || '',
        releaseDate: savedFormData.releaseDate || editingRelease.release_date || editingRelease.releaseDate || '',
        hasPreOrder: savedFormData.hasPreOrder || editingRelease.hasPreOrder || false,
        preOrderDate: savedFormData.preOrderDate || editingRelease.preOrderDate || '',
        previouslyReleased: savedFormData.previouslyReleased || editingRelease.previouslyReleased || false,
        previousReleaseDate: savedFormData.previousReleaseDate || editingRelease.previousReleaseDate || '',
        
        // Advanced Details
        label: savedFormData.label || editingRelease.label || '',
        upc: savedFormData.upc || editingRelease.upc || '',
        sellWorldwide: savedFormData.sellWorldwide !== undefined ? savedFormData.sellWorldwide : (editingRelease.sellWorldwide !== false),
        territoryRestrictionType: savedFormData.territoryRestrictionType || editingRelease.territoryRestrictionType || 'exclude',
        territoryRestrictions: savedFormData.territoryRestrictions || editingRelease.territoryRestrictions || [],
        
        // Distribution Details  
        digitalAssetsFolder: editingRelease.digitalAssetsFolder || '',
        metadataApproved: editingRelease.metadataApproved || false,
        initials: editingRelease.initials || '',
        submittedToStores: editingRelease.submittedToStores || false,
        luminate: editingRelease.luminate || '',
        mediabase: editingRelease.mediabase || '',
        notes: editingRelease.notes || '',
        
        // Dynamic Arrays
        socialDetails: editingRelease.socialDetails || [],
        releaseContributors: editingRelease.releaseContributors || [],
        otherReleaseDetails: editingRelease.otherReleaseDetails || [],
        
        // File uploads
        coverArt: null,
        artworkUrl: editingRelease.artwork_url || editingRelease.artworkUrl || savedFormData.artworkUrl || '',
        artworkFilename: editingRelease.artwork_filename || editingRelease.artworkFilename || savedFormData.artworkFilename || '',
        
        // Assets
        assets: editingRelease.assets || [{
          songTitle: editingRelease.songTitle || '',
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
          contributors: [],
          audioFile: null,
          audioFileUrl: editingRelease.audio_file_url || savedFormData.assets?.[0]?.audioFileUrl || '',
          audioFilename: editingRelease.audio_file_name || savedFormData.assets?.[0]?.audioFilename || '',
          hasAppleLossless: !!(editingRelease.apple_lossless_url || savedFormData.assets?.[0]?.appleLosslessUrl),
          appleLosslessFile: null,
          appleLosslessUrl: editingRelease.apple_lossless_url || savedFormData.assets?.[0]?.appleLosslessUrl || '',
          appleLosslessFilename: editingRelease.apple_lossless_filename || savedFormData.assets?.[0]?.appleLosslessFilename || ''
        }]
      });
      
      console.log('✅ Form populated with existing release data');
      console.log('🔍 Final form values:');
      console.log('  - artworkUrl:', editingRelease.artworkUrl || editingRelease.artwork_url || '(empty)');
      console.log('  - audioFileUrl:', editingRelease.assets?.[0]?.audioFileUrl || editingRelease.audio_file_url || '(empty)');
      console.log('  - appleLosslessUrl:', editingRelease.assets?.[0]?.appleLosslessUrl || editingRelease.apple_lossless_url || '(empty)');
    }
  }, [editingRelease, isOpen]);

  // Geolocation detection
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country) {
          setUserCountry(data.country);
          console.log('🌍 Detected user country:', data.country, data.country_name);
        }
      } catch (error) {
        console.log('🌍 Geolocation detection failed (using default order):', error);
        // Fallback - no geolocation
      }
    };
    
    if (isOpen && !editingRelease) { // Only detect location for new releases
      detectLocation();
    }
  }, [isOpen, editingRelease]);


  // Create country list with user's country at top
  const getCountryList = () => {
    if (!userCountry) return ALL_COUNTRIES;
    
    const userCountryObj = ALL_COUNTRIES.find(c => c.code === userCountry);
    if (!userCountryObj) return ALL_COUNTRIES;
    
    const otherCountries = ALL_COUNTRIES.filter(c => c.code !== userCountry);
    return [userCountryObj, ...otherCountries];
  };

  // Helper functions
  const addSocialDetail = (type) => {
    setFormData(prev => ({
      ...prev,
      socialDetails: [...prev.socialDetails, { type, value: '' }]
    }));
  };

  const addReleaseContributor = (type) => {
    setFormData(prev => ({
      ...prev,
      releaseContributors: [...prev.releaseContributors, { type, value: '' }]
    }));
  };

  const addOtherReleaseDetail = (type) => {
    setFormData(prev => ({
      ...prev,
      otherReleaseDetails: [...prev.otherReleaseDetails, { type, value: '' }]
    }));
  };

  const addAssetContributor = (type) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.map((asset, i) => 
        i === 0 ? {
          ...asset,
          contributors: [...asset.contributors, { type, name: '' }]
        } : asset
      )
    }));
  };


  // Save to draft function
  const saveToDraft = async () => {
    // Prevent multiple simultaneous calls
    if (saving) {
      console.log('⏸️ Save already in progress, ignoring duplicate call');
      return;
    }

    console.log('🔥 saveToDraft ENTRY - Component props:', {
      hasEditingRelease: !!editingRelease,
      editingReleaseId: editingRelease?.id,
      currentFormTitle: formData.releaseTitle
    });
    console.log('💾 Save to draft called:', { releaseTitle: formData.releaseTitle });
    console.log('🔍 SAVE DEBUG - Form data file URLs:');
    console.log('  - formData.artworkUrl:', formData.artworkUrl);
    console.log('  - formData.assets[0].audioFileUrl:', formData.assets[0]?.audioFileUrl);
    console.log('  - formData.assets[0].appleLosslessUrl:', formData.assets[0]?.appleLosslessUrl);

    // Validation
    if (!formData.releaseTitle) {
      console.error('❌ Cannot save - Release Title required');
      setErrors({ submit: 'Release Title is required to save' });
      return;
    }

    if (!formData.primaryArtist) {
      console.error('❌ Cannot save - Artist Name required');
      setErrors({ submit: 'Artist name is required. Please set your artist name in your profile first.' });
      return;
    }
    
    setSaving(true);
    setErrors({});
    
    try {
      // Simplified data structure for draft save
      const draftData = {
        releaseTitle: formData.releaseTitle,
        releaseType: formData.releaseType,
        primaryArtist: formData.primaryArtist,
        genre: formData.genre,
        secondaryGenre: formData.secondaryGenre,
        releaseDate: formData.releaseDate,
        hasPreOrder: formData.hasPreOrder,
        preOrderDate: formData.preOrderDate,
        label: formData.label || 'MSC & Co',
        status: 'draft',
        // File URLs from uploads
        artworkUrl: formData.artworkUrl,
        artworkFilename: formData.artworkFilename,
        assets: [{
          songTitle: formData.assets[0].songTitle,
          anyOtherFeaturingArtists: formData.assets[0].anyOtherFeaturingArtists,
          duration: formData.assets[0].duration,
          explicit: formData.assets[0].explicit,
          version: formData.assets[0].version,
          bpm: formData.assets[0].bpm,
          language: formData.assets[0].language,
          isrc: formData.assets[0].isrc,
          contributors: formData.assets[0].contributors || [],
          audioFileUrl: formData.assets[0].audioFileUrl,
          audioFilename: formData.assets[0].audioFilename,
          appleLosslessUrl: formData.assets[0].appleLosslessUrl,
          appleLosslessFilename: formData.assets[0].appleLosslessFilename
        }]
      };

      console.log('📤 Saving draft data:', draftData);

      // Match the exact API structure from admin/releases
      const apiData = {
        artistId: '0a060de5-1c94-4060-a1c2-860224fc348d', // Henry's ID
        title: draftData.releaseTitle,
        artist: draftData.primaryArtist,
        featuring: draftData.assets[0]?.anyOtherFeaturingArtists || null,
        releaseDate: draftData.releaseDate,
        releaseType: draftData.releaseType,
        audioFileUrl: null, // Will be uploaded later
        coverImageUrl: null, // Will be uploaded later
        isLive: false
      };

      // Determine if we're editing an existing release or creating new one
      const isEditing = editingRelease && editingRelease.id;
      console.log('🔍 DEBUG - saveToDraft called with:', {
        isEditing,
        editingReleaseId: editingRelease?.id,
        editingReleaseTitle: editingRelease?.title,
        hasEditingRelease: !!editingRelease,
        editingReleaseKeys: editingRelease ? Object.keys(editingRelease) : 'none'
      });
      console.log('🔍 FULL editingRelease object:', editingRelease);
      console.log(`${isEditing ? '✏️ Updating existing' : '🆕 Creating new'} release`, { isEditing, releaseId: editingRelease?.id });

      // Get auth token for API calls
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders = session?.access_token
        ? {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        : { 'Content-Type': 'application/json' };

      let response;
      if (isEditing) {
        // Update existing release
        response = await fetch('/api/releases/simple-update', {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({
            id: editingRelease.id,
            releaseTitle: draftData.releaseTitle,
            primaryArtist: draftData.primaryArtist,
            releaseType: draftData.releaseType,
            genre: draftData.genre,
            releaseDate: draftData.releaseDate,
            songTitle: draftData.assets[0].songTitle,
            // Include additional form fields
            secondaryGenre: draftData.secondaryGenre,
            hasPreOrder: draftData.hasPreOrder,
            preOrderDate: draftData.preOrderDate,
            previouslyReleased: draftData.previouslyReleased,
            previousReleaseDate: draftData.previousReleaseDate,
            label: draftData.label,
            upc: draftData.upc,
            sellWorldwide: draftData.sellWorldwide,
            territoryRestrictionType: draftData.territoryRestrictionType,
            territoryRestrictions: draftData.territoryRestrictions,
            // Pass complete form data
            ...draftData
          })
        });
      } else {
        // Create new release
        const savePayload = {
            releaseTitle: draftData.releaseTitle,
            primaryArtist: draftData.primaryArtist,
            releaseType: draftData.releaseType,
            genre: draftData.genre,
            releaseDate: draftData.releaseDate,
            songTitle: draftData.assets[0].songTitle,
            // Include additional form fields
            secondaryGenre: draftData.secondaryGenre,
            hasPreOrder: draftData.hasPreOrder,
            preOrderDate: draftData.preOrderDate,
            previouslyReleased: draftData.previouslyReleased,
            previousReleaseDate: draftData.previousReleaseDate,
            label: draftData.label,
            upc: draftData.upc,
            sellWorldwide: draftData.sellWorldwide,
            territoryRestrictionType: draftData.territoryRestrictionType,
            territoryRestrictions: draftData.territoryRestrictions,
            // Pass complete form data
            ...draftData
        };
        
        console.log('🔍 SAVE PAYLOAD DEBUG - Data being sent to API:');
        console.log('  - artworkUrl:', savePayload.artworkUrl);
        console.log('  - audioFileUrl:', savePayload.audioFileUrl);
        console.log('  - appleLosslessUrl:', savePayload.appleLosslessUrl);
        console.log('  - assets[0].audioFileUrl:', savePayload.assets?.[0]?.audioFileUrl);
        console.log('  - assets[0].appleLosslessUrl:', savePayload.assets?.[0]?.appleLosslessUrl);
        
        response = await fetch('/api/releases/simple-save', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(savePayload)
        });
      }

      console.log('📥 Save response:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Draft saved successfully:', result);
        
        // Show branded success notification instead of browser alert
        showSuccessNotification('Release saved to draft!');
        
        // Notify parent component and close modal
        console.log('📞 Calling onSuccess with result:', result.data || result);
        if (onSuccess) {
          onSuccess(result.data || result);
        }
        onClose();
        return result;
      } else {
        const errorText = await response.text();
        console.error('❌ Save failed:', response.status, errorText);
        throw new Error(`Save failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Save to draft error:', error);
      setErrors({ submit: `Save failed: ${error.message}` });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Submit for review function
  const handleSubmitForReview = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to submit this release for review?\n\n' +
      'Once submitted:\n' +
      '• The release will be locked for editing\n' +
      '• Admins will be notified to review your submission\n' +
      '• You cannot make changes until review is complete\n\n' +
      'Make sure all information is correct before proceeding.'
    );

    if (!confirmed) {
      return;
    }

    // Validate required fields
    const validationErrors = [];
    if (!formData.releaseTitle) validationErrors.push('Release title is required');
    if (!formData.primaryArtist) validationErrors.push('Primary artist is required');
    if (!formData.genre) validationErrors.push('Primary genre is required');
    if (!formData.releaseDate) validationErrors.push('Release date is required');
    if (!formData.artworkUrl) validationErrors.push('Cover artwork is required');
    if (!formData.assets[0]?.songTitle) validationErrors.push('Song title is required');
    if (!formData.assets[0]?.duration) validationErrors.push('Track duration is required');
    if (!formData.assets[0]?.audioFileUrl) validationErrors.push('Audio file is required');

    if (validationErrors.length > 0) {
      setErrors({ submit: `Please complete required fields:\n${validationErrors.join('\n')}` });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      // First save the current form data
      console.log('💾 Saving release before submission...');
      const saveResult = await saveToDraft();

      if (!saveResult) {
        throw new Error('Failed to save release before submission');
      }

      const releaseId = editingRelease?.id || saveResult.data?.id;

      if (!releaseId) {
        throw new Error('No release ID available for submission');
      }

      console.log('📤 Submitting release for review:', releaseId);

      // Get auth token for submission API call
      const { data: { session } } = await supabase.auth.getSession();
      const submitHeaders = session?.access_token
        ? {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        : { 'Content-Type': 'application/json' };

      // Submit for review
      const response = await fetch('/api/releases/submit', {
        method: 'POST',
        headers: submitHeaders,
        body: JSON.stringify({ release_id: releaseId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Submission failed');
      }

      const result = await response.json();
      console.log('✅ Release submitted successfully:', result);

      // Show success notification
      showSuccessNotification('Release submitted for review! Admins have been notified.');

      // Notify parent and close
      if (onSuccess) {
        onSuccess(result.data || result);
      }
      onClose();

    } catch (error) {
      console.error('❌ Submit for review error:', error);
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

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
    console.log('🎵 Final release form submission:', formData);
    
    // Validate pre-order date
    if (formData.hasPreOrder && formData.preOrderDate && formData.releaseDate) {
      if (new Date(formData.preOrderDate) >= new Date(formData.releaseDate)) {
        setErrors({ submit: 'Pre-order date must be before release date' });
        return;
      }
    }
    
    setLoading(true);
    
    try {
      // Transform contributors to match API expectations
      const transformedAssets = formData.assets.map(asset => ({
        ...asset,
        contributors: {
          // Group contributors by type for API compatibility
          ...asset.contributors.reduce((acc, contributor) => {
            const type = contributor.type;
            if (!acc[type]) acc[type] = [];
            acc[type].push({
              name: contributor.name,
              role: contributor.type,
              isni: '',
              pro: '',
              caeIpi: ''
            });
            return acc;
          }, {})
        }
      }));

      const submitData = {
        ...formData,
        label: formData.label || 'MSC & Co',
        distributionCompany: 'MSC & Co',
        releaseLabel: 'MSC & Co',
        status: 'draft',
        assets: transformedAssets
      };
      
      console.log('📤 Submitting to API:', submitData);
      
      // Determine if creating new or updating existing
      const isEditing = editingRelease && editingRelease.id;
      const apiUrl = isEditing ? `/api/releases/${editingRelease.id}` : '/api/releases/create';
      const method = isEditing ? 'PUT' : 'POST';

      console.log(`${isEditing ? '✏️ Updating' : '🆕 Creating'} release:`, apiUrl);

      // Get auth token for API call
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders = session?.access_token
        ? {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        : { 'Content-Type': 'application/json' };

      const response = await fetch(apiUrl, {
        method: method,
        headers: authHeaders,
        body: JSON.stringify(submitData)
      });
      
      console.log('📥 API Response:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Release created successfully:', result);
        if (onSuccess) onSuccess(result);
        onClose();
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        setErrors({ submit: `Error: ${response.status} - ${errorText}` });
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
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editingRelease ? 'Edit Release' : 'Create New Release'}
            </h2>
            
            {/* Save Draft button at the top */}
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (saving) {
                  console.log('⏸️ Save button clicked but save already in progress');
                  return;
                }

                console.log('💾 Save Draft button clicked');
                try {
                  await saveToDraft();
                } catch (error) {
                  console.error('Save failed:', error);
                }
              }}
              disabled={!formData.releaseTitle || !formData.primaryArtist || loading || saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z" />
              </svg>
              <span>Save Draft</span>
            </button>
          </div>
          
          {/* Close X button on the right */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form id="releaseForm" onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Warning if artist name not set in profile */}
          {artistProfile && !formData.primaryArtist && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Artist Name Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Your artist name is not set in your profile. Please{' '}
                      <a href="/artist/profile" className="font-medium underline hover:text-yellow-600">
                        update your profile
                      </a>{' '}
                      to add your artist name before creating a release.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Project Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  Primary Artist *
                  {artistProfile && (
                    <svg className="w-4 h-4 ml-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.primaryArtist}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryArtist: e.target.value }))}
                  disabled={!!artistProfile}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    artistProfile
                      ? 'bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed'
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
                  placeholder="Enter primary artist name"
                  required
                  title={artistProfile ? "Artist name is locked and comes from your profile" : ""}
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
                      })} 12:00 AM in your listeners timezones.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Pre-Order */}
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
                      max={formData.releaseDate ? new Date(new Date(formData.releaseDate).getTime() - 24*60*60*1000).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, preOrderDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>Best Practice:</strong> Set pre-order 2-4 weeks before release date for optimal campaign results
                    </p>
                    {formData.preOrderDate && formData.releaseDate && new Date(formData.preOrderDate) >= new Date(formData.releaseDate) && (
                      <p className="text-xs text-red-600 mt-1">
                        <strong>Error:</strong> Pre-order date must be before release date
                      </p>
                    )}
                  </div>
                )}
            </div>
          </div>

          {/* Other Release Details (Optional) */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Release Details (Optional)</h3>
            <div className="flex items-center space-x-2 mb-4">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addOtherReleaseDetail(e.target.value);
                    e.target.selectedIndex = 0;
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Add Release Detail...</option>
                {OTHER_RELEASE_DETAIL_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2 mb-6">
              {formData.otherReleaseDetails.map((detail, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={detail.type}
                      disabled
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm bg-gray-100"
                    />
                    <input
                      type="text"
                      value={detail.value}
                      onChange={(e) => {
                        const newDetails = [...formData.otherReleaseDetails];
                        newDetails[index].value = e.target.value;
                        setFormData(prev => ({ ...prev, otherReleaseDetails: newDetails }));
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder={`Enter ${detail.type.toLowerCase()}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      otherReleaseDetails: prev.otherReleaseDetails.filter((_, i) => i !== index)
                    }))}
                    className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              {formData.otherReleaseDetails.length === 0 && (
                <p className="text-gray-500 text-sm italic">No release details added yet. Use the dropdown above to add technical details.</p>
              )}
            </div>
          </div>

          {/* Artwork Upload */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Artwork</h3>
            <div className="border border-gray-200 rounded-lg p-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Art *</label>
                <FileUploader
                  type="artwork"
                  required={true}
                  currentFile={formData.artworkUrl}
                  onUpload={(url, filename) => {
                    console.log('🎨 Artwork onUpload callback triggered with:', { url, filename });
                    setFormData(prev => {
                      console.log('🎨 Setting artworkUrl in form data:', url);
                      return {
                        ...prev,
                        artworkUrl: url,
                        artworkFilename: filename
                      };
                    });
                  }}
                />
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Best Practice:</strong> Upload high-resolution artwork (minimum 3000x3000 pixels, square format)
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Accepted formats: JPG, PNG, TIFF. File size should be under 10MB for optimal processing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Complete Asset Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assets (1)</h3>
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Asset 1: {formData.assets[0].songTitle || 'Untitled'}</h4>
              
              {/* Basic Asset Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Song Title *</label>
                  <input
                    type="text"
                    value={formData.assets[0].songTitle}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: [{ ...prev.assets[0], songTitle: e.target.value }]
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
                      assets: [{ ...prev.assets[0], anyOtherFeaturingArtists: e.target.value }]
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
                      assets: [{ ...prev.assets[0], duration: e.target.value }]
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="3:45"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Explicit</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="explicit"
                        checked={formData.assets[0].explicit === true}
                        onChange={() => setFormData(prev => ({
                          ...prev,
                          assets: [{ ...prev.assets[0], explicit: true }]
                        }))}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="explicit"
                        checked={formData.assets[0].explicit === false}
                        onChange={() => setFormData(prev => ({
                          ...prev,
                          assets: [{ ...prev.assets[0], explicit: false }]
                        }))}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                  <select
                    value={formData.assets[0].version}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: [{ ...prev.assets[0], version: e.target.value }]
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select version</option>
                    <option value="Original">Original</option>
                    <option value="Remix">Remix</option>
                    <option value="Acoustic">Acoustic</option>
                    <option value="Instrumental">Instrumental</option>
                    <option value="Radio Edit">Radio Edit</option>
                    <option value="Extended Mix">Extended Mix</option>
                    <option value="Live">Live</option>
                    <option value="Demo">Demo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">BPM</label>
                  <input
                    type="number"
                    value={formData.assets[0].bpm}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: [{ ...prev.assets[0], bpm: e.target.value }]
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="120"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={formData.assets[0].language}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: [{ ...prev.assets[0], language: e.target.value, customLanguageDetails: '' }]
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
                        assets: [{ ...prev.assets[0], customLanguageDetails: e.target.value }]
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-2"
                      placeholder={formData.assets[0].language === 'Multiple Languages' ? 'Specify multiple languages' : 'Specify other language'}
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ISRC</label>
                  <input
                    type="text"
                    value={formData.assets[0].isrc}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      assets: [{ ...prev.assets[0], isrc: e.target.value }]
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter ISRC code"
                  />
                  <p className="text-xs text-gray-500 mt-1">If you have one, please enter it above. Otherwise, we will generate one for you.</p>
                </div>
              </div>

              {/* Audio File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Audio File *</label>
                <FileUploader
                  type="audio"
                  required={true}
                  currentFile={formData.assets[0]?.audioFileUrl}
                  onUpload={(url, filename) => {
                    console.log('🎵 Audio onUpload callback triggered with:', { url, filename });
                    setFormData(prev => {
                      console.log('🎵 Setting audioFileUrl in form data:', url);
                      return {
                        ...prev,
                        assets: [{
                          ...prev.assets[0],
                          audioFileUrl: url,
                          audioFilename: filename
                        }]
                      };
                    });
                  }}
                />
                <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Required:</strong> WAV format only for professional distribution
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Minimum quality: 16-bit/44.1kHz or higher. 24-bit/48kHz recommended for best results.
                  </p>
                </div>
              </div>

              {/* Apple Lossless (Optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Apple Lossless (Optional)</label>
                <div className="flex items-center space-x-4 mb-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="appleLossless"
                      checked={formData.assets[0].hasAppleLossless === true}
                      onChange={() => setFormData(prev => ({
                        ...prev,
                        assets: [{ ...prev.assets[0], hasAppleLossless: true }]
                      }))}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="appleLossless"
                      checked={formData.assets[0].hasAppleLossless === false}
                      onChange={() => setFormData(prev => ({
                        ...prev,
                        assets: [{ ...prev.assets[0], hasAppleLossless: false, appleLosslessFile: null }]
                      }))}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
                
                {formData.assets[0].hasAppleLossless && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apple Lossless File</label>
                    <FileUploader
                      type="audio"
                      restrictToALAC={true}
                      required={false}
                      currentFile={formData.assets[0]?.appleLosslessUrl}
                      onUpload={(url, filename) => {
                        console.log('🎧 Apple Lossless onUpload callback triggered with:', { url, filename });
                        setFormData(prev => {
                          console.log('🎧 Setting appleLosslessUrl in form data:', url);
                          return {
                            ...prev,
                            assets: [{
                              ...prev.assets[0],
                              appleLosslessUrl: url,
                              appleLosslessFilename: filename
                            }]
                          };
                        });
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload Apple Lossless (.m4a) or ALAC format for enhanced quality on Apple Music
                    </p>
                  </div>
                )}
              </div>

              {/* Asset Contributors */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Asset Contributors</h4>
                <div className="flex items-center space-x-2 mb-4">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addAssetContributor(e.target.value);
                        e.target.selectedIndex = 0;
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
                  {formData.assets[0].contributors.map((contributor, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={contributor.type}
                          disabled
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm bg-gray-100"
                        />
                        <input
                          type="text"
                          value={contributor.name}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            assets: [{
                              ...prev.assets[0],
                              contributors: prev.assets[0].contributors.map((c, i) => 
                                i === index ? { ...c, name: e.target.value } : c
                              )
                            }]
                          }))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter name"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          assets: [{
                            ...prev.assets[0],
                            contributors: prev.assets[0].contributors.filter((_, i) => i !== index)
                          }]
                        }))}
                        className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  {formData.assets[0].contributors.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No contributors added yet. Use the dropdown above to add contributors.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Social Details (Optional) */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Details (Optional)</h3>
            <div className="flex items-center space-x-2 mb-4">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addSocialDetail(e.target.value);
                    e.target.selectedIndex = 0;
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Add Social Media...</option>
                {SOCIAL_MEDIA_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2 mb-6">
              {formData.socialDetails.map((social, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={social.type}
                      disabled
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm bg-gray-100"
                    />
                    <input
                      type="text"
                      value={social.value}
                      onChange={(e) => {
                        const newSocials = [...formData.socialDetails];
                        newSocials[index].value = e.target.value;
                        setFormData(prev => ({ ...prev, socialDetails: newSocials }));
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      placeholder={`Enter ${social.type.toLowerCase()}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      socialDetails: prev.socialDetails.filter((_, i) => i !== index)
                    }))}
                    className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              {formData.socialDetails.length === 0 && (
                <p className="text-gray-500 text-sm italic">No social media added yet. Use the dropdown above to add social media links.</p>
              )}
            </div>
          </div>

          {/* Advanced Details (Optional) */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Details (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Label Name"
                />
                <p className="text-xs text-gray-500 mt-1">If empty, will show as MSC & Co to distribution partner</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPC</label>
                <input
                  type="text"
                  value={formData.upc}
                  onChange={(e) => setFormData(prev => ({ ...prev, upc: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter UPC code"
                />
                <p className="text-xs text-gray-500 mt-1">If you have one, please enter it above. Otherwise, we will generate one for you.</p>
              </div>
            </div>

            {/* Territory Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sell this release worldwide?</label>
              <div className="flex items-center space-x-4 mb-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sellWorldwide"
                    checked={formData.sellWorldwide === true}
                    onChange={() => setFormData(prev => ({ ...prev, sellWorldwide: true, territoryRestrictions: [] }))}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sellWorldwide"
                    checked={formData.sellWorldwide === false}
                    onChange={() => setFormData(prev => ({ ...prev, sellWorldwide: false }))}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              
              {formData.sellWorldwide === false && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-3">
                    {formData.territoryRestrictionType === 'exclude' 
                      ? 'The release will not be sold in the selected countries/territories.'
                      : 'The release will only be sold in the selected countries/territories.'
                    }
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Territory Restriction Type</label>
                      <select
                        value={formData.territoryRestrictionType}
                        onChange={(e) => setFormData(prev => ({ ...prev, territoryRestrictionType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="exclude">Exclude</option>
                        <option value="include">Include Only</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Countries/Territories</label>
                      <select
                        multiple
                        value={formData.territoryRestrictions}
                        onChange={(e) => {
                          const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                          setFormData(prev => ({ ...prev, territoryRestrictions: selectedOptions }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-40"
                        size={10}
                      >
                        {getCountryList().map((country, index) => (
                          <option 
                            key={country.code} 
                            value={country.code}
                            className={index === 0 && userCountry === country.code ? 'font-bold bg-blue-50' : ''}
                          >
                            {country.name} ({country.code})
                            {index === 0 && userCountry === country.code ? ' - Your Location' : ''}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl (PC) or Cmd (Mac) to select multiple countries</p>
                    </div>
                  </div>
                </div>
              )}
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
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (saving) {
                  console.log('⏸️ Save button clicked but save already in progress');
                  return;
                }

                console.log('💾 Save Draft button clicked');
                try {
                  await saveToDraft();
                } catch (error) {
                  console.error('Manual save failed:', error);
                }
              }}
              disabled={!formData.releaseTitle || !formData.primaryArtist || loading || saving || submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z" />
              </svg>
              <span>Save Draft</span>
            </button>

            {/* Submit for Review button - only show for draft releases */}
            {(!editingRelease || editingRelease.status === 'draft') && (
              <button
                type="button"
                onClick={handleSubmitForReview}
                disabled={!formData.releaseTitle || !formData.primaryArtist || loading || saving || submitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Submit for Review</span>
                  </>
                )}
              </button>
            )}

            <button
              type="submit"
              disabled={loading || submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (editingRelease ? 'Updating...' : 'Creating...') : (editingRelease ? 'Update Release' : 'Create Release')}
            </button>
          </div>
          
          {errors.submit && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm whitespace-pre-line">{errors.submit}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
