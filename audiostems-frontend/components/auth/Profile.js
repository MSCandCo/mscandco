import { useAuth0 } from '@auth0/auth0-react';
import { getUserBrand, getUserRole } from '@/lib/auth0-config';
import { useState, useEffect } from 'react';

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [profileData, setProfileData] = useState(null);

  // Fetch profile data to get first and last name
  useEffect(() => {
    if (isAuthenticated && user) {
      fetch('/api/artist/get-profile')
        .then(res => res.json())
        .then(data => {
          setProfileData(data);
        })
        .catch(err => console.error('Error fetching profile:', err));
    }
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const userBrand = getUserBrand(user);
  const userRole = getUserRole(user);

  // Get display name from profile data or fallback to email
  const getDisplayName = () => {
    if (profileData?.firstName && profileData?.lastName) {
      return `${profileData.firstName} ${profileData.lastName}`;
    }
    return user?.email || 'User';
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-4">
        {user.picture && (
          <img 
            src={user.picture} 
            alt={getDisplayName()} 
            className="w-12 h-12 rounded-full"
          />
        )}
        <div>
          <h2 className="text-lg font-semibold">{getDisplayName()}</h2>
          <p className="text-gray-600">{user.email}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {userBrand?.displayName}
            </span>
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
              {userRole}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 