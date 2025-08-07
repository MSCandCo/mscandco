import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { 
  User, Mail, Phone, Shield, Calendar, Settings,
  Camera, Save, Edit, Check, X, Globe, MapPin
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { getUserRole, getUserBrand } from '../../lib/auth0-config';
import Avatar from '../../components/shared/Avatar';
import { SuccessModal } from '../../components/shared/SuccessModal';

export default function AdminProfile() {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Get user context
  const userRole = getUserRole(user);
  const userBrand = getUserBrand(user);

  // Admin profile data
  const [profileData, setProfileData] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: user?.email || 'company.admin.yhwh@mscandco.com',
    phone: '+44 20 7946 0958',
    position: userRole === 'super_admin' ? 'Super Administrator' : 'Company Administrator',
    department: 'Administration',
    location: 'London, UK',
    timezone: 'GMT+0',
    bio: userRole === 'super_admin' 
      ? 'Super Administrator with full platform access and oversight responsibilities.'
      : 'Company Administrator responsible for brand management and user oversight.',
    avatar: null, // This will show completion needs improvement
    permissions: userRole === 'super_admin' 
      ? ['Full System Access', 'User Management', 'Ghost Login', 'Platform Settings', 'Audit Logs']
      : ['Brand Management', 'User Oversight', 'Content Management', 'Analytics Access'],
    // Security settings
    twoFactorEnabled: true,
    lastPasswordChange: '2024-01-01',
    sessionTimeout: '8 hours',
    // Notification preferences
    emailNotifications: true,
    systemAlerts: true,
    securityAlerts: true,
    weeklyReports: true
  });

  const [editingData, setEditingData] = useState(profileData);

  // Check admin access
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

  // Handle edit mode
  const handleEdit = () => {
    setIsEditing(true);
    setEditingData(profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingData(profileData);
  };

  const handleSave = () => {
    setProfileData(editingData);
    setIsEditing(false);
    setSuccessMessage('Profile updated successfully!');
    setShowSuccessModal(true);
  };

  const handleInputChange = (field, value) => {
    setEditingData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      return newData;
    });
  };

  const handleNotificationChange = (field, value) => {
    setEditingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate profile completion
  const getProfileCompletion = (data = profileData) => {
    const fields = [
      'firstName', 'lastName', 'email', 'phone', 'position', 
      'department', 'location', 'timezone', 'bio'
    ];
    const completed = fields.filter(field => {
      const value = data[field];
      return value && value.toString().trim() !== '';
    }).length;
    
    // Add bonus points for avatar and notification settings
    let bonusPoints = 0;
    if (data.avatar) bonusPoints += 0.5;
    if (data.emailNotifications !== undefined) bonusPoints += 0.5;
    
    const totalFields = fields.length + 1; // +1 for the bonus points
    const totalCompleted = completed + bonusPoints;
    
    return Math.min(100, Math.round((totalCompleted / totalFields) * 100));
  };

  // Get missing fields for completion
  const getMissingFields = (data = profileData) => {
    const fieldLabels = {
      'firstName': 'First Name',
      'lastName': 'Last Name', 
      'email': 'Email Address',
      'phone': 'Phone Number',
      'position': 'Position',
      'department': 'Department',
      'location': 'Location',
      'timezone': 'Timezone',
      'bio': 'Bio'
    };
    
    const missing = [];
    Object.keys(fieldLabels).forEach(field => {
      const value = data[field];
      if (!value || value.toString().trim() === '') {
        missing.push(fieldLabels[field]);
      }
    });
    
    if (!data.avatar) missing.push('Profile Picture');
    
    return missing;
  };

  // Loading state
  if (isLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const displayData = isEditing ? editingData : profileData;
  const completion = getProfileCompletion(displayData);
  const missingFields = getMissingFields(displayData);

  return (
    <MainLayout>
      <SEO 
        title="Admin Profile"
        description="Admin profile management and settings"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative flex-shrink-0">
                  <Avatar 
                    name={`${displayData.firstName} ${displayData.lastName}`}
                    image={displayData.avatar}
                    size="w-20 h-20"
                    textSize="text-xl"
                  />
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="ml-5 flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-0">
                    {displayData.firstName} {displayData.lastName}
                  </h1>
                  <p className="text-base text-gray-600 leading-tight mb-2">{displayData.position}</p>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-600 font-medium">
                      {userRole === 'super_admin' ? 'Super Admin Access' : 'Company Admin Access'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">
                  Profile Completion
                  {missingFields.length > 0 && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      Missing: {missingFields.slice(0, 2).join(', ')}
                      {missingFields.length > 2 && ` +${missingFields.length - 2} more`}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-24">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        completion >= 90 ? 'bg-green-600' : 
                        completion >= 70 ? 'bg-blue-600' : 
                        completion >= 50 ? 'bg-yellow-600' : 'bg-red-500'
                      }`}
                      style={{ width: `${completion}%` }}
                    ></div>
                  </div>
                  <div className={`text-xl font-bold ${
                    completion >= 90 ? 'text-green-600' : 
                    completion >= 70 ? 'text-blue-600' : 
                    completion >= 50 ? 'text-yellow-600' : 'text-red-500'
                  }`}>{completion}%</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-3">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{displayData.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{displayData.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{displayData.email}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={displayData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{displayData.phone}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={displayData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{displayData.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Work Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{displayData.position}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{displayData.department}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{displayData.location}</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  {isEditing ? (
                    <select
                      value={displayData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="GMT+0">GMT+0 (London)</option>
                      <option value="GMT+1">GMT+1 (Berlin)</option>
                      <option value="GMT-5">GMT-5 (New York)</option>
                      <option value="GMT-8">GMT-8 (Los Angeles)</option>
                    </select>
                  ) : (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{displayData.timezone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions & Security */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Permissions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Permissions</h2>
              
              <div className="space-y-3">
                {displayData.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-4 h-4 text-green-500 mr-3" />
                    <span className="text-gray-700">{permission}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={displayData.emailNotifications}
                    onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">System Alerts</span>
                  <input
                    type="checkbox"
                    checked={displayData.systemAlerts}
                    onChange={(e) => handleNotificationChange('systemAlerts', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Security Alerts</span>
                  <input
                    type="checkbox"
                    checked={displayData.securityAlerts}
                    onChange={(e) => handleNotificationChange('securityAlerts', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Weekly Reports</span>
                  <input
                    type="checkbox"
                    checked={displayData.weeklyReports}
                    onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={!isEditing}
                  />
                </div>
              </div>
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