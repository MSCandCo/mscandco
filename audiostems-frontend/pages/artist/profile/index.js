import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, Edit, Save, X } from 'lucide-react';

export default function ArtistProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestField, setRequestField] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const LOCKED_FIELDS = ['first_name', 'last_name', 'email', 'nationality', 'country', 'city'];
  const EDITABLE_FIELDS = ['artist_name', 'artist_type', 'phone', 'primary_genre', 'secondary_genre', 'years_active', 'record_label', 'bio'];
  
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
  
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Artist Profile</h1>
      
      <section className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center mb-4">
          <Lock className="w-5 h-5 text-gray-400 mr-2" />
          <h2 className="text-xl font-semibold">Personal Information</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">These fields require admin approval</p>
        
        <div className="grid grid-cols-2 gap-6">
          {LOCKED_FIELDS.map(field => (
            <div key={field}>
              <label className="block text-sm font-medium mb-2 capitalize">
                {field.replace('_', ' ')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={profile?.[field] || ''}
                  disabled
                  className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => requestChange(field)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                >
                  Request Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <section className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Artist Information</h2>
        
        <div className="grid grid-cols-2 gap-6">
          {EDITABLE_FIELDS.map(field => (
            <div key={field}>
              <label className="block text-sm font-medium mb-2 capitalize">
                {field.replace('_', ' ')}
              </label>
              <div className="flex gap-2">
                <input
                  type={field === 'bio' ? 'textarea' : 'text'}
                  value={editing[field] !== undefined ? editing[field] : profile?.[field] || ''}
                  onChange={(e) => handleEdit(field, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                {editing[field] !== undefined && (
                  <>
                    <button onClick={() => saveField(field)} className="px-4 py-2 bg-green-600 text-white rounded-lg">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => cancelEdit(field)} className="px-4 py-2 bg-gray-200 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {showRequestModal && (
        <RequestChangeModal
          field={requestField}
          currentValue={profile?.[requestField]}
          onClose={() => setShowRequestModal(false)}
          onSubmit={() => setShowRequestModal(false)}
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
    
    await supabase.from('profile_change_requests').insert({
      user_id: user.id,
      field_name: field,
      current_value: currentValue,
      requested_value: newValue,
      reason: reason,
      status: 'pending'
    });
    
    setSubmitting(false);
    alert('Request submitted');
    onSubmit();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Request Change</h3>
        <div className="space-y-4">
          <input type="text" value={field} disabled className="w-full p-2 border rounded bg-gray-50" />
          <input type="text" value={currentValue || ''} disabled className="w-full p-2 border rounded bg-gray-50" />
          <input 
            type="text" 
            placeholder="New value" 
            value={newValue} 
            onChange={(e) => setNewValue(e.target.value)} 
            className="w-full p-2 border rounded" 
          />
          <textarea 
            placeholder="Reason" 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            className="w-full p-2 border rounded" 
            rows={3}
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleSubmit} disabled={!newValue || !reason || submitting} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}