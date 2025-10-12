import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Ghost, X, User, Shield } from 'lucide-react';

export default function GhostModeIndicator() {
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [ghostData, setGhostData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if we're in ghost mode
    const checkGhostMode = () => {
      if (typeof window !== 'undefined') {
        const ghostMode = sessionStorage.getItem('ghost_mode');
        const ghostSession = sessionStorage.getItem('ghost_session');
        const originalAdmin = sessionStorage.getItem('original_admin_user');
        const targetUser = sessionStorage.getItem('ghost_target_user');

        if (ghostMode === 'true' && ghostSession && originalAdmin && targetUser) {
          setIsGhostMode(true);
          setGhostData({
            session: JSON.parse(ghostSession),
            admin: JSON.parse(originalAdmin),
            target: JSON.parse(targetUser)
          });
        } else {
          setIsGhostMode(false);
          setGhostData(null);
        }
      }
    };

    checkGhostMode();

    // Listen for storage changes (in case ghost mode is activated/deactivated in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'ghost_mode' || e.key === 'ghost_target_user' || e.key === 'ghost_session' || e.key === 'original_admin_user') {
        checkGhostMode();
      }
    };

    // Listen for custom ghost mode change events (same tab)
    const handleGhostModeChange = () => {
      checkGhostMode();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ghostModeChanged', handleGhostModeChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ghostModeChanged', handleGhostModeChange);
    };
  }, []);

  // Additional effect that runs on router changes to ensure banner persistence
  useEffect(() => {
    const checkGhostMode = () => {
      if (typeof window !== 'undefined') {
        const ghostMode = sessionStorage.getItem('ghost_mode');
        const ghostSession = sessionStorage.getItem('ghost_session');
        const originalAdmin = sessionStorage.getItem('original_admin_user');
        const targetUser = sessionStorage.getItem('ghost_target_user');

        if (ghostMode === 'true' && ghostSession && originalAdmin && targetUser) {
          setIsGhostMode(true);
          try {
            setGhostData({
              session: JSON.parse(ghostSession),
              admin: JSON.parse(originalAdmin),
              target: JSON.parse(targetUser)
            });
          } catch (error) {
            console.error('Error parsing ghost data:', error);
            setIsGhostMode(false);
            setGhostData(null);
          }
        } else {
          setIsGhostMode(false);
          setGhostData(null);
        }
      }
    };

    checkGhostMode();
  }, [router.asPath]); // Re-check when route changes

  // Fallback: Periodic check to ensure banner stays visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        const ghostMode = sessionStorage.getItem('ghost_mode');
        if (ghostMode === 'true' && !isGhostMode) {
          // Force re-check if we should be in ghost mode but aren't showing the banner
          const ghostSession = sessionStorage.getItem('ghost_session');
          const originalAdmin = sessionStorage.getItem('original_admin_user');
          const targetUser = sessionStorage.getItem('ghost_target_user');

          if (ghostSession && originalAdmin && targetUser) {
            setIsGhostMode(true);
            try {
              setGhostData({
                session: JSON.parse(ghostSession),
                admin: JSON.parse(originalAdmin),
                target: JSON.parse(targetUser)
              });
            } catch (error) {
              console.error('Error parsing ghost data in fallback:', error);
            }
          }
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [isGhostMode]);

  const exitGhostMode = () => {
    if (typeof window !== 'undefined') {
      // Clear ghost mode data
      sessionStorage.removeItem('ghost_mode');
      sessionStorage.removeItem('ghost_session');
      sessionStorage.removeItem('original_admin_user');
      sessionStorage.removeItem('ghost_target_user');
      
      // Trigger custom event to notify the auth provider
      window.dispatchEvent(new Event('ghostModeChanged'));
      
      // Redirect back to admin dashboard
      router.push('/superadmin/dashboard');
    }
  };

  if (!isGhostMode || !ghostData) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white shadow-2xl border-t-2 border-red-700 z-50" style={{ zIndex: 9999 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 sm:py-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Ghost className="w-5 h-5 animate-pulse" />
              <span className="font-bold text-sm">GHOST MODE ACTIVE</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Connected"></div>
            </div>
            
            <div className="hidden sm:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Admin: {ghostData.admin.email}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Viewing as: {ghostData.target.name || ghostData.target.email}</span>
              </div>
              <div className="text-xs opacity-75">
                Started: {new Date(ghostData.session.ghostStartTime).toLocaleTimeString()}
              </div>
            </div>
          </div>

          <button
            onClick={exitGhostMode}
            className="flex items-center space-x-2 px-3 py-1 bg-red-700 hover:bg-red-800 rounded-lg transition-colors text-sm font-medium"
            title="Exit Ghost Mode"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Ghost Mode</span>
          </button>
        </div>
      </div>

      {/* Mobile version - simplified */}
      <div className="sm:hidden px-4 pb-1">
        <div className="text-xs text-center">
          <div>Admin: {ghostData.admin.email}</div>
          <div>Viewing: {ghostData.target.name || ghostData.target.email}</div>
        </div>
      </div>
    </div>
  );
}
