import { useState, useEffect } from 'react';

export default function AddEarningsForm({ artistId, onSuccess }) {
  const [releases, setReleases] = useState([]);
  const [formData, setFormData] = useState({
    asset_id: 'general', // Default to general earnings (not track-specific)
    earning_type: 'streaming',
    amount: '',
    currency: 'GBP',
    status: 'pending',
    payment_status: 'awaiting_payment',
    expected_payment_date: '',
    actual_payment_date: '',
    platform: '',
    territory: '',
    period_start: '',
    period_end: '',
    notes: ''
  });

  useEffect(() => {
    // Fetch artist's live releases
    if (artistId) {
      fetch(`/api/admin/releases?artist_id=${artistId}&status=live`)
        .then(res => res.json())
        .then(data => {
          // Handle API response properly
          if (data && Array.isArray(data)) {
            setReleases(data);
          } else if (data && Array.isArray(data.releases)) {
            setReleases(data.releases);
          } else {
            console.log('No releases found or API error:', data);
            setReleases([]); // Set empty array to prevent map errors
          }
        })
        .catch(err => {
          console.error('Error fetching releases:', err);
          setReleases([]); // Set empty array on error
        });
    }
  }, [artistId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch('/api/admin/earnings/add-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artist_id: artistId,
        earning_type: formData.earning_type,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        platform: formData.platform,
        territory: formData.territory,
        status: formData.status,
        notes: formData.notes,
        payment_date: formData.expected_payment_date || null,
        period_start: formData.period_start || null,
        period_end: formData.period_end || null
      })
    });

    if (response.ok) {
      // Show success notification using MSC brand style
      const successDiv = document.createElement('div');
      successDiv.innerHTML = `
        <div style="
          position: fixed; 
          top: 20px; 
          right: 20px; 
          background: #f0fdf4; 
          border-left: 4px solid #065f46; 
          padding: 16px 24px; 
          color: #065f46; 
          border-radius: 8px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 1000;
        ">
          Earnings entry added successfully!
        </div>
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => document.body.removeChild(successDiv), 3000);
      
      onSuccess();
      // Reset form
      setFormData({
        asset_id: '',
        earning_type: 'streaming',
        amount: '',
        currency: 'GBP',
        status: 'pending',
        payment_status: 'awaiting_payment',
        expected_payment_date: '',
        actual_payment_date: '',
        platform: '',
        territory: '',
        period_start: '',
        period_end: '',
        notes: ''
      });
    }
  };

  return (
    <div className="rounded-2xl shadow-lg p-6" style={{
      background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
      border: '1px solid rgba(31, 41, 55, 0.08)'
    }}>
      <h3 className="text-lg font-bold mb-6" style={{color: '#1f2937'}}>Add Earnings Entry</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{color: '#374151'}}>Select Asset (Release/Track)</label>
          <select
            value={formData.asset_id}
            onChange={(e) => setFormData({...formData, asset_id: e.target.value})}
            required
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              focusBorder: '#1f2937',
              focusBoxShadow: '0 0 0 3px rgba(31, 41, 55, 0.1)'
            }}
          >
            <option value="general">General Earnings (Not track-specific)</option>
            {releases.map(release => (
              <option key={release.id} value={release.id}>
                {release.title} - {release.artist}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{color: '#374151'}}>Earning Type</label>
          <select
            value={formData.earning_type}
            onChange={(e) => setFormData({...formData, earning_type: e.target.value})}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          >
            <option value="streaming">Streaming</option>
            <option value="sync">Sync Licensing</option>
            <option value="performance">Performance Rights</option>
            <option value="mechanical">Mechanical Royalties</option>
            <option value="download">Download Sales</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#374151'}}>Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#374151'}}>Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({...formData, currency: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            >
              <option value="GBP">GBP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#374151'}}>Payment Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid (MSC received)</option>
              <option value="held">On Hold</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#374151'}}>Expected Payment Date</label>
            <input
              type="date"
              value={formData.expected_payment_date}
              onChange={(e) => setFormData({...formData, expected_payment_date: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>
        </div>

        {formData.status === 'paid' && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#374151'}}>Actual Payment Date (when MSC received payment)</label>
            <input
              type="date"
              value={formData.actual_payment_date}
              onChange={(e) => setFormData({...formData, actual_payment_date: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#374151'}}>Platform</label>
            <input
              type="text"
              placeholder="e.g., Spotify, Netflix, BBC"
              value={formData.platform}
              onChange={(e) => setFormData({...formData, platform: e.target.value})}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                placeholder: '#9ca3af'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#374151'}}>Territory</label>
            <input
              type="text"
              placeholder="e.g., United Kingdom, Global"
              value={formData.territory}
              onChange={(e) => setFormData({...formData, territory: e.target.value})}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                placeholder: '#9ca3af'
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#374151'}}>Period Start</label>
            <input
              type="date"
              value={formData.period_start}
              onChange={(e) => setFormData({...formData, period_start: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#374151'}}>Period End</label>
            <input
              type="date"
              value={formData.period_end}
              onChange={(e) => setFormData({...formData, period_end: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px'
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{color: '#374151'}}>Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={3}
            placeholder="Any additional information..."
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              placeholder: '#9ca3af'
            }}
          />
        </div>

        <button 
          type="submit" 
          className="text-white font-medium py-3 px-6 rounded-lg transition-all"
          style={{
            background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
            border: '1px solid #1f2937'
          }}
          onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #374151 0%, #4b5563 100%)'}
          onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'}
        >
          Add Earnings Entry
        </button>
      </form>
    </div>
  );
}
