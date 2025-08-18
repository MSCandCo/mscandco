import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/router';
import { 
  User, Mail, Building2, Shield, Calendar, 
  Edit3, Save, X, CheckCircle
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { getUserRole, getUserBrand } from '@/lib/user-utils';
import Avatar from '@/components/shared/Avatar';

export default function CompanyAdminProfile() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Business Operations',
    position: 'Company Administrator',
    companyRole: 'Company Admin',
    joinDate: '2023-01-01',
    lastLogin: new Date().toISOString(),
    permissions: [
      'User Management',
      'Content Oversight', 
      'Revenue Configuration',
      'Analytics Access',
      'Workflow Management'
    ]
  });

  // Get user context
  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Check admin access
  useEffect(() => {
    if (!isLoading && user) {
      const role = getUserRole(user);
      if (role !== 'company_admin') {
        router.push('/dashboard');
        return;
      }
      
      // Load profile data
      if (user) {
        setProfileData(prev => ({
          ...prev,
          firstName: user.given_name || user.name?.split(' ')[0] || '',
          lastName: user.family_name || user.name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
        }));
      }
      
      setLoading(false);
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, user, router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data if needed
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.given_name || user.name?.split(' ')[0] || '',
        lastName: user.family_name || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      // In a real app, you would make an API call here
      console.log('Profile updated:', profileData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCompletionPercentage = () => {
    const fields = ['firstName', 'lastName', 'email', 'phone'];
    const completedFields = fields.filter(field => profileData[field] && profileData[field].trim() !== '');
    return Math.round((completedFields.length / fields.length) * 100);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <MainLayout>
      <SEO 
        title="Profile - Company Admin"
        description="Manage your company administrator profile"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Company Admin Profile</h1>
          <p className="text-gray-600 mt-2">Manage your administrator profile and permissions</p>
        </div>

        {/* Profile Completion */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
            <span className="text-2xl font-bold text-blue-600">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Complete your profile to access all company admin features
          </p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                    ) : (
                      <Save className="w-4 h-4 mr-1" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center mb-8">
              <Avatar 
                src={user?.picture} 
                name={`${profileData.firstName} ${profileData.lastName}`.trim() || user?.name} 
                size="w-20 h-20" 
                className="text-2xl"
              />
              <div className="ml-6">
                <h4 className="text-xl font-semibold text-gray-900">
                  {`${profileData.firstName} ${profileData.lastName}`.trim() || user?.name || 'Company Administrator'}
                </h4>
                <p className="text-gray-600">{profileData.position}</p>
                <div className="flex items-center mt-2">
                  <Shield className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-600 font-medium">{profileData.companyRole}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.firstName || '---'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.lastName || '---'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{profileData.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.phone || '---'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{profileData.department}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                <p className="text-gray-900">{profileData.position}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">
                    {new Date(profileData.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Login</label>
                <p className="text-gray-900">
                  {new Date(profileData.lastLogin).toLocaleDateString()} at {new Date(profileData.lastLogin).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileData.permissions.map((permission, index) => (
              <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-green-800">{permission}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}