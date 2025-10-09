import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { createClient } from '@supabase/supabase-js';
import { getUserRoleSync } from '@/lib/user-utils';
import Layout from '@/components/layouts/mainLayout';
import CurrencySelector, { formatCurrency as sharedFormatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import NotificationModal from '@/components/shared/NotificationModal';
import useModals from '@/hooks/useModals';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function RevenueManagement() {
  const { user, isLoading } = useUser();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [revenueReports, setRevenueReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [approvalAction, setApprovalAction] = useState('approve');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Initialize modals hook
  const {
    notificationModal,
    showError,
    showSuccess,
    closeNotificationModal
  } = useModals();

  // Load revenue reports from API
  const loadRevenueReports = async () => {
    try {
      setLoadingReports(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found for loading reports');
        return;
      }

      const response = await fetch('/api/revenue/list', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📊 Loaded revenue reports for admin:', result.reports?.length || 0);
        setRevenueReports(result.reports || []);
      } else {
        console.error('Failed to load revenue reports:', response.status);
        showError('Failed to load revenue reports', 'Loading Error');
      }
    } catch (error) {
      console.error('Error loading revenue reports:', error);
      showError('Error loading revenue reports', 'Loading Error');
    } finally {
      setLoadingReports(false);
    }
  };

  // Handle approval/rejection
  const handleApprovalAction = async () => {
    if (!selectedReport) return;

    try {
      setProcessing(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        showError('Please log in to continue', 'Authentication Required');
        return;
      }

      const response = await fetch('/api/revenue/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          reportId: selectedReport.id,
          action: approvalAction,
          notes: approvalNotes
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process approval');
      }

      console.log('✅ Revenue report processed:', result);

      // Update local state
      setRevenueReports(prev => prev.map(report => 
        report.id === selectedReport.id 
          ? { ...report, status: approvalAction === 'approve' ? 'approved' : 'rejected' }
          : report
      ));

      setShowApprovalModal(false);
      setSelectedReport(null);
      setApprovalNotes('');
      
      showSuccess(
        `Revenue report ${approvalAction === 'approve' ? 'approved' : 'rejected'} successfully!${approvalAction === 'approve' ? ' Artist wallet has been credited.' : ''}`, 
        'Action Completed'
      );

    } catch (error) {
      console.error('Revenue approval failed:', error);
      showError(error.message || 'Failed to process approval', 'Action Failed');
    } finally {
      setProcessing(false);
    }
  };

  // Load reports when component mounts
  useEffect(() => {
    if (user) {
      loadRevenueReports();
    }
  }, [user]);

  // Filter reports based on status and search
  const filteredReports = revenueReports.filter(report => {
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      report.artist_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Calculate summary stats
  const summaryStats = {
    total: revenueReports.length,
    pending: revenueReports.filter(r => r.status === 'pending_approval').length,
    approved: revenueReports.filter(r => r.status === 'approved').length,
    rejected: revenueReports.filter(r => r.status === 'rejected').length,
    totalAmount: revenueReports.reduce((sum, r) => sum + (r.amount || 0), 0),
    pendingAmount: revenueReports.filter(r => r.status === 'pending_approval').reduce((sum, r) => sum + (r.amount || 0), 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  const userRole = getUserRoleSync(user);
  
  if (!['super_admin', 'company_admin'].includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Revenue Management</h1>
                <p className="text-sm text-gray-500">Approve and manage revenue reports from distribution partners</p>
              </div>
              <div className="flex items-center space-x-4">
                <CurrencySelector
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={updateCurrency}
                  compact={true}
                />
                <button
                  onClick={loadRevenueReports}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total Reports</div>
              <div className="text-2xl font-bold text-gray-900">{summaryStats.total}</div>
              <div className="text-sm text-gray-600">{sharedFormatCurrency(summaryStats.totalAmount, selectedCurrency)} total</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-yellow-600">Pending Approval</div>
              <div className="text-2xl font-bold text-yellow-900">{summaryStats.pending}</div>
              <div className="text-sm text-yellow-700">{sharedFormatCurrency(summaryStats.pendingAmount, selectedCurrency)} pending</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-green-600">Approved</div>
              <div className="text-2xl font-bold text-green-900">{summaryStats.approved}</div>
              <div className="text-sm text-green-700">Wallets credited</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-red-600">Rejected</div>
              <div className="text-2xl font-bold text-red-900">{summaryStats.rejected}</div>
              <div className="text-sm text-red-700">Needs review</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex-1 min-w-64">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by artist email, description, or report ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Revenue Reports Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Revenue Reports</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingReports ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading reports...</p>
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        {searchQuery || selectedStatus !== 'all' ? 'No reports match your filters.' : 'No revenue reports found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {report.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.artist_email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sharedFormatCurrency(report.amount, selectedCurrency)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {report.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            report.status === 'pending_approval'
                              ? 'bg-yellow-100 text-yellow-800'
                              : report.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {report.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {report.status === 'pending_approval' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedReport(report);
                                  setApprovalAction('approve');
                                  setShowApprovalModal(true);
                                }}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedReport(report);
                                  setApprovalAction('reject');
                                  setShowApprovalModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {report.status !== 'pending_approval' && (
                            <span className="text-gray-400">
                              {report.status === 'approved' ? 'Processed' : 'Rejected'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'} Revenue Report
                </h3>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Report Details:</div>
                  <div className="mt-2 space-y-1">
                    <div><strong>Artist:</strong> {selectedReport.artist_email}</div>
                    <div><strong>Amount:</strong> {sharedFormatCurrency(selectedReport.amount, selectedCurrency)}</div>
                    <div><strong>Description:</strong> {selectedReport.description}</div>
                    <div><strong>Period:</strong> {selectedReport.period}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes {approvalAction === 'reject' ? '(required)' : '(optional)'}
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows="3"
                    placeholder={`Add notes about this ${approvalAction}...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {approvalAction === 'approve' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-sm text-green-800">
                      <strong>Action:</strong> Approving this report will automatically credit {sharedFormatCurrency(selectedReport.amount, selectedCurrency)} to the artist's wallet.
                    </div>
                  </div>
                )}

                {approvalAction === 'reject' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-sm text-red-800">
                      <strong>Action:</strong> Rejecting this report will not credit any funds to the artist's wallet. Please provide a reason in the notes.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  disabled={processing}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprovalAction}
                  disabled={processing || (approvalAction === 'reject' && !approvalNotes.trim())}
                  className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                    approvalAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing ? 'Processing...' : (approvalAction === 'approve' ? 'Approve & Credit Wallet' : 'Reject Report')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={closeNotificationModal}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
        buttonText={notificationModal.buttonText}
      />
    </Layout>
  );
}
