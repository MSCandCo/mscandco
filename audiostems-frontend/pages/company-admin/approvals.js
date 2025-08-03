import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { 
  Users, UserCheck, UserX, Eye, Mail, Calendar,
  CheckCircle, XCircle, Clock, Search, Filter
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import { ARTISTS, RELEASES } from '../../lib/mockData';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import { Avatar } from '../../components/shared/Avatar';
import { SuccessModal } from '../../components/shared/SuccessModal';

export default function CompanyAdminApprovals() {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Get user context
  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);
  const brandName = userBrand?.displayName || 'MSC & Co';

  // Get all artists for this brand
  const [artists, setArtists] = useState(
    ARTISTS.filter(a => a.brand === brandName || a.label === brandName)
  );

  // Check admin access
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const role = getUserRole(user);
      if (role !== 'company_admin') {
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
    return matchesSearch && matchesStatus;
  });

  // Handle approval actions
  const handleApproval = (artistId, action) => {
    setArtists(prev => prev.map(artist => 
      artist.id === artistId 
        ? { 
            ...artist, 
            approvalStatus: action === 'approve' ? 'approved' : 'rejected',
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : artist
    ));

    const artist = artists.find(a => a.id === artistId);
    setSuccessMessage(
      action === 'approve' 
        ? `${artist.name} has been approved successfully!`
        : `${artist.name} has been rejected.`
    );
    setShowSuccessModal(true);
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading artist approvals...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO 
        title={`${brandName} - Artist Approvals`}
        description="Company admin artist approval management"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">Artist Approvals</h1>
                <p className="text-purple-100 text-lg">
                  Manage artist approvals for {brandName}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-100">Pending Approvals</div>
                <div className="text-2xl font-bold">
                  {filteredArtists.filter(a => a.approvalStatus === 'pending').length}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Artists</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or genre..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Artists List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Artists for Approval ({filteredArtists.length})
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredArtists.map((artist) => (
                <div key={artist.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
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