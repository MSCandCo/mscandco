import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { 
  Users, UserCheck, UserX, Eye, Mail, Calendar,
  CheckCircle, XCircle, Clock, Search, Filter, Shield,
  Building2, Settings, AlertTriangle
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import { getUsers, getReleases } from '../../lib/emptyData';
import { getUserRole } from '../../lib/auth0-config';
import { Avatar } from '../../components/shared/Avatar';
import { SuccessModal } from '../../components/shared/SuccessModal';

export default function SuperAdminApprovals() {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [bulkAction, setBulkAction] = useState('');
  const [selectedArtists, setSelectedArtists] = useState([]);

  // Get user context
  const userRole = getUserRole(user);

  // Get ALL artists across ALL brands (Super Admin sees everything)
  const [artists, setArtists] = useState(
    getUsers().filter(u => u.role === 'artist')
  );

  // Get all brands for filtering
  const brands = [...new Set(artists.map(a => a.brand || a.label).filter(Boolean))];

  // Check super admin access
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const role = getUserRole(user);
      if (!['super_admin', 'company_admin'].includes(role)) {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Filter artists
  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.primaryGenre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || artist.approvalStatus === statusFilter;
    const matchesBrand = brandFilter === 'all' || artist.brand === brandFilter || artist.label === brandFilter;
    return matchesSearch && matchesStatus && matchesBrand;
  });

  // Handle approval actions
  const handleApproval = (artistId, action) => {
    setArtists(prev => prev.map(artist => 
      artist.id === artistId 
        ? { 
            ...artist, 
            approvalStatus: action === 'approve' ? 'approved' : 'rejected',
            lastUpdated: new Date().toISOString().split('T')[0],
            approvedBy: user?.name || 'Super Admin'
          }
        : artist
    ));

    const artist = artists.find(a => a.id === artistId);
    setSuccessMessage(
      action === 'approve' 
        ? `${artist.name} has been approved successfully by Super Admin!`
        : `${artist.name} has been rejected by Super Admin.`
    );
    setShowSuccessModal(true);
  };

  // Handle bulk actions (Super Admin feature)
  const handleBulkAction = () => {
    if (!bulkAction || selectedArtists.length === 0) return;

    setArtists(prev => prev.map(artist => 
      selectedArtists.includes(artist.id)
        ? { 
            ...artist, 
            approvalStatus: bulkAction,
            lastUpdated: new Date().toISOString().split('T')[0],
            approvedBy: user?.name || 'Super Admin'
          }
        : artist
    ));

    setSuccessMessage(
      `${selectedArtists.length} artists have been ${bulkAction} by Super Admin!`
    );
    setShowSuccessModal(true);
    setSelectedArtists([]);
    setBulkAction('');
  };

  // Toggle artist selection
  const toggleArtistSelection = (artistId) => {
    setSelectedArtists(prev => 
      prev.includes(artistId) 
        ? prev.filter(id => id !== artistId)
        : [...prev, artistId]
    );
  };

  // Select all filtered artists
  const selectAllArtists = () => {
    const allIds = filteredArtists.map(a => a.id);
    setSelectedArtists(allIds);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Loading state
  if (isLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading artist approvals...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title="Super Admin - Artist Approvals"
        description="Super admin artist approval management across all brands"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <Shield className="w-8 h-8 mr-3" />
                  <h1 className="text-3xl font-bold">Super Admin - Artist Approvals</h1>
                </div>
                <p className="text-red-100 text-lg">
                  Platform-wide artist approval management across all brands
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-red-100">Global Pending Approvals</div>
                <div className="text-2xl font-bold">
                  {filteredArtists.filter(a => a.approvalStatus === 'pending').length}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Artists</p>
                  <p className="text-3xl font-bold text-gray-900">{artists.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {artists.filter(a => a.approvalStatus === 'pending').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-green-600">
                    {artists.filter(a => a.approvalStatus === 'approved').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">
                    {artists.filter(a => a.approvalStatus === 'rejected').length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <UserX className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Brands</p>
                  <p className="text-3xl font-bold text-purple-600">{brands.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Building2 className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filters, and Bulk Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Artists</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or genre..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Brand</label>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bulk Actions</label>
                <div className="flex space-x-2">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Select Action</option>
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction || selectedArtists.length === 0}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Selection Controls */}
            {selectedArtists.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-800">
                    {selectedArtists.length} artists selected
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={selectAllArtists}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Select All ({filteredArtists.length})
                    </button>
                    <button
                      onClick={() => setSelectedArtists([])}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Artists List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Artists for Approval ({filteredArtists.length})
                </h3>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Super Admin Control</span>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredArtists.map((artist) => (
                <div key={artist.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedArtists.includes(artist.id)}
                        onChange={() => toggleArtistSelection(artist.id)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mr-4"
                      />
                      
                      <Avatar 
                        name={artist.name}
                        image={artist.profileImage}
                        size="w-14 h-14"
                        textSize="text-lg"
                      />
                      
                      <div className="ml-4">
                        <h4 className="text-lg font-semibold text-gray-900">{artist.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {artist.email || `${artist.name.toLowerCase().replace(/\s+/g, '.')}@artist.com`}
                          </div>
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {artist.brand || artist.label || 'Unknown Brand'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Joined: {artist.joinDate || '2024-01-15'}
                          </div>
                        </div>
                        <div className="flex items-center mt-2 space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(artist.approvalStatus)}`}>
                            {artist.approvalStatus?.toUpperCase() || 'PENDING'}
                          </span>
                          <span className="text-sm text-gray-600">
                            Genre: {artist.primaryGenre}
                          </span>
                          <span className="text-sm text-gray-600">
                            Releases: {artist.releases || 0}
                          </span>
                          <span className="text-sm text-gray-600">
                            Earnings: {formatCurrency(artist.totalEarnings || 0, selectedCurrency)}
                          </span>
                          {artist.approvedBy && (
                            <span className="text-sm text-gray-600">
                              By: {artist.approvedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedArtist(artist)}
                        className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      
                      {artist.approvalStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproval(artist.id, 'approve')}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </button>
                          
                          <button
                            onClick={() => handleApproval(artist.id, 'reject')}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                        </>
                      )}
                      
                      {artist.approvalStatus === 'approved' && (
                        <button
                          onClick={() => handleApproval(artist.id, 'reject')}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Revoke
                        </button>
                      )}
                      
                      {artist.approvalStatus === 'rejected' && (
                        <button
                          onClick={() => handleApproval(artist.id, 'approve')}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Re-approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredArtists.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
                  <p className="text-gray-500">
                    Try adjusting your search terms or filters to find the artists you're looking for.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal 
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </MainLayout>
  );
}