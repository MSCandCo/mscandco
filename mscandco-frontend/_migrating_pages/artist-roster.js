import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/components/providers/SupabaseProvider';
import { getUserRoleSync } from '../../lib/user-utils';
import { requirePermission } from '@/lib/serverSidePermissions';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaUser,
  FaUsers,
  FaMusic,
  FaMicrophone,
  FaGuitar,
  FaDrum,
  FaKeyboard,
  FaFileAudio
} from 'react-icons/fa';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import NotificationModal from '@/components/shared/NotificationModal';
import useModals from '@/hooks/useModals';
import Avatar from '@/components/shared/Avatar';
import MSCVideo from '@/components/shared/MSCVideo';


// Server-side permission check BEFORE page renders
export async function getServerSideProps(context) {
  const auth = await requirePermission(context, 'roster:access');

  if (auth.redirect) {
    return { redirect: auth.redirect };
  }

  return { props: { user: auth.user } };
}

export default function ArtistRoster() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useUser();
    const [roster, setRoster] = useState([]);
  const [filteredRoster, setFilteredRoster] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContributor, setEditingContributor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Permission check - redirect if no access
  
  // Initialize modals hook
  const {
    confirmModal,
    notificationModal,
    confirmDelete,
    showSuccess,
    showError,
    closeConfirmModal,
    closeNotificationModal
  } = useModals();

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

  // Form state for adding/editing contributors
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    isni: '',
    thumbnail: null,
    thumbnailPreview: ''
  });

  useEffect(() => {
    if (!authLoading) {
      loadRoster();
    }
  }, [user, authLoading]);

  useEffect(() => {
    filterRoster();
  }, [roster, searchTerm, filterType]);

  const loadRoster = async () => {
    try {
  
      setIsLoading(true);
      
      const response = await fetch('/api/artist/roster');
      console.log('Roster response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Roster data:', data);
        setRoster(data);
      } else {
        console.error('Roster response not ok:', response.status, response.statusText);
        setRoster([]);
      }
    } catch (error) {
      console.error('Error loading roster:', error);
      setRoster([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRoster = () => {
    let filtered = roster;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(contributor =>
        contributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contributor.isni.includes(searchTerm)
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(contributor => contributor.type === filterType);
    }

    setFilteredRoster(filtered);
  };

  const validateISNI = (isni) => {
    // ISNI format: 16 digits, last character can be 'X'
    const isniRegex = /^[0-9]{15}[0-9X]$/;
    return isniRegex.test(isni);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateISNI(formData.isni)) {
      setSuccessMessage('Invalid ISNI format. Must be 16 digits with last character being a digit or X.');
      setShowSuccessModal(true);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('isni', formData.isni);
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }

      const url = editingContributor 
        ? `/api/artist/roster/${editingContributor.id}`
        : '/api/artist/roster';
      
      const method = editingContributor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (response.ok) {
        await loadRoster();
        setShowAddModal(false);
        setEditingContributor(null);
        setFormData({
          name: '',
          type: '',
          isni: '',
          thumbnail: null,
          thumbnailPreview: ''
        });
      }
    } catch (error) {
      console.error('Error saving contributor:', error);
    }
  };

  const handleEdit = (contributor) => {
    setEditingContributor(contributor);
    setFormData({
      name: contributor.name,
      type: contributor.type,
      isni: contributor.isni,
      thumbnail: null,
      thumbnailPreview: contributor.thumbnail || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    const contributor = roster.find(c => c.id === id);
    const contributorName = contributor ? `${contributor.firstName} ${contributor.lastName}` : 'this contributor';
    
    confirmDelete(contributorName, async () => {
      try {
        const response = await fetch(`/api/artist/roster/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          await loadRoster();
          showSuccess(`${contributorName} has been removed from your roster.`);
        } else {
          showError('Failed to delete contributor. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting contributor:', error);
        showError('An error occurred while deleting the contributor. Please try again.');
      }
    });
  };

  const getTypeIcon = (type) => {
    const typeConfig = contributorTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : FaUser;
  };

  const getTypeLabel = (type) => {
    const typeConfig = contributorTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.label : type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Hero Banner */}
        <div className="relative mb-8 px-4 sm:px-0">
          <MSCVideo 
            artistName="MSC & Co"
            songTitle="Contributor Showcase"
            className="aspect-video shadow-2xl"
            showControls={true}
          />
          {/* Overlapping Page Header */}
          <div className="absolute top-1/2 left-8 transform -translate-y-1/2 z-10">
            <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-6 text-white">
              <h1 className="text-4xl font-bold mb-2">Contributor Roster</h1>
              <p className="text-lg opacity-90">Manage all contributors involved in your releases and projects</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contributors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Types</option>
                  {contributorTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2" />
              Add Contributor
            </button>
          </div>
        </div>

        {/* Roster Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoster.map((contributor) => {
                  const TypeIcon = getTypeIcon(contributor.type);
                  return (
                    <tr key={contributor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-24 w-24">
                          <Avatar 
                            name={contributor.name}
                            image={contributor.thumbnail}
                            size="w-24 h-24"
                            textSize="text-2xl"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {contributor.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TypeIcon className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {getTypeLabel(contributor.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {contributor.isni}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(contributor)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(contributor.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRoster.length === 0 && (
            <div className="text-center py-12">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No contributors found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first contributor.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FaUsers className="text-blue-600 text-2xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Contributors</p>
                <p className="text-2xl font-bold text-gray-900">{roster.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FaUser className="text-green-600 text-2xl" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Solo Artists</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roster.filter(c => c.type === 'solo_artist').length}
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
                  {roster.filter(c => c.type === 'group').length}
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
                  {roster.filter(c => c.type === 'producer').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingContributor ? 'Edit Contributor' : 'Add New Contributor'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-32 w-32">
                      <Avatar 
                        name={formData.name}
                        image={formData.thumbnailPreview}
                        size="w-32 h-32"
                        textSize="text-3xl"
                      />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contributor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter contributor name"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contributor Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select contributor type</option>
                    {contributorTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ISNI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ISNI *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.isni}
                    onChange={(e) => setFormData({...formData, isni: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="0000000000000000"
                    maxLength="16"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: 16 digits (last character can be 'X')
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingContributor(null);
                      setFormData({
                        name: '',
                        type: '',
                        isni: '',
                        thumbnail: null,
                        thumbnailPreview: ''
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {editingContributor ? 'Update' : 'Add'} Contributor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Branded Modals */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
      />

      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={closeNotificationModal}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
        buttonText={notificationModal.buttonText}
      />
    </div>
  );
} 