'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaSearch,
  FaFilter,
  FaUser,
  FaUsers,
  FaMusic,
  FaMicrophone,
  FaGuitar,
  FaDrum,
  FaKeyboard,
  FaFileAudio,
  FaDownload
} from 'react-icons/fa';
import { Users } from 'lucide-react';
import Avatar from '@/components/shared/Avatar';
import MSCVideo from '@/components/shared/MSCVideo';
import { PageLoading } from '@/components/ui/LoadingSpinner';

export default function LabelRosterClient({ user }) {
  const router = useRouter();
  const [contributors, setContributors] = useState([]);
  const [filteredContributors, setFilteredContributors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Contributor types with icons
  const contributorTypes = [
    { value: 'solo_artist', label: 'Solo Artist', icon: FaUser },
    { value: 'group', label: 'Group', icon: FaUsers },
    { value: 'producer', label: 'Producer', icon: FaMusic },
    { value: 'vocalist', label: 'Vocalist', icon: FaMicrophone },
    { value: 'guitarist', label: 'Guitarist', icon: FaGuitar },
    { value: 'bassist', label: 'Bassist', icon: FaGuitar },
    { value: 'drummer', label: 'Drummer', icon: FaDrum },
    { value: 'keyboardist', label: 'Keyboardist', icon: FaKeyboard },
    { value: 'publisher', label: 'Publisher', icon: FaFileAudio },
    { value: 'composer', label: 'Composer', icon: FaMusic },
    { value: 'arranger', label: 'Arranger', icon: FaMusic },
    { value: 'engineer', label: 'Engineer', icon: FaFileAudio },
    { value: 'mixer', label: 'Mixer', icon: FaFileAudio },
    { value: 'mastering', label: 'Mastering', icon: FaFileAudio }
  ];

  useEffect(() => {
    loadRoster();
  }, [user]);

  useEffect(() => {
    filterContributors();
  }, [contributors, searchTerm, filterType]);

  const loadRoster = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/labeladmin/roster');
      console.log('Roster response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Roster data:', data);
        setContributors(data.contributors || []);
        setSummary(data.summary || null);
      } else {
        console.error('Roster response not ok:', response.status, response.statusText);
        setContributors([]);
      }
    } catch (error) {
      console.error('Error loading roster:', error);
      setContributors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterContributors = () => {
    let filtered = contributors;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(contributor =>
        contributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contributor.isni && contributor.isni.includes(searchTerm)) ||
        (contributor.roles && contributor.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(contributor => contributor.type === filterType);
    }

    setFilteredContributors(filtered);
  };

  const getContributorIcon = (type) => {
    const contributorType = contributorTypes.find(ct => ct.value === type);
    return contributorType ? contributorType.icon : FaUser;
  };

  const getContributorLabel = (type) => {
    const contributorType = contributorTypes.find(ct => ct.value === type);
    return contributorType ? contributorType.label : type;
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Type', 'ISNI', 'Releases', 'Roles'];
    const rows = filteredContributors.map(c => [
      c.name || '',
      getContributorLabel(c.type) || '',
      c.isni || '',
      c.releaseCount || 0,
      (c.roles || []).join(', ')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `label-roster-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <PageLoading message="Loading roster..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Video with Overlapping Header */}
        <div className="relative mb-8 px-4 sm:px-0">
          <MSCVideo
            artistName="MSC & Co"
            songTitle="Label Roster"
            className="aspect-video shadow-2xl"
            showControls={true}
          />
          {/* Overlapping Page Header */}
          <div className="absolute top-1/2 left-8 transform -translate-y-1/2 z-10">
            <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-6 text-white">
              <h1 className="text-4xl font-bold mb-2">Label Roster</h1>
              <p className="text-lg opacity-90">All contributors across all releases from your affiliated artists</p>
            </div>
          </div>
        </div>


        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ISNI, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {contributorTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaDownload className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Contributors List */}
        {filteredContributors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {contributors.length === 0 ? 'No Contributors Yet' : 'No matching contributors'}
            </h3>
            <p className="text-gray-600">
              {contributors.length === 0
                ? 'Contributors from your affiliated artists\' releases will appear here'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      {/* Thumbnail column - no title */}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contributor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contributor Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ISNI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Releases
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roles
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContributors.map((contributor) => {
                    const Icon = getContributorIcon(contributor.type);
                    return (
                      <tr key={contributor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex-shrink-0 h-24 w-24">
                            {contributor.thumbnail_url ? (
                              <Avatar
                                name={contributor.name}
                                image={contributor.thumbnail_url}
                                size="w-24 h-24"
                                textSize="text-2xl"
                              />
                            ) : (
                              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                                <Icon className="text-gray-500" size={40} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {contributor.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Icon className="text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {getContributorLabel(contributor.type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {contributor.isni || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contributor.releaseCount} {contributor.releaseCount === 1 ? 'release' : 'releases'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {contributor.roles && contributor.roles.length > 0 ? (
                              contributor.roles.map((role, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700"
                                >
                                  {role}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400">No roles specified</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Cards at Bottom */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FaUsers className="text-blue-600 text-2xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Contributors</p>
                <p className="text-2xl font-bold text-gray-900">{contributors.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FaUser className="text-green-600 text-2xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Solo Artists</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contributors.filter(c => c.type === 'solo_artist').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FaUsers className="text-purple-600 text-2xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Groups</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contributors.filter(c => c.type === 'group').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FaMusic className="text-orange-600 text-2xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Producers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contributors.filter(c => c.type === 'producer').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
