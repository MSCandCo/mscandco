import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';

/**
 * Hook to sync role changes from admin panel in real-time
 * Updates the displayed role without requiring logout
 */
export function useRoleSync() {
  const { user } = useUser();
  const [displayRole, setDisplayRole] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Initialize with user's current role
    const initialRole = user.user_metadata?.role || user.app_metadata?.role;
    setDisplayRole(initialRole);

    // Listen for role update broadcasts from admin panel
    const handleStorageChange = (event) => {
      if (event.key === 'user_role_update' && event.newValue) {
        try {
          const roleUpdate = JSON.parse(event.newValue);
          
          // Check if this update is for the current user
          if (roleUpdate.userId === user.id || roleUpdate.email === user.email) {
            console.log(`🔄 Role updated to ${roleUpdate.newRole} - updating display`);
            setDisplayRole(roleUpdate.newRole);
          }
        } catch (error) {
          console.error('Error parsing role update:', error);
        }
      }
    };

    // Listen for localStorage changes (works across tabs)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  return displayRole;
}

