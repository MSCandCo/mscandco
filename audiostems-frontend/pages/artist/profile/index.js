import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, Edit, Save, X, Upload, Check, User, Mail, Phone, Globe, Calendar, MapPin, Music, Award, FileText } from 'lucide-react';
import Layout from '../../../components/layouts/mainLayout';

export default function ArtistProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestField, setRequestField] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [errors, setErrors] = useState({});

  // LOCKED FIELDS - require admin approval
  const LOCKED_FIELDS = ['first_name', 'last_name', 'date_of_birth', 'nationality', 'country', 'city'];
  
  // EDITABLE FIELDS - can be changed directly
  const EDITABLE_FIELDS = [
    'artist_name', 'artist_type', 'email', 'phone', 'country_code',
    'primary_genre', 'secondary_genre', 'years_active', 'record_label',
    'release_bio', 'full_biography', 'website', 'instagram', 'facebook', 
    'twitter', 'youtube', 'tiktok', 'spotify', 'apple_music'
  ];

  // Dropdown options
  const ARTIST_TYPES = ['Solo Artist', 'Band', 'Producer', 'DJ', 'Songwriter', 'Vocalist'];
  const GENRES = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Jazz', 'Classical', 'Country',
    'Reggae', 'Blues', 'Folk', 'Indie', 'Alternative', 'Funk', 'Soul', 'Gospel',
    'Afrobeats', 'Dancehall', 'Reggaeton', 'Latin', 'World Music', 'Experimental'
  ];
  const COUNTRY_CODES = [
    { code: '+1', country: 'US/CA' }, { code: '+44', country: 'UK' }, { code: '+33', country: 'FR' },
    { code: '+49', country: 'DE' }, { code: '+34', country: 'ES' }, { code: '+39', country: 'IT' },
    { code: '+31', country: 'NL' }, { code: '+46', country: 'SE' }, { code: '+47', country: 'NO' },
    { code: '+45', country: 'DK' }, { code: '+41', country: 'CH' }, { code: '+43', country: 'AT' }
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile(data);
      } else if (error) {
        console.error('Error fetching profile:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field, value) => {
    setEditing({ ...editing, [field]: value });
    // Clear error when user starts editing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateField = (field, value) => {
    const requiredFields = ['artist_name', 'email', 'primary_genre'];
    if (requiredFields.includes(field) && (!value || value.trim() === '')) {
      return `${field.replace('_', ' ')} is required`;
    }
    if (field === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const saveField = async (field) => {
    setSaving(true);
    const value = editing[field];
    
    // Validate field
    const error = validateField(field, value);
    if (error) {
      setErrors({ ...errors, [field]: error });
      setSaving(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ [field]: value })
        .eq('id', user.id);
      
      if (!updateError) {
        setProfile({ ...profile, [field]: value });
        const newEditing = { ...editing };
        delete newEditing[field];
        setEditing(newEditing);
        setErrors({ ...errors, [field]: null });
      } else {
        console.error('Save error:', updateError);
        setErrors({ ...errors, [field]: 'Failed to save changes' });
      }
    } catch (error) {
      console.error('Error saving field:', error);
      setErrors({ ...errors, [field]: 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = (field) => {
    const newEditing = { ...editing };
    delete newEditing[field];
    setEditing(newEditing);
    setErrors({ ...errors, [field]: null });
  };

  const requestChange = (field) => {
    setRequestField(field);
    setShowRequestModal(true);
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5MB.');
      return;
    }

    setUploadingPicture(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file);

      if (uploadError) {
        alert('Upload failed');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', user.id);

      if (!updateError) {
        setProfile({ ...profile, profile_picture_url: publicUrl });
      }
    } catch (error) {
      console.error('Error uploading picture:', error);
      alert('Upload failed');
    } finally {
      setUploadingPicture(false);
    }
  };

  const calculateProgress = () => {
    if (!profile) return 0;
    const totalFields = [...LOCKED_FIELDS, ...EDITABLE_FIELDS];
    const completedFields = totalFields.filter(field => profile[field] && profile[field].toString().trim() !== '');
    return Math.round((completedFields.length / totalFields.length) * 100);
  };

  const renderField = (field, icon, label, type = 'text', options = null) => {
    const isLocked = LOCKED_FIELDS.includes(field);
    const isEditing = editing[field] !== undefined;
    const value = isEditing ? editing[field] : (profile?.[field] || '');
    const hasError = errors[field];

    return (
      <div key={field} className="mb-6">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          {icon}
          <span className="ml-2">{label}</span>
          {['artist_name', 'email', 'primary_genre'].includes(field) && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
        
        <div className="flex items-center gap-2">
          {isLocked ? (
            <>
              <input
                type={type}
                value={value}
                disabled
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <button
                onClick={() => requestChange(field)}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Request Edit
              </button>
            </>
          ) : (
            <>
              {options ? (
                <select
                  value={value}
                  onChange={(e) => handleEdit(field, e.target.value)}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    hasError ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select {label}</option>
                  {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : type === 'textarea' ? (
                <textarea
                  value={value}
                  onChange={(e) => handleEdit(field, e.target.value)}
                  rows={4}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    hasError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              ) : field === 'phone' ? (
                <div className="flex flex-1 gap-2">
                  <select
                    value={profile?.country_code || '+44'}
                    onChange={(e) => handleEdit('country_code', e.target.value)}
                    className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {COUNTRY_CODES.map(({ code, country }) => (
                      <option key={code} value={code}>{code} ({country})</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={value}
                    onChange={(e) => handleEdit(field, e.target.value)}
                    placeholder="Phone number"
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      hasError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
              ) : (
                <input
                  type={type}
                  value={value}
                  onChange={(e) => handleEdit(field, e.target.value)}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    hasError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
              
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => saveField(field)}
                    disabled={saving}
                    className="px-3 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => cancelEdit(field)}
                    className="px-3 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        
        {hasError && (
          <p className="text-red-500 text-sm mt-1">{hasError}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Unable to load profile data.</p>
            <button 
              onClick={fetchProfile}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const progress = calculateProgress();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Artist Profile</h1>
              <p className="text-gray-600 mt-1">Manage your artist information and settings</p>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              {editMode ? 'View Profile' : 'Edit Profile'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - 70% */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Personal Information */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <User className="w-5 h-5 text-purple-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  <Lock className="w-4 h-4 text-gray-400 ml-2" />
                </div>
                <p className="text-sm text-gray-600 mb-6">These fields require admin approval to change</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderField('first_name', <User className="w-4 h-4 text-gray-500" />, 'First Name')}
                  {renderField('last_name', <User className="w-4 h-4 text-gray-500" />, 'Last Name')}
                  {renderField('date_of_birth', <Calendar className="w-4 h-4 text-gray-500" />, 'Date of Birth', 'date')}
                  {renderField('nationality', <Globe className="w-4 h-4 text-gray-500" />, 'Nationality')}
                  {renderField('country', <MapPin className="w-4 h-4 text-gray-500" />, 'Country')}
                  {renderField('city', <MapPin className="w-4 h-4 text-gray-500" />, 'City')}
                </div>
              </section>

              {/* Artist Information */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <Music className="w-5 h-5 text-blue-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Artist Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderField('artist_name', <Music className="w-4 h-4 text-gray-500" />, 'Artist Name')}
                  {renderField('artist_type', <Award className="w-4 h-4 text-gray-500" />, 'Artist Type', 'text', ARTIST_TYPES)}
                  {renderField('email', <Mail className="w-4 h-4 text-gray-500" />, 'Email', 'email')}
                  {renderField('phone', <Phone className="w-4 h-4 text-gray-500" />, 'Phone')}
                  {renderField('primary_genre', <Music className="w-4 h-4 text-gray-500" />, 'Primary Genre', 'text', GENRES)}
                  {renderField('secondary_genre', <Music className="w-4 h-4 text-gray-500" />, 'Secondary Genre', 'text', GENRES)}
                  {renderField('years_active', <Calendar className="w-4 h-4 text-gray-500" />, 'Years Active')}
                  {renderField('record_label', <Award className="w-4 h-4 text-gray-500" />, 'Record Label')}
                </div>
              </section>

              {/* Biography */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <FileText className="w-5 h-5 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Biography</h2>
                </div>
                
                <div className="space-y-6">
                  {renderField('release_bio', <FileText className="w-4 h-4 text-gray-500" />, 'Release Bio', 'textarea')}
                  {renderField('full_biography', <FileText className="w-4 h-4 text-gray-500" />, 'Full Biography', 'textarea')}
                </div>
              </section>

              {/* Social Media */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <Globe className="w-5 h-5 text-indigo-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Social Media & Links</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderField('website', <Globe className="w-4 h-4 text-gray-500" />, 'Website', 'url')}
                  {renderField('instagram', <Globe className="w-4 h-4 text-gray-500" />, 'Instagram', 'url')}
                  {renderField('facebook', <Globe className="w-4 h-4 text-gray-500" />, 'Facebook', 'url')}
                  {renderField('twitter', <Globe className="w-4 h-4 text-gray-500" />, 'Twitter', 'url')}
                  {renderField('youtube', <Globe className="w-4 h-4 text-gray-500" />, 'YouTube', 'url')}
                  {renderField('tiktok', <Globe className="w-4 h-4 text-gray-500" />, 'TikTok', 'url')}
                  {renderField('spotify', <Globe className="w-4 h-4 text-gray-500" />, 'Spotify', 'url')}
                  {renderField('apple_music', <Globe className="w-4 h-4 text-gray-500" />, 'Apple Music', 'url')}
                </div>
              </section>
            </div>

            {/* Right Sidebar - 30% */}
            <div className="space-y-6">
              
              {/* Profile Picture */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
                
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mx-auto mb-4">
                      {profile.profile_picture_url ? (
                        <img
                          src={profile.profile_picture_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                      id="profile-picture-upload"
                      disabled={uploadingPicture}
                    />
                    <label
                      htmlFor="profile-picture-upload"
                      className={`cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                        uploadingPicture ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingPicture ? 'Uploading...' : 'Change Picture'}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG, or WebP. Max 5MB.</p>
                </div>
              </section>

              {/* Profile Completion */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Complete your profile to improve your visibility and connect with more opportunities.
                </p>
              </section>

              {/* Quick Stats */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profile Views</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Releases</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Followers</span>
                    <span className="font-semibold">0</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Request Change Modal */}
        {showRequestModal && (
          <RequestChangeModal
            field={requestField}
            currentValue={profile?.[requestField]}
            onClose={() => {
              setShowRequestModal(false);
              setRequestField(null);
            }}
            onSubmit={() => {
              setShowRequestModal(false);
              setRequestField(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}

function RequestChangeModal({ field, currentValue, onClose, onSubmit }) {
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!newValue || !reason) return;
    
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('profile_change_requests')
        .insert({
          user_id: user.id,
          field_name: field,
          current_value: currentValue,
          requested_value: newValue,
          reason: reason,
          status: 'pending'
        });
      
      if (!error) {
        alert('Change request submitted for approval');
        onSubmit();
      } else {
        console.error('Error submitting request:', error);
        alert('Failed to submit request');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Request Profile Change</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
            <input
              type="text"
              value={field?.replace('_', ' ').toUpperCase()}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
            <input
              type="text"
              value={currentValue || 'Not set'}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Value *</label>
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter the new value"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Change *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Explain why you need to change this information"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!newValue || !reason || submitting}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}