import { useState, useEffect } from 'react';
import { getUserRole, getUserRoleSync } from '@/lib/user-utils';

// Custom hook for user role management
export const useUserRole = (user) => {
  const [role, setRole] = useState(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole('anon');
        setIsLoadingRole(false);
        return;
      }

      try {
        // Get immediate role for UI (sync)
        const immediateRole = getUserRoleSync(user);
        setRole(immediateRole);

        // Get proper role from database (async)
        const dbRole = await getUserRole(user);
        
        // Cache the role on the user object for future sync calls
        user._cachedRole = dbRole;
        
        setRole(dbRole);
      } catch (error) {
        console.error('Error in useUserRole:', error);
        // Fallback to sync role
        setRole(getUserRoleSync(user));
      } finally {
        setIsLoadingRole(false);
      }
    };

    fetchRole();
  }, [user]);

  return { role, isLoadingRole };
};
