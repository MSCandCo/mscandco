import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { createClient } from '@supabase/supabase-js';
import { getUserRoleSync } from '@/lib/user-utils';
import { Users, Search, Filter, Music, User, Mail, Phone, MapPin, Calendar, Eye, Edit, Plus } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LabelAdminRoster() {
  const { user } = useUser();
  const [roster, setRoster] = useState([]);
  const [filteredRoster, setFilteredRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const userRole = getUserRoleSync(user);

  // Contributor types
  const contributorTypes = [
    { value: 'all', label: 'All Contributors' },
    { value: 'artist', label: 'Artists' },
    { value: 'producer', label: 'Producers' },
    { value: 'songwriter', label: 'Songwriters' },
    { value: 'composer', label: 'Composers' },
    { value: 'performer', label: 'Performers' },
    { value: 'featured_artist', label: 'Featured Artists' },
    { value: 'vocalist', label: 'Vocalists' },
    { value: 'instrumentalist', label: 'Instrumentalists' },
    { value: 'engineer', label: 'Engineers' },
    { value: 'mixer', label: 'Mixers' },
    { value: 'mastering_engineer', label: 'Mastering Engineers' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (user && userRole === 'label_admin') {
      loadRoster();
    }
  }, [user, userRole]);

  useEffect(() => {
    filterAndSortRoster();
  }, [roster, searchTerm, typeFilter, sortBy]);

  const loadRoster = async () => {
    try {
      setLoading(true);
      
      // Get authentication token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Fetch roster data from API
      const response = await fetch('/api/labeladmin/roster', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load roster data');
      }

      const data = await response.json();
      setRoster(data.roster || []);
    } catch (error) {
      console.error('Error loading roster:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRoster = () => {
    let filtered = [...roster];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(contributor =>
        contributor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contributor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contributor.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contributor.releases?.some(release => 
          release.title?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(contributor => 
        contributor.type === typeFilter || contributor.role === typeFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        case 'releases':
          return (b.releases?.length || 0) - (a.releases?.length || 0);
        case 'recent':
          return new Date(b.last_active || b.created_at) - new Date(a.last_active || a.created_at);
        default:
          return 0;
      }
    });

    setFilteredRoster(filtered);
  };

  const getContributorTypeLabel = (type) => {
    const typeObj = contributorTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type || 'Unknown';
  };

  const getContributorInitials = (name) => {
    if (!name) return 'UN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading roster...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
        <div className="text-center">
          <div className="bg-red-50 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{color: '#991b1b'}}>Error Loading Roster</h2>
          <p className="mb-4" style={{color: '#64748b'}}>{error}</p>
          <button
            onClick={loadRoster}
            className="px-4 py-2 text-white rounded-lg font-medium transition-all"
            style={{background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'}}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="w-8 h-8 mr-3" />
              Label Roster
            </h1>
            <p className="text-gray-600 mt-2">
              All contributors from releases by your connected artists
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {filteredRoster.length} contributors
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search contributors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {contributorTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="type">Sort by Type</option>
              <option value="releases">Sort by Release Count</option>
              <option value="recent">Sort by Recent Activity</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="w-4 h-4 flex flex-col space-y-1">
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                  <div className="bg-current h-0.5 rounded"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Roster Display */}
        {filteredRoster.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contributors Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || typeFilter !== 'all' 
                ? 'No contributors match your current filters.' 
                : 'No contributors have been added to releases yet.'}
            </p>
            {(searchTerm || typeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                }}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRoster.map((contributor, index) => (
              <div key={contributor.id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Avatar */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {contributor.avatar ? (
                      <img src={contributor.avatar} alt={contributor.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      getContributorInitials(contributor.name)
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">{contributor.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-600">{getContributorTypeLabel(contributor.type || contributor.role)}</p>
                  </div>
                </div>

                {/* Contact Info */}
                {contributor.email && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{contributor.email}</span>
                  </div>
                )}

                {contributor.phone && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{contributor.phone}</span>
                  </div>
                )}

                {/* Release Count */}
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Music className="w-4 h-4 mr-2" />
                  <span>{contributor.releases?.length || 0} releases</span>
                </div>

                {/* Recent Releases */}
                {contributor.releases && contributor.releases.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Recent Releases:</p>
                    <div className="space-y-1">
                      {contributor.releases.slice(0, 2).map((release, idx) => (
                        <p key={idx} className="text-xs text-gray-600 truncate">
                          • {release.title || release.name}
                        </p>
                      ))}
                      {contributor.releases.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{contributor.releases.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contributor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Releases
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRoster.map((contributor, index) => (
                    <tr key={contributor.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {contributor.avatar ? (
                              <img src={contributor.avatar} alt={contributor.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              getContributorInitials(contributor.name)
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{contributor.name || 'Unknown'}</div>
                            {contributor.isni && (
                              <div className="text-sm text-gray-500">ISNI: {contributor.isni}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getContributorTypeLabel(contributor.type || contributor.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {contributor.email && (
                          <div className="flex items-center mb-1">
                            <Mail className="w-3 h-3 mr-1" />
                            <span className="truncate max-w-32">{contributor.email}</span>
                          </div>
                        )}
                        {contributor.phone && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            <span>{contributor.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <Music className="w-4 h-4 mr-1" />
                          <span>{contributor.releases?.length || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {contributor.last_active ? (
                          new Date(contributor.last_active).toLocaleDateString()
                        ) : contributor.created_at ? (
                          new Date(contributor.created_at).toLocaleDateString()
                        ) : (
                          'Unknown'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


