import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Lock, Edit, Save, X } from 'lucide-react';
import Layout from '../../../components/layouts/mainLayout';

const supabase = createClientComponentClient();

export default function EditProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestField, setRequestField] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // LOCKED: Core signup fields - require admin approval
  const LOCKED_FIELDS = ['first_name', 'last_name', 'email', 'country'];
  
  // EDITABLE: Can change directly
  const EDITABLE_FIELDS = ['admin_title', 'department', 'phone', 'responsibilities', 'access_level', 'bio'];
  
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
      
      // Show success notification
      showSuccessNotification(`${field.replace('_', ' ')} updated successfully`);
    } else {
      console.error('Save error:', error);
      showErrorNotification('Failed to save changes');
    }
    
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
  
  // Branded notification functions
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
        <svg style="width: 20px; height: 20px; margin-right: 12px;" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span style="font-weight: 600; font-size: 14px;">${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 4000);
  };

  const showErrorNotification = (message) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fef2f2;
      border-left: 4px solid #991b1b;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      z-index: 10000;
      max-width: 400px;
      font-family: 'Inter', sans-serif;
    `;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; color: #991b1b;">
        <svg style="width: 20px; height: 20px; margin-right: 12px;" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <span style="font-weight: 600; font-size: 14px;">${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 4000);
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
  
  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600 mt-2">Manage your administrator information and system access</p>
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
        
        {/* Administrative Information - EDITABLE */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <Edit className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Administrative Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EDITABLE_FIELDS.slice(0, 5).map(field => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {field.replace('_', ' ')}
                </label>
                <div className="flex gap-2">
                  <input
                    type={field === 'phone' ? 'tel' : 'text'}
                    value={editing[field] !== undefined ? editing[field] : profile?.[field] || ''}
                    onChange={(e) => handleEdit(field, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      field === 'phone' ? '+1 (555) 123-4567' : 
                      field === 'admin_title' ? 'Platform Administrator' : 
                      field === 'access_level' ? 'Full System Access' : 
                      field === 'responsibilities' ? 'Platform oversight, user management, etc.' : ''
                    }
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrator Biography</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">About Your Role</label>
            <textarea
              value={editing.bio !== undefined ? editing.bio : profile?.bio || ''}
              onChange={(e) => handleEdit('bio', e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your administrative role, experience, and oversight responsibilities..."
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
      // Show branded success notification
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
          <svg style="width: 20px; height: 20px; margin-right: 12px;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span style="font-weight: 600; font-size: 14px;">Change request submitted for approval</span>
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 4000);
      
      onSubmit();
    } else {
      console.error('Request submission error:', error);
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
