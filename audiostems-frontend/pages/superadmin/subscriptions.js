import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { getUserRoleSync } from '@/lib/user-utils';
import { useUser } from '@/components/providers/SupabaseProvider';
import RoleBasedNavigation from '@/components/auth/RoleBasedNavigation';
import { Users, CreditCard, TrendingUp, Settings, Search, Filter, Edit3, Check, X } from 'lucide-react';

export default function SuperAdminSubscriptions() {
  const router = useRouter();
  const { user, isLoading: loading } = useUser();
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [updateForm, setUpdateForm] = useState({});

  useEffect(() => {
    if (!loading && user) {
      const userRole = getUserRoleSync(user);
      if (userRole !== 'super_admin') {
        router.push('/dashboard');
        return;
      }
      loadSubscriptions();
    }
  }, [user, loading, router]);

  const loadSubscriptions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/superadmin/subscriptions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
        setFilteredSubscriptions(data.subscriptions || []);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter subscriptions based on search and filters
  useEffect(() => {
    let filtered = subscriptions.filter(sub => {
      const matchesSearch = 
        sub.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPlan = filterPlan === 'all' || sub.plan === filterPlan;
      const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
      
      return matchesSearch && matchesPlan && matchesStatus;
    });
    
    setFilteredSubscriptions(filtered);
  }, [subscriptions, searchTerm, filterPlan, filterStatus]);

  const handleEditSubscription = (subscription) => {
    setEditingSubscription(subscription.id);
    setUpdateForm({
      plan: subscription.plan,
      status: subscription.status,
      max_releases: subscription.max_releases,
      advanced_analytics: subscription.advanced_analytics,
      priority_support: subscription.priority_support,
      custom_branding: subscription.custom_branding,
      amount: subscription.amount
    });
  };

  const handleUpdateSubscription = async (subscriptionId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/superadmin/update-subscription', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          updates: updateForm
        })
      });

      if (response.ok) {
        await loadSubscriptions();
        setEditingSubscription(null);
        setUpdateForm({});
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const formatPlan = (plan) => {
    const planMap = {
      'artist_starter': 'Artist Starter',
      'artist_pro': 'Artist Pro',
      'label_admin': 'Label Admin',
      'custom': 'Custom'
    };
    return planMap[plan] || plan;
  };

  const formatStatus = (status) => {
    const statusMap = {
      'active': 'Active',
      'inactive': 'Inactive',
      'cancelled': 'Cancelled',
      'past_due': 'Past Due',
      'paused': 'Paused'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
      'past_due': 'bg-yellow-100 text-yellow-800',
      'paused': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPlanColor = (plan) => {
    const colors = {
      'artist_starter': 'bg-blue-100 text-blue-800',
      'artist_pro': 'bg-purple-100 text-purple-800',
      'label_admin': 'bg-green-100 text-green-800',
      'custom': 'bg-orange-100 text-orange-800'
    };
    return colors[plan] || 'bg-gray-100 text-gray-800';
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <RoleBasedNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleBasedNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-2">Manage all user subscriptions and billing</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">Total Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900">{subscriptions.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">Active Subscriptions</p>
                <p className="text-3xl font-bold text-green-600">
                  {subscriptions.filter(s => s.status === 'active').length}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">Pro Plans</p>
                <p className="text-3xl font-bold text-purple-600">
                  {subscriptions.filter(s => s.plan === 'artist_pro').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">Monthly Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  £{subscriptions.filter(s => s.status === 'active').reduce((sum, s) => sum + parseFloat(s.amount || 0), 0).toFixed(2)}
                </p>
              </div>
              <Settings className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <select
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
              >
                <option value="all">All Plans</option>
                <option value="artist_starter">Artist Starter</option>
                <option value="artist_pro">Artist Pro</option>
                <option value="label_admin">Label Admin</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <select
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="cancelled">Cancelled</option>
                <option value="past_due">Past Due</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            
            <div className="text-right">
              <span className="text-sm text-gray-600">
                Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
              </span>
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Releases</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period End</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.firstName} {subscription.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{subscription.user_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingSubscription === subscription.id ? (
                        <select
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          value={updateForm.plan}
                          onChange={(e) => setUpdateForm({...updateForm, plan: e.target.value})}
                        >
                          <option value="artist_starter">Artist Starter</option>
                          <option value="artist_pro">Artist Pro</option>
                          <option value="label_admin">Label Admin</option>
                          <option value="custom">Custom</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(subscription.plan)}`}>
                          {formatPlan(subscription.plan)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingSubscription === subscription.id ? (
                        <select
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          value={updateForm.status}
                          onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="past_due">Past Due</option>
                          <option value="paused">Paused</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                          {formatStatus(subscription.status)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingSubscription === subscription.id ? (
                        <input
                          type="number"
                          step="0.01"
                          className="w-20 text-sm border border-gray-300 rounded px-2 py-1"
                          value={updateForm.amount}
                          onChange={(e) => setUpdateForm({...updateForm, amount: parseFloat(e.target.value)})}
                        />
                      ) : (
                        `£${parseFloat(subscription.amount || 0).toFixed(2)}`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingSubscription === subscription.id ? (
                        <input
                          type="number"
                          className="w-20 text-sm border border-gray-300 rounded px-2 py-1"
                          value={updateForm.max_releases}
                          onChange={(e) => setUpdateForm({...updateForm, max_releases: parseInt(e.target.value)})}
                        />
                      ) : (
                        subscription.max_releases === -1 ? 'Unlimited' : subscription.max_releases || '5'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {subscription.advanced_analytics && <span className="text-green-600">Analytics</span>}
                        {subscription.priority_support && <span className="text-blue-600">Support</span>}
                        {subscription.custom_branding && <span className="text-purple-600">Branding</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingSubscription === subscription.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateSubscription(subscription.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingSubscription(null);
                              setUpdateForm({});
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditSubscription(subscription)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No subscriptions found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
