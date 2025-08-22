import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Users, Music, Building2,
  TrendingUp, DollarSign, UserCheck, Settings,
  Target, Activity, Globe, Eye, FileText, BarChart3
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import CurrencySelector, { formatCurrency, useCurrencySync } from '../../components/shared/CurrencySelector';
import { getUsers, getReleases } from '../../lib/emptyData';
import { getUserRole, getUserBrand } from '../../lib/user-utils';

export default function CompanyAdminDashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');
  
  // Revenue Split Configuration State
  const [revenueSplit, setRevenueSplit] = useState({
    distributionPartnerPercentage: 15, // Code Group takes 15% first
    companyAdminPercentage: 10,        // Company Admin takes 10% second
    labelAdminPercentage: 25,          // Default: 25% of final remainder
    artistPercentage: 75,              // Default: 75% of final remainder
    distributionPartnerName: 'Code Group'
  });
  const [showSplitConfig, setShowSplitConfig] = useState(false);
  const [splitConfigSaved, setSplitConfigSaved] = useState(false);
  
  // Individual Label Admin Percentages (key: labelAdminId, value: percentage)
  const [individualLabelAdminPercentages, setIndividualLabelAdminPercentages] = useState({});

  // Get user context
  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Company Admin manages entire MSC & Co MSC branch (all label admins + all artists)
  const allUsers = getUsers();
  const allReleases = getReleases();
  
  // MSC & Co MSC branch includes ALL label admins and ALL artists
  const labelAdmins = allUsers.filter(u => u.role === 'label_admin');
  const artists = allUsers.filter(u => u.role === 'artist');
  const jurisdictionUsers = [...labelAdmins, ...artists];
  const approvedArtists = artists.filter(a => a.approvalStatus === 'approved');


  
  
  const totalRevenue = artists.reduce((total, artist) => total + (artist.totalRevenue || artist.totalEarnings || 0), 0);
  const totalStreams = artists.reduce((total, artist) => total + (artist.totalStreams || 0), 0);
  const totalReleases = artists.reduce((total, artist) => total + (artist.totalReleases || 0), 0);

  // Release status breakdown
  const liveReleases = allReleases.filter(r => ['live', 'distributed'].includes(r.status)).length;
  const inReviewReleases = allReleases.filter(r => r.status === 'in_review').length;
  const approvalsReleases = allReleases.filter(r => r.status === 'approvals').length;
  const draftReleases = allReleases.filter(r => r.status === 'draft').length;

  // Song count (tracks across all releases)
  const totalSongs = allReleases.reduce((total, release) => total + (release.trackListing?.length || 1), 0);

  // Revenue Split Management Functions
  const handleSplitChange = (field, value) => {
    if (field === 'labelAdminPercentage') {
      const newLabelPercentage = Math.min(100, Math.max(0, value));
      const newArtistPercentage = 100 - newLabelPercentage;
      setRevenueSplit(prev => ({
        ...prev,
        labelAdminPercentage: newLabelPercentage,
        artistPercentage: newArtistPercentage
      }));
    } else if (field === 'distributionPartnerPercentage') {
      setRevenueSplit(prev => ({
        ...prev,
        distributionPartnerPercentage: Math.min(50, Math.max(0, value))
      }));
    }
  };

  const handleIndividualLabelAdminPercentage = (labelAdminId, percentage) => {
    setIndividualLabelAdminPercentages(prev => ({
      ...prev,
      [labelAdminId]: Math.min(100, Math.max(0, percentage))
    }));
  };

  const saveSplitConfiguration = () => {
    // In a real app, this would save to backend
    console.log('Saving revenue split configuration:', revenueSplit);
    console.log('Saving individual label admin percentages:', individualLabelAdminPercentages);
    setSplitConfigSaved(true);
    setTimeout(() => setSplitConfigSaved(false), 3000);
  };

  const calculateSplitAmounts = (totalAmount) => {
    // Step 1: Code Group takes their percentage first
    const distributionPartnerAmount = totalAmount * (revenueSplit.distributionPartnerPercentage / 100);
    const afterDistributionPartner = totalAmount - distributionPartnerAmount;
    
    // Step 2: Company Admin takes their percentage from what's left
    const companyAdminAmount = afterDistributionPartner * (revenueSplit.companyAdminPercentage / 100);
    const afterCompanyAdmin = afterDistributionPartner - companyAdminAmount;
    
    // Step 3: Remaining amount is split between Label Admin and Artist
    const labelAdminAmount = afterCompanyAdmin * (revenueSplit.labelAdminPercentage / 100);
    const artistAmount = afterCompanyAdmin * (revenueSplit.artistPercentage / 100);
    
    return {
      distributionPartner: distributionPartnerAmount,
      afterDistributionPartner,
      companyAdmin: companyAdminAmount,
      afterCompanyAdmin,
      labelAdmin: labelAdminAmount,
      artist: artistAmount
    };
  };

  // Check admin access
  useEffect(() => {
    if (!isLoading && user) {
      const role = getUserRole(user);
      if (role !== 'company_admin') {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
    }
  }, [user, isLoading, user, router]);

  // Loading state
  if (isLoading || loading) {
    return (
      <MainLayout>
        <SEO title="Company Admin Dashboard" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <SEO title="Company Admin Dashboard" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">Company Admin Dashboard</h1>
                <p className="text-purple-100 text-lg">
                  MSC & Co MSC Branch - All Labels & Artists Management
                </p>
                <p className="text-purple-200 text-sm mt-2">
                  Managing {labelAdmins.length} label admins and {artists.length} artists
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-100">Platform Health</div>
                <div className="text-2xl font-bold">
                  {artists.length > 0 ? Math.round((approvedArtists.length / artists.length) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="mb-6 flex justify-end">
            <CurrencySelector 
              selectedCurrency={selectedCurrency}
              onCurrencyChange={updateCurrency}
            />
          </div>

          {/* Key Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Total Artists */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Artists</p>
                  <p className="text-3xl font-bold text-gray-900">{artists.length}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <UserCheck className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">{approvedArtists.length} approved</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Releases */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Releases</p>
                  <p className="text-3xl font-bold text-gray-900">{allReleases.length}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">{liveReleases} live</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Music className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p 
                    className="font-bold text-gray-900"
                    style={{
                      fontSize: `${Math.min(28, Math.max(16, 200 / formatCurrency(totalRevenue, selectedCurrency).length))}px`
                    }}
                  >
                    {formatCurrency(totalRevenue, selectedCurrency)}
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">Active income</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Total Label Admins */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Label Admins</p>
                  <p className="text-3xl font-bold text-gray-900">{labelAdmins.length}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <Activity className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-yellow-600">Active management</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Target className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Earnings Overview</h3>
              <Link 
                href="/companyadmin/earnings"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                View Full Earnings
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(284729.35, selectedCurrency)}
                </div>
                <div className="text-sm text-green-700 mt-1">Company Earnings</div>
                <div className="text-xs text-green-500 mt-1">This month</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(251456.78, selectedCurrency)}
                </div>
                <div className="text-sm text-blue-700 mt-1">Available to Withdraw</div>
                <div className="text-xs text-blue-500 mt-1">Ready now</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">89</div>
                <div className="text-sm text-orange-700 mt-1">Earning Assets</div>
                <div className="text-xs text-orange-500 mt-1">Generating revenue</div>
              </div>
            </div>
          </div>

          {/* Label Admins Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Label Admins Overview</h3>
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {labelAdmins.map((admin, index) => (
                <div key={admin.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {admin.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{admin.name}</div>
                      <div className="text-sm text-gray-500">{admin.brand}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {artists.filter(a => a.brand === admin.brand).length}
                      </div>
                      <div className="text-xs text-gray-500">Artists</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{admin.status === 'active' ? 'Active' : 'Inactive'}</div>
                      <div className="text-xs text-gray-500">Status</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/admin/users')}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Manage All Label Admins
            </button>
          </div>

          {/* Code Group Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Code Group Configuration</h3>
              <button
                onClick={() => setShowSplitConfig(!showSplitConfig)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showSplitConfig ? 'Hide Settings' : 'Configure Split'}
              </button>
            </div>

            {/* Current Split Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Code Group</p>
                    <p className="text-2xl font-bold text-red-600">{revenueSplit.distributionPartnerPercentage}%</p>
                    <p className="text-xs text-red-500">First deduction</p>
                  </div>
                  <Target className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Company Admin</p>
                    <p className="text-2xl font-bold text-purple-600">{revenueSplit.companyAdminPercentage || 10}%</p>
                    <p className="text-xs text-purple-500">Second deduction</p>
                  </div>
                  <Building2 className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Label Admin</p>
                    <p className="text-2xl font-bold text-blue-600">{revenueSplit.labelAdminPercentage}%</p>
                    <p className="text-xs text-blue-500">Of final remainder</p>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Artist</p>
                    <p className="text-2xl font-bold text-green-600">{revenueSplit.artistPercentage}%</p>
                    <p className="text-xs text-green-500">Of final remainder</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* Example Calculation */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Example: {formatCurrency(100000, selectedCurrency)} Total Revenue Flow</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-red-600 font-medium">Code Group:</span>
                  <br />
                  <span className="text-lg font-bold text-red-600">{formatCurrency(calculateSplitAmounts(100000).distributionPartner, selectedCurrency)}</span>
                  <div className="text-xs text-gray-500 mt-1">First cut</div>
                </div>
                <div>
                  <span className="text-purple-600 font-medium">Company Admin:</span>
                  <br />
                  <span className="text-lg font-bold text-purple-600">{formatCurrency(calculateSplitAmounts(100000).companyAdmin, selectedCurrency)}</span>
                  <div className="text-xs text-gray-500 mt-1">Second cut</div>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Final Pool:</span>
                  <br />
                  <span className="text-lg font-bold text-gray-700">{formatCurrency(calculateSplitAmounts(100000).afterCompanyAdmin, selectedCurrency)}</span>
                  <div className="text-xs text-gray-500 mt-1">To split</div>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Label Admin:</span>
                  <br />
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(calculateSplitAmounts(100000).labelAdmin, selectedCurrency)}</span>
                  <div className="text-xs text-gray-500 mt-1">From pool</div>
                </div>
                <div>
                  <span className="text-green-600 font-medium">Artist:</span>
                  <br />
                  <span className="text-lg font-bold text-green-600">{formatCurrency(calculateSplitAmounts(100000).artist, selectedCurrency)}</span>
                  <div className="text-xs text-gray-500 mt-1">From pool</div>
                </div>
              </div>
            </div>

            {/* Configuration Panel */}
            {showSplitConfig && (
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code Group Percentage
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={revenueSplit.distributionPartnerPercentage}
                        onChange={(e) => handleSplitChange('distributionPartnerPercentage', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={revenueSplit.distributionPartnerPercentage}
                          onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                          handleSplitChange('distributionPartnerPercentage', isNaN(value) ? 0 : value);
                        }}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Deducted first from total revenue</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Admin Percentage
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={revenueSplit.companyAdminPercentage}
                        onChange={(e) => handleSplitChange('companyAdminPercentage', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={revenueSplit.companyAdminPercentage}
                          onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                          handleSplitChange('companyAdminPercentage', isNaN(value) ? 0 : value);
                        }}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Deducted second (after Code Group)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Label Admin Percentage
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={revenueSplit.labelAdminPercentage}
                        onChange={(e) => handleSplitChange('labelAdminPercentage', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={revenueSplit.labelAdminPercentage}
                          onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                          handleSplitChange('labelAdminPercentage', isNaN(value) ? 0 : value);
                        }}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Of final pool (Artist gets {revenueSplit.artistPercentage}%)</p>
                  </div>
                </div>

                {/* Individual Label Admin Percentages */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Individual Label Admin Percentages</h4>
                  <div className="space-y-4">
                    {labelAdmins.map((labelAdmin) => {
                      const currentPercentage = individualLabelAdminPercentages[labelAdmin.id] !== undefined 
                        ? individualLabelAdminPercentages[labelAdmin.id] 
                        : revenueSplit.labelAdminPercentage;
                      const correspondingArtistPercentage = 100 - currentPercentage;
                      
                      return (
                        <div key={labelAdmin.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {labelAdmin.firstName?.charAt(0)}{labelAdmin.lastName?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{labelAdmin.firstName} {labelAdmin.lastName}</p>
                                <p className="text-sm text-gray-500">{labelAdmin.brand || 'MSC & Co MSC'}</p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {artists.filter(a => a.brand === labelAdmin.brand).length} artists
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Label Admin Percentage (of final pool)
                              </label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={currentPercentage}
                                  onChange={(e) => handleIndividualLabelAdminPercentage(labelAdmin.id, parseInt(e.target.value))}
                                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={currentPercentage}
                                    onChange={(e) => {
                                      const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                                      handleIndividualLabelAdminPercentage(labelAdmin.id, isNaN(value) ? 0 : value);
                                    }}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                  />
                                  <span className="text-gray-500">%</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Artists under this Label Admin get
                              </label>
                              <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-center">
                                <span className="text-lg font-bold text-green-600">{correspondingArtistPercentage}%</span>
                                <span className="text-sm text-gray-500 ml-2">of final pool</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {labelAdmins.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No label admins found to configure</p>
                    </div>
                  )}
                </div>

                {/* Individual Percentage Note */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">How Individual Percentages Work</h4>
                  <p className="text-sm text-blue-700">
                    Each label admin can have a custom percentage of the final pool (after Code Group and Company Admin deductions). 
                    Their artists automatically get the remaining percentage. Individual artist percentages can be set in User Management.
                  </p>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={saveSplitConfiguration}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      splitConfigSaved 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {splitConfigSaved ? '✓ Configuration Saved!' : 'Save Configuration'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="flex items-center justify-center p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Users className="w-6 h-6 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">Users</span>
              </button>
              
              <button
                onClick={() => router.push('/admin/content')}
                className="flex items-center justify-center p-4 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              >
                <FileText className="w-6 h-6 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Content</span>
              </button>
              
              <button
                onClick={() => router.push('/admin/analytics')}
                className="flex items-center justify-center p-4 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <BarChart3 className="w-6 h-6 text-purple-600 mr-2" />
                <span className="font-medium text-purple-800">Analytics</span>
              </button>
              
              <button
                onClick={() => router.push('/distribution/workflow')}
                className="flex items-center justify-center p-4 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                <Activity className="w-6 h-6 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">Workflow</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}