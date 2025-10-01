import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Lock, Edit, Save, X } from 'lucide-react';

const supabase = createClientComponentClient();

export default function EditProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestField, setRequestField] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // LOCKED: Core signup fields - require admin approval
  const LOCKED_FIELDS = ['first_name', 'last_name', 'email', 'nationality', 'country', 'city'];
  
  // EDITABLE: Can change directly
  const EDITABLE_FIELDS = ['artist_name', 'artist_type', 'phone', 'primary_genre', 'secondary_genre', 'years_active', 'label', 'bio'];
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) setProfile(data);
    setLoading(false);
  };
  
  const handleEdit = (field, value) => {
    setEditing({ ...editing, [field]: value });
  };
  
  const saveField = async (field) => {
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ [field]: editing[field] })
      .eq('id', user.id);
    
    if (!error) {
      setProfile({ ...profile, [field]: editing[field] });
      const newEditing = { ...editing };
      delete newEditing[field];
      setEditing(newEditing);
      
    
    setSaving(false);
  };
  
  const cancelEdit = (field) => {
    const newEditing = { ...editing };
    delete newEditing[field];
    setEditing(newEditing);
  };
  
  const requestChange = (field) => {
    setRequestField(field);
    setShowRequestModal(true);
  };
  
  
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  
  return (
    <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Artist Profile</h1>
          <p className="text-gray-600 mt-2">This information will be used across all your releases and platform features</p>
        </div>
        
        {/* Personal Information - LOCKED */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <Lock className="w-5 h-5 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">These fields require admin approval to change</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LOCKED_FIELDS.map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {field.replace('_', ' ')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profile?.[field] || ''}
                    disabled
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                  <button
                    onClick={() => requestChange(field)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Request Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Artist Information - EDITABLE */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <Edit className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Artist Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EDITABLE_FIELDS.slice(0, 3).map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {field.replace('_', ' ')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editing[field] !== undefined ? editing[field] : profile?.[field] || ''}
                    onChange={(e) => handleEdit(field, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {editing[field] !== undefined && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveField(field)}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => cancelEdit(field)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Music Information - EDITABLE */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Music Information</h3>
          <p className="text-sm text-gray-600 mb-6">This information pre-fills your release forms</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EDITABLE_FIELDS.slice(3, 7).map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {field.replace('_', ' ')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editing[field] !== undefined ? editing[field] : profile?.[field] || ''}
                    onChange={(e) => handleEdit(field, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={field === 'years_active' ? 'e.g., 5 years' : ''}
                  />
                  {editing[field] !== undefined && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveField(field)}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => cancelEdit(field)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Biography */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Biography</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Artist Bio</label>
            <textarea
              value={editing.bio !== undefined ? editing.bio : profile?.bio || ''}
              onChange={(e) => handleEdit('bio', e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {editing.bio !== undefined && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => saveField('bio')}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Save Bio
                </button>
                <button
                  onClick={() => cancelEdit('bio')}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </section>
        
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
    );
}

function RequestChangeModal({ field, currentValue, onClose, onSubmit }) {
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!newValue || !reason) return;
    
    setSubmitting(true);
    
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
    
    setSubmitting(false);
    
    if (!error) {
      alert('Change request submitted for approval');
      onSubmit();
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


