'use client'

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Save, AlertCircle, CheckCircle, Lock, Unlock } from 'lucide-react';

const ComprehensiveProfileForm = ({ 
  profile, 
  onSave, 
  isEditing, 
  isSaving, 
  errors,
  userRole = 'artist'
}) => {
  const [formData, setFormData] = useState(profile || {});
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    business: false,
    artist: true,
    music: true,
    social: false,
    banking: false,
    professional: false,
    wallet: false,
    revenue: false
  });

  useEffect(() => {
    setFormData(profile || {});
  }, [profile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value) => {
    if (typeof value === 'string') {
      // Handle comma-separated string input
      const arrayValue = value.split(',').map(item => item.trim()).filter(Boolean);
      setFormData(prev => ({
        ...prev,
        [field]: arrayValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const SectionHeader = ({ title, section, locked = false, description }) => (
    <div 
      className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 border-b"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center space-x-3">
        {locked && <Lock className="h-4 w-4 text-amber-500" />}
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
    className = 'md:col-span-1'
  }) => (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {disabled && <span className="ml-2 text-xs text-amber-600">(Locked)</span>}
      </label>
      
      {type === 'select' ? (
        <select
          value={formData[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          disabled={disabled || !isEditing}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled || !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
          } ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
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
          value={formData[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          disabled={disabled || !isEditing}
          placeholder={placeholder}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled || !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
          } ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
        />
      ) : type === 'array' ? (
        <input
          type="text"
          value={Array.isArray(formData[field]) ? formData[field].join(', ') : formData[field] || ''}
          onChange={(e) => handleArrayChange(field, e.target.value)}
          disabled={disabled || !isEditing}
          placeholder={placeholder || "Separate with commas"}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled || !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
          } ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
        />
      ) : (
        <input
          type={type}
          value={formData[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          disabled={disabled || !isEditing}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled || !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
          } ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
        />
      )}
      
      {description && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
      {errors[field] && (
        <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
      )}
    </div>
  );

  // Form options
  const businessTypes = [
    'individual', 'company', 'label', 'partnership', 'corporation'
  ];

  const artistTypes = [
    'Solo Artist', 'Band Group', 'DJ', 'Duo', 'Orchestra', 'Ensemble',
    'Collective', 'Producer', 'Composer', 'Singer-Songwriter', 'Rapper',
    'Instrumentalist', 'Choir', 'Other'
  ];

  const genres = [
    'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Country', 'Jazz', 'Classical',
    'Folk', 'Blues', 'Reggae', 'Latin', 'World', 'Alternative', 'Indie', 'Metal',
    'Punk', 'Soul', 'Funk', 'Gospel', 'EDM', 'House', 'Techno', 'Trap', 'Dubstep'
  ];

  const vocalTypes = ['Soprano', 'Alto', 'Tenor', 'Baritone', 'Bass', 'Mixed'];

  const paymentMethods = [
    { value: 'revolut', label: 'Revolut' },
    { value: 'wallet', label: 'Wallet Balance' },
    { value: 'bank_transfer', label: 'Bank Transfer' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <SectionHeader 
          title="Personal Information" 
          section="personal"
          locked={formData.immutableDataLocked}
          description={formData.immutableDataLocked ? 
            "This information is locked and requires admin approval to change" : 
            "Basic personal details - will be locked after first save"
          }
        />
        
        {expandedSections.personal && (
          <div className="p-6">
            {!formData.immutableDataLocked && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="text-sm text-amber-800">
                    This information will be locked after saving and cannot be changed without admin approval.
                  </span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="First Name" 
                field="firstName" 
                required 
                disabled={formData.immutableDataLocked}
              />
              <FormField 
                label="Last Name" 
                field="lastName" 
                required 
                disabled={formData.immutableDataLocked}
              />
              <FormField 
                label="Date of Birth" 
                field="dateOfBirth" 
                type="date" 
                required 
                disabled={formData.immutableDataLocked}
              />
              <FormField 
                label="Nationality" 
                field="nationality" 
                required 
                disabled={formData.immutableDataLocked}
              />
              <FormField 
                label="City" 
                field="city" 
                required 
                disabled={formData.immutableDataLocked}
              />
              <FormField 
                label="Postal Code" 
                field="postalCode" 
                disabled={formData.immutableDataLocked}
              />
              <FormField 
                label="Email" 
                field="email" 
                type="email" 
                required 
                className="md:col-span-2"
              />
              <FormField 
                label="Phone" 
                field="phone" 
                type="tel" 
              />
              <FormField 
                label="Address" 
                field="location" 
                className="md:col-span-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Business Information Section */}
      {userRole !== 'artist' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <SectionHeader 
            title="Business Information" 
            section="business"
            description="Company and business details"
          />
          
          {expandedSections.business && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  label="Company Name" 
                  field="companyName" 
                />
                <FormField 
                  label="Business Type" 
                  field="businessType" 
                  type="select"
                  options={businessTypes}
                />
                <FormField 
                  label="Position" 
                  field="position" 
                />
                <FormField 
                  label="Department" 
                  field="department" 
                />
                <FormField 
                  label="Tax ID" 
                  field="taxId" 
                />
                <FormField 
                  label="VAT Number" 
                  field="vatNumber" 
                />
                <FormField 
                  label="Registration Number" 
                  field="registrationNumber" 
                />
                <FormField 
                  label="Founded Year" 
                  field="foundedYear" 
                  type="number"
                  placeholder="YYYY"
                />
                <FormField 
                  label="Office Address" 
                  field="officeAddress" 
                  type="textarea"
                  className="md:col-span-2"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Artist Information Section */}
      {userRole === 'artist' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <SectionHeader 
            title="Artist Information" 
            section="artist"
            description="Your artistic identity and branding"
          />
          
          {expandedSections.artist && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  label="Artist Name" 
                  field="artistName" 
                  required
                  description="Your professional name as an artist"
                />
                <FormField 
                  label="Artist Type" 
                  field="artistType" 
                  type="select"
                  options={artistTypes}
                />
                <FormField 
                  label="Years Active" 
                  field="yearsActive" 
                  placeholder="e.g., 5 years"
                />
                <FormField 
                  label="Record Label" 
                  field="recordLabel" 
                />
                <FormField 
                  label="Publisher" 
                  field="publisher" 
                />
                <FormField 
                  label="Bio" 
                  field="bio" 
                  type="textarea"
                  placeholder="Tell us about your musical journey..."
                  className="md:col-span-2"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Music Information Section */}
      {userRole === 'artist' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <SectionHeader 
            title="Music Information" 
            section="music"
            description="Your musical style and capabilities"
          />
          
          {expandedSections.music && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  label="Primary Genre" 
                  field="primaryGenre" 
                  type="select"
                  options={genres}
                  required
                />
                <FormField 
                  label="Secondary Genres" 
                  field="secondaryGenres" 
                  type="array"
                  placeholder="Electronic, Ambient, Chill"
                />
                <FormField 
                  label="Instruments" 
                  field="instruments" 
                  type="array"
                  placeholder="Piano, Guitar, Vocals"
                />
                <FormField 
                  label="Vocal Type" 
                  field="vocalType" 
                  type="select"
                  options={vocalTypes}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Social Media Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <SectionHeader 
          title="Social Media & Online Presence" 
          section="social"
          description="Your digital footprint and streaming platforms"
        />
        
        {expandedSections.social && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Website" 
                field="website" 
                type="url"
                placeholder="https://your-website.com"
              />
              <FormField 
                label="Instagram" 
                field="instagram" 
                placeholder="@username or full URL"
              />
              <FormField 
                label="Facebook" 
                field="facebook" 
              />
              <FormField 
                label="Twitter/X" 
                field="twitter" 
              />
              <FormField 
                label="TikTok" 
                field="tiktok" 
              />
              <FormField 
                label="YouTube" 
                field="youtube" 
              />
              <FormField 
                label="Spotify" 
                field="spotify" 
              />
              <FormField 
                label="Apple Music" 
                field="appleMusic" 
              />
              <FormField 
                label="SoundCloud" 
                field="soundcloud" 
              />
              <FormField 
                label="Bandcamp" 
                field="bandcamp" 
              />
            </div>
          </div>
        )}
      </div>

      {/* Professional Information Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <SectionHeader 
          title="Professional Team" 
          section="professional"
          description="Your professional contacts and representation"
        />
        
        {expandedSections.professional && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField 
                label="Manager Name" 
                field="managerName" 
              />
              <FormField 
                label="Manager Email" 
                field="managerEmail" 
                type="email"
              />
              <FormField 
                label="Manager Phone" 
                field="managerPhone" 
                type="tel"
              />
              <FormField 
                label="Booking Agent" 
                field="bookingAgent" 
              />
              <FormField 
                label="Publicist" 
                field="publicist" 
              />
            </div>
          </div>
        )}
      </div>

      {/* Banking Information Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <SectionHeader 
          title="Banking & Payment Information" 
          section="banking"
          description="Payment and banking details for royalties"
        />
        
        {expandedSections.banking && (
          <div className="p-6">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Lock className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm text-blue-800">
                  Banking information is encrypted and secure. Only used for payments.
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Revolut Account ID" 
                field="revolutAccountId" 
                description="For subscription payments"
              />
              <FormField 
                label="Preferred Payment Method" 
                field="preferredPaymentMethod" 
                type="select"
                options={paymentMethods}
              />
              <FormField 
                label="Bank Account Name" 
                field="bankAccountName" 
              />
              <FormField 
                label="Bank Account Number" 
                field="bankAccountNumber" 
              />
              <FormField 
                label="Bank Routing Number" 
                field="bankRoutingNumber" 
              />
              <FormField 
                label="Bank Name" 
                field="bankName" 
              />
              <FormField 
                label="SWIFT Code" 
                field="bankSwiftCode" 
              />
              <FormField 
                label="IBAN" 
                field="bankIban" 
              />
            </div>
          </div>
        )}
      </div>

      {/* Wallet Information Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <SectionHeader 
          title="Wallet & Subscription" 
          section="wallet"
          description="Your wallet balance and subscription settings"
        />
        
        {expandedSections.wallet && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Wallet Balance</label>
                <div className="text-2xl font-bold text-green-600">
                  ${(formData.walletBalance || 0).toFixed(4)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                <div className="text-lg text-gray-900">
                  ${(formData.walletCreditLimit || 0).toFixed(2)}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.autoPayFromWallet || false}
                  onChange={(e) => handleInputChange('autoPayFromWallet', e.target.checked)}
                  disabled={!isEditing}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">
                  Auto-pay subscription from wallet balance
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.negativeBallowanceAllowed || false}
                  onChange={(e) => handleInputChange('negativeBallowanceAllowed', e.target.checked)}
                  disabled={true}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-500">
                  Negative balance allowed (Contact admin)
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Split Configuration Section */}
      {userRole === 'artist' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <SectionHeader 
            title="Revenue Split Configuration" 
            section="revenue"
            description="How your earnings are distributed"
          />
          
          {expandedSections.revenue && (
            <div className="p-6">
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Distribution Partner takes 10% off the top. The remaining 90% is split according to these percentages.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField 
                  label="Artist Percentage" 
                  field="artistRevenuePercentage" 
                  type="number"
                  placeholder="70"
                  description="Your share of the 90% net revenue"
                />
                <FormField 
                  label="Label Percentage" 
                  field="labelRevenuePercentage" 
                  type="number"
                  placeholder="20"
                  description="Label's share of the 90% net revenue"
                />
                <FormField 
                  label="Company Percentage" 
                  field="companyRevenuePercentage" 
                  type="number"
                  placeholder="10"
                  description="Company's share of the 90% net revenue"
                />
              </div>
              
              <div className="mt-4 flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.customSplitEnabled || false}
                  onChange={(e) => handleInputChange('customSplitEnabled', e.target.checked)}
                  disabled={!isEditing}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">
                  Enable custom revenue split for this artist
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
};

export default ComprehensiveProfileForm;
