import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Send, 
  Upload, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Music,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  Users,
  Globe,
  FileText,
  Edit3
} from 'lucide-react';

const ComprehensiveReleaseForm = ({ 
  release = null, 
  onSave, 
  onSubmit,
  isEditing = true,
  isSaving = false,
  isSubmitting = false,
  errors = {},
  userRole = 'artist',
  autoSaveEnabled = true
}) => {
  // Form state management
  const [formData, setFormData] = useState({
    // Basic Release Information
    projectName: '',
    artistName: '',
    releaseTitle: '',
    releaseType: 'single',
    primaryGenre: '',
    secondaryGenres: [],
    language: 'English',
    releaseDate: '',
    originalReleaseDate: '',
    
    // Catalog & Identification
    catalogueNo: '',
    barcode: '',
    upc: '',
    isrc: '',
    tunecode: '',
    iceWorkKey: '',
    iswc: '',
    bowi: '',
    
    // Publishing Information
    composer: '',
    lyricist: '',
    publisher: '',
    publisherSplit: 0,
    publishingType: 'exclusive',
    pro: '',
    caeIpi: '',
    
    // Audio Information
    duration: '',
    bpm: null,
    songKey: '',
    explicit: false,
    
    // Production Credits
    producer: '',
    coproducer: '',
    executiveProducer: '',
    mixingEngineer: '',
    masteringEngineer: '',
    recordingEngineer: '',
    assistantProducer: '',
    additionalProduction: '',
    engineer: '',
    editing: '',
    
    // Studio Information
    recordingStudio: '',
    masteringStudio: '',
    recordingLocation: '',
    
    // Instrumentation
    keyboards: '',
    programming: '',
    bass: '',
    drums: '',
    guitars: '',
    organ: '',
    percussion: '',
    strings: '',
    additionalInstrumentation: '',
    
    // Creative Information
    designArtDirection: '',
    artworkPhotographer: '',
    artworkDesigner: '',
    
    // Professional Contacts
    management: '',
    bookingAgent: '',
    pressContact: '',
    labelContact: '',
    
    // Online Presence & Marketing
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      tiktok: '',
      soundcloud: '',
      bandcamp: ''
    },
    
    // Distribution & Platforms
    distributionPlatforms: [],
    excludedTerritories: [],
    distributionStartDate: '',
    distributionEndDate: '',
    digitalReleaseDate: '',
    physicalReleaseDate: '',
    
    // Rights & Licensing
    masterOwner: '',
    publishingOwner: '',
    copyrightHolder: '',
    copyrightYear: new Date().getFullYear(),
    recordingYear: new Date().getFullYear(),
    publishingYear: new Date().getFullYear(),
    
    // Commercial Information
    suggestedRetailPrice: '',
    wholesalePrice: '',
    digitalPrice: '',
    
    // File Information
    audioFiles: [],
    artworkFiles: [],
    lyricFiles: [],
    
    // Additional Metadata
    mood: '',
    tempo: '',
    instruments: [],
    vocals: '',
    songwriters: [],
    
    // Marketing & Promotion
    marketingPlan: '',
    targetAudience: '',
    campaignBudget: '',
    promotionalAssets: [],
    
    // Legal & Business
    splitSheets: [],
    contracts: [],
    clearances: [],
    
    // Release Notes & Internal
    releaseNotes: '',
    internalNotes: '',
    specialInstructions: '',
    
    // Workflow specific fields
    status: 'draft',
    workflowStep: 'artist_creation',
    artistCanEdit: true,
    labelAdminId: null,
    companyAdminId: null,
    distributionPartnerId: null,
    
    // Revenue split
    artistPercentage: 70,
    labelPercentage: 20,
    companyPercentage: 10,
    distributionPartnerPercentage: 10,
    useCustomSplit: false
  });

  // UI state
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    catalog: false,
    publishing: false,
    audio: false,
    production: false,
    creative: false,
    marketing: false,
    distribution: false,
    legal: false,
    revenue: false
  });

  // Auto-save management
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimeoutRef = useRef(null);

  // Initialize form with existing release data
  useEffect(() => {
    if (release) {
      setFormData(prevData => ({
        ...prevData,
        ...release
      }));
    }
  }, [release]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && formData.projectName) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 3000); // Auto-save after 3 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, hasUnsavedChanges, autoSaveEnabled]);

  const handleAutoSave = async () => {
    if (onSave && userRole !== 'distribution_partner') {
      try {
        await onSave({ ...formData, status: 'draft' });
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const newArray = [...(prev[field] || [])];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
    setHasUnsavedChanges(true);
  };

  const addArrayItem = (field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), defaultValue]
    }));
    setHasUnsavedChanges(true);
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
      setHasUnsavedChanges(false);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      const submitData = {
        ...formData,
        status: getNextStatus()
      };
      onSubmit(submitData);
    }
  };

  const getNextStatus = () => {
    if (userRole === 'artist' || userRole === 'label_admin') {
      return 'submitted';
    } else if (userRole === 'distribution_partner') {
      return 'in_review';
    }
    return 'draft';
  };

  const canEdit = () => {
    if (userRole === 'distribution_partner') return true;
    if (userRole === 'company_admin' || userRole === 'super_admin') return true;
    return formData.artistCanEdit;
  };

  // Form section components
  const SectionHeader = ({ title, section, icon: Icon, description }) => (
    <div 
      className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 border-b hover:bg-gray-100 transition-colors"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      </div>
      {expandedSections[section] ? 
        <ChevronUp className="h-5 w-5 text-gray-500" /> : 
        <ChevronDown className="h-5 w-5 text-gray-500" />
      }
    </div>
  );

  const FormField = ({ 
    label, 
    field, 
    type = 'text', 
    options = [], 
    disabled = false,
    required = false,
    placeholder = '',
    description = '',
    className = 'md:col-span-1',
    parent = null
  }) => {
    const value = parent ? formData[parent]?.[field] || '' : formData[field] || '';
    const hasError = parent ? errors[`${parent}.${field}`] : errors[field];
    const isDisabled = disabled || !canEdit();

    return (
      <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {type === 'select' ? (
          <select
            value={value}
            onChange={(e) => parent ? 
              handleNestedChange(parent, field, e.target.value) : 
              handleInputChange(field, e.target.value)
            }
            disabled={isDisabled}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
            } ${hasError ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map(option => (
              <option key={option.value || option} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => parent ? 
              handleNestedChange(parent, field, e.target.value) : 
              handleInputChange(field, e.target.value)
            }
            disabled={isDisabled}
            placeholder={placeholder}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
            } ${hasError ? 'border-red-500' : 'border-gray-300'}`}
          />
        ) : type === 'checkbox' ? (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => parent ? 
                handleNestedChange(parent, field, e.target.checked) : 
                handleInputChange(field, e.target.checked)
              }
              disabled={isDisabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">{description || label}</span>
          </div>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => parent ? 
              handleNestedChange(parent, field, e.target.value) : 
              handleInputChange(field, e.target.value)
            }
            disabled={isDisabled}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
            } ${hasError ? 'border-red-500' : 'border-gray-300'}`}
          />
        )}
        
        {description && type !== 'checkbox' && (
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        )}
        {hasError && (
          <p className="mt-1 text-sm text-red-600">{hasError}</p>
        )}
      </div>
    );
  };

  // Form options
  const releaseTypes = [
    'single', 'ep', 'album', 'mixtape', 'compilation', 'remix', 'live_album', 'soundtrack'
  ];

  const genres = [
    'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Country', 'Jazz', 'Classical',
    'Folk', 'Blues', 'Reggae', 'Latin', 'World', 'Alternative', 'Indie', 'Metal',
    'Punk', 'Soul', 'Funk', 'Gospel', 'EDM', 'House', 'Techno', 'Trap', 'Dubstep'
  ];

  const publishingTypes = [
    { value: 'exclusive', label: 'Exclusive' },
    { value: 'co_publishing', label: 'Co-Publishing' },
    { value: 'administration', label: 'Administration' },
    { value: 'sub_publishing', label: 'Sub-Publishing' }
  ];

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese',
    'Korean', 'Mandarin', 'Hindi', 'Arabic', 'Russian', 'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Auto-save indicator */}
      {autoSaveEnabled && (userRole === 'artist' || userRole === 'label_admin') && (
        <div className="flex items-center justify-between text-sm bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span className="text-blue-700">Auto-saving draft...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700">
                  Auto-saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-amber-700">Changes will be auto-saved</span>
              </>
            ) : null}
          </div>
          {formData.status !== 'draft' && !formData.artistCanEdit && (
            <span className="text-sm text-amber-600 font-medium">
              Read-only: Submit a change request to edit
            </span>
          )}
        </div>
      )}

      {/* Basic Release Information */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <SectionHeader 
          title="Basic Release Information" 
          section="basic"
          icon={Music}
          description="Essential details about your release"
        />
        
        {expandedSections.basic && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Project Name" 
                field="projectName" 
                required 
                placeholder="Enter project name"
              />
              <FormField 
                label="Artist Name" 
                field="artistName" 
                required 
                placeholder="Primary artist name"
              />
              <FormField 
                label="Release Title" 
                field="releaseTitle" 
                required 
                placeholder="Official release title"
              />
              <FormField 
                label="Release Type" 
                field="releaseType" 
                type="select"
                options={releaseTypes}
                required
              />
              <FormField 
                label="Primary Genre" 
                field="primaryGenre" 
                type="select"
                options={genres}
                required
              />
              <FormField 
                label="Language" 
                field="language" 
                type="select"
                options={languages}
              />
              <FormField 
                label="Release Date" 
                field="releaseDate" 
                type="date"
                required
              />
              <FormField 
                label="Original Release Date" 
                field="originalReleaseDate" 
                type="date"
                description="For re-releases or remasters"
              />
            </div>
          </div>
        )}
      </div>

      {/* Catalog & Identification */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <SectionHeader 
          title="Catalog & Identification" 
          section="catalog"
          icon={FileText}
          description="Unique identifiers and catalog information"
        />
        
        {expandedSections.catalog && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField 
                label="Catalogue Number" 
                field="catalogueNo" 
                placeholder="CAT-001"
              />
              <FormField 
                label="Barcode/UPC" 
                field="barcode" 
                placeholder="1234567890123"
              />
              <FormField 
                label="UPC" 
                field="upc" 
                placeholder="Universal Product Code"
              />
              <FormField 
                label="ISRC" 
                field="isrc" 
                placeholder="USRC17607839"
                description="International Standard Recording Code"
              />
              <FormField 
                label="Tunecode" 
                field="tunecode" 
                placeholder="TCXXXX"
              />
              <FormField 
                label="ICE Work Key" 
                field="iceWorkKey" 
                placeholder="ICE work identifier"
              />
              <FormField 
                label="ISWC" 
                field="iswc" 
                placeholder="T-034.524.680-1"
                description="International Standard Musical Work Code"
              />
              <FormField 
                label="BOWI" 
                field="bowi" 
                placeholder="Board of Works identifier"
              />
            </div>
          </div>
        )}
      </div>

      {/* Publishing Information */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <SectionHeader 
          title="Publishing Information" 
          section="publishing"
          icon={Edit3}
          description="Songwriter and publishing details"
        />
        
        {expandedSections.publishing && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Composer/Author" 
                field="composer" 
                placeholder="Primary composer"
              />
              <FormField 
                label="Lyricist" 
                field="lyricist" 
                placeholder="Lyric writer"
              />
              <FormField 
                label="Publisher" 
                field="publisher" 
                placeholder="Publishing company"
              />
              <FormField 
                label="Publisher Split %" 
                field="publisherSplit" 
                type="number"
                placeholder="50"
              />
              <FormField 
                label="Publishing Type" 
                field="publishingType" 
                type="select"
                options={publishingTypes}
              />
              <FormField 
                label="PRO" 
                field="pro" 
                placeholder="Performance Rights Organization"
              />
              <FormField 
                label="CAE/IPI" 
                field="caeIpi" 
                placeholder="Composer/Author identifier"
                className="md:col-span-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Audio Information */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <SectionHeader 
          title="Audio Information" 
          section="audio"
          icon={Music}
          description="Technical audio details"
        />
        
        {expandedSections.audio && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField 
                label="Duration" 
                field="duration" 
                placeholder="3:45"
                description="MM:SS format"
              />
              <FormField 
                label="BPM" 
                field="bpm" 
                type="number"
                placeholder="120"
              />
              <FormField 
                label="Song Key" 
                field="songKey" 
                placeholder="C Major"
              />
              <FormField 
                label="Explicit Content" 
                field="explicit" 
                type="checkbox"
                description="Contains explicit content"
              />
            </div>
          </div>
        )}
      </div>

      {/* Production Credits */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <SectionHeader 
          title="Production Credits" 
          section="production"
          icon={Users}
          description="Production team and technical credits"
        />
        
        {expandedSections.production && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Producer" field="producer" />
              <FormField label="Co-Producer" field="coproducer" />
              <FormField label="Executive Producer" field="executiveProducer" />
              <FormField label="Mixing Engineer" field="mixingEngineer" />
              <FormField label="Mastering Engineer" field="masteringEngineer" />
              <FormField label="Recording Engineer" field="recordingEngineer" />
              <FormField label="Assistant Producer" field="assistantProducer" />
              <FormField label="Additional Production" field="additionalProduction" />
              <FormField label="Engineer" field="engineer" />
              <FormField label="Editing" field="editing" />
              <FormField label="Recording Studio" field="recordingStudio" />
              <FormField label="Mastering Studio" field="masteringStudio" />
            </div>
          </div>
        )}
      </div>

      {/* Revenue Split Configuration */}
      {(userRole === 'artist' || userRole === 'distribution_partner') && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <SectionHeader 
            title="Revenue Split Configuration" 
            section="revenue"
            icon={DollarSign}
            description="How earnings will be distributed"
          />
          
          {expandedSections.revenue && (
            <div className="p-6">
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Distribution Partner takes {formData.distributionPartnerPercentage || 10}% off the top. 
                  The remaining revenue is split according to these percentages.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField 
                  label="Artist Percentage" 
                  field="artistPercentage" 
                  type="number"
                  placeholder="70"
                  description="Artist's share of net revenue"
                />
                <FormField 
                  label="Label Percentage" 
                  field="labelPercentage" 
                  type="number"
                  placeholder="20"
                  description="Label's share of net revenue"
                />
                <FormField 
                  label="Company Percentage" 
                  field="companyPercentage" 
                  type="number"
                  placeholder="10"
                  description="Company's share of net revenue"
                />
              </div>
              
              <div className="mt-4">
                <FormField 
                  label="Use Custom Split" 
                  field="useCustomSplit" 
                  type="checkbox"
                  description="Enable custom revenue split for this release"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          {hasUnsavedChanges && (
            <span className="text-sm text-amber-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Unsaved changes
            </span>
          )}
        </div>
        
        <div className="flex space-x-3">
          {canEdit() && (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </button>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>
                  {isSubmitting ? 'Submitting...' : 
                   userRole === 'artist' || userRole === 'label_admin' ? 'Submit for Review' : 
                   'Update Release'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveReleaseForm;
