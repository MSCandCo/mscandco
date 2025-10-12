import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Users,
  AlertCircle,
  Building
} from 'lucide-react';

export default function PayoutRequests() {
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');

  useEffect(() => {
    fetchPayoutRequests();
  }, []);

  const fetchPayoutRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payout/list');
      const data = await response.json();
      
      if (data.success) {
        setPayoutRequests(data.payout_requests);
        setStatistics(data.statistics);
        console.log('💰 Payout requests loaded:', data.payout_requests.length);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error loading payout requests:', error);
      showNotification('Failed to load payout requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (payoutId) => {
    setProcessing(payoutId);
    try {
      const response = await fetch('/api/admin/payout/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payout_id: payoutId,
          action: 'approve',
          notes: 'Approved by admin'
        })
      });

      const result = await response.json();

      if (response.ok) {
        showNotification(`Payout approved successfully! £${result.payout.amount} processed.`, 'success');
        fetchPayoutRequests(); // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to approve payout');
      }
    } catch (error) {
      console.error('Error approving payout:', error);
      showNotification(`Failed to approve payout: ${error.message}`, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectNotes.trim()) {
      showNotification('Please provide a reason for rejection', 'error');
      return;
    }

    setProcessing(rejectModal.id);
    try {
      const response = await fetch('/api/admin/payout/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payout_id: rejectModal.id,
          action: 'reject',
          notes: rejectNotes
        })
      });

      const result = await response.json();

      if (response.ok) {
        showNotification('Payout rejected successfully', 'success');
        setRejectModal(null);
        setRejectNotes('');
        fetchPayoutRequests(); // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to reject payout');
      }
    } catch (error) {
      console.error('Error rejecting payout:', error);
      showNotification(`Failed to reject payout: ${error.message}`, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#f0fdf4' : '#fef2f2';
    const borderColor = type === 'success' ? '#065f46' : '#991b1b';
    const textColor = type === 'success' ? '#065f46' : '#991b1b';
    const icon = type === 'success' ? '✓' : '✕';

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 20px; height: 20px; border-radius: 50%; background: ${borderColor}; display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 12px; font-weight: bold;">${icon}</span>
        </div>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">
            ${type === 'success' ? 'Success' : 'Error'}
          </div>
          <div style="font-size: 14px; opacity: 0.9;">${message}</div>
        </div>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 1001;
      background: ${bgColor}; border-left: 4px solid ${borderColor}; color: ${textColor};
      padding: 16px 20px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      min-width: 350px; max-width: 400px; animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' },
      paid: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
      rejected: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' }
    };
    
    const style = styles[status] || styles.pending;
    
    return (
      <span
        className="px-3 py-1 rounded-full text-sm font-medium"
        style={{
          backgroundColor: style.bg,
          color: style.text,
          border: `1px solid ${style.border}`
        }}
      >
        {status === 'paid' ? 'Approved' : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{borderColor: '#1f2937', borderTopColor: 'transparent'}}></div>
          <h2 className="text-xl font-semibold mb-2" style={{color: '#1f2937'}}>Loading Payout Requests</h2>
          <p style={{color: '#64748b'}}>Please wait...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = payoutRequests.filter(p => p.status === 'pending');
  const completedRequests = payoutRequests.filter(p => p.status !== 'pending');

  return (
    <div className="min-h-screen p-8" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{color: '#1f2937'}}>Payout Requests</h1>
            <p style={{color: '#64748b'}}>Manage artist payout requests and approvals</p>
          </div>
          <button
            onClick={fetchPayoutRequests}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
            style={{background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)', color: 'white'}}
          >
            <Clock className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium" style={{color: '#64748b'}}>Total Pending</h3>
              <DollarSign className="w-5 h-5" style={{color: '#d97706'}} />
            </div>
            <p className="text-3xl font-bold mb-2" style={{color: '#1f2937'}}>
              £{statistics.total_pending.toFixed(2)}
            </p>
            <p className="text-sm" style={{color: '#64748b'}}>
              {statistics.requests_count.pending} requests
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium" style={{color: '#64748b'}}>Approved This Month</h3>
              <TrendingUp className="w-5 h-5" style={{color: '#065f46'}} />
            </div>
            <p className="text-3xl font-bold mb-2" style={{color: '#1f2937'}}>
              £{statistics.approved_this_month.toFixed(2)}
            </p>
            <p className="text-sm" style={{color: '#64748b'}}>Monthly total</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium" style={{color: '#64748b'}}>Total Requests</h3>
              <Users className="w-5 h-5" style={{color: '#475569'}} />
            </div>
            <p className="text-3xl font-bold mb-2" style={{color: '#1f2937'}}>
              {statistics.requests_count.total}
            </p>
            <div className="text-sm" style={{color: '#64748b'}}>
              <span style={{color: '#065f46'}}>{statistics.requests_count.approved} approved</span> • 
              <span style={{color: '#991b1b'}}> {statistics.requests_count.rejected} rejected</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium" style={{color: '#64748b'}}>Processing Queue</h3>
              <AlertCircle className="w-5 h-5" style={{color: '#d97706'}} />
            </div>
            <p className="text-3xl font-bold mb-2" style={{color: '#1f2937'}}>
              {statistics.requests_count.pending}
            </p>
            <p className="text-sm" style={{color: '#64748b'}}>Awaiting approval</p>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{color: '#1f2937'}}>
            Pending Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-4">
            {pendingRequests.map(request => (
              <div key={request.id} className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold" style={{color: '#1f2937'}}>
                        {request.artist_name}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3" style={{color: '#374151'}}>Request Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" style={{color: '#64748b'}} />
                            <span className="text-2xl font-bold" style={{color: '#1f2937'}}>
                              {request.currency}{request.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" style={{color: '#64748b'}} />
                            <span style={{color: '#64748b'}}>
                              {new Date(request.request_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4" style={{color: '#64748b'}} />
                            <span style={{color: '#64748b'}}>Bank Transfer</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3" style={{color: '#374151'}}>Artist Contact</h4>
                        <div className="space-y-2">
                          <p style={{color: '#64748b'}}>
                            <strong>Email:</strong> {request.artist_email}
                          </p>
                          <p style={{color: '#64748b'}}>
                            <strong>ID:</strong> {request.artist_id.substring(0, 8)}...
                          </p>
                          {request.notes && (
                            <div>
                              <p style={{color: '#64748b'}}>
                                <strong>Notes:</strong>
                              </p>
                              <p className="text-sm" style={{color: '#9ca3af'}}>
                                {request.notes.substring(0, 100)}...
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 ml-6">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={processing === request.id}
                      className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                      style={{background: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)', color: 'white'}}
                    >
                      {processing === request.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => setRejectModal(request)}
                      disabled={processing === request.id}
                      className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                      style={{background: 'linear-gradient(135deg, #991b1b 0%, #ef4444 100%)', color: 'white'}}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {completedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4" style={{color: '#1f2937'}}>
            Recent Activity ({completedRequests.length})
          </h2>
          <div className="bg-white rounded-xl shadow-md border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-semibold" style={{color: '#374151'}}>Artist</th>
                    <th className="text-left p-4 font-semibold" style={{color: '#374151'}}>Amount</th>
                    <th className="text-left p-4 font-semibold" style={{color: '#374151'}}>Status</th>
                    <th className="text-left p-4 font-semibold" style={{color: '#374151'}}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {completedRequests.slice(0, 10).map(request => (
                    <tr key={request.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium" style={{color: '#1f2937'}}>
                            {request.artist_name}
                          </p>
                          <p className="text-sm" style={{color: '#64748b'}}>
                            {request.artist_email}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold" style={{color: '#1f2937'}}>
                          {request.currency}{request.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="p-4" style={{color: '#64748b'}}>
                        {new Date(request.last_updated || request.request_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {payoutRequests.length === 0 && (
        <div className="text-center py-16">
          <DollarSign className="w-16 h-16 mx-auto mb-4" style={{color: '#9ca3af'}} />
          <h3 className="text-xl font-semibold mb-2" style={{color: '#374151'}}>No Payout Requests</h3>
          <p style={{color: '#64748b'}}>Payout requests will appear here when artists submit them.</p>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold" style={{color: '#1f2937'}}>
                Reject Payout Request
              </h3>
              <p className="text-sm mt-1" style={{color: '#64748b'}}>
                {rejectModal.artist_name} - £{rejectModal.amount.toFixed(2)}
              </p>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium mb-2" style={{color: '#374151'}}>
                Reason for rejection
              </label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Please provide a clear reason for rejecting this payout request..."
              />
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectNotes('');
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectNotes.trim() || processing === rejectModal.id}
                className="flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{background: 'linear-gradient(135deg, #991b1b 0%, #ef4444 100%)', color: 'white'}}
              >
                {processing === rejectModal.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span>Reject Payout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
