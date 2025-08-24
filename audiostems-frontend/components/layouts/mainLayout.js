import React, { useState, useEffect } from "react";
import Footer from "../footer";
import GhostModeIndicator from "../admin/GhostModeIndicator";

function MainLayout({ children, className }) {
  const [isGhostMode, setIsGhostMode] = useState(false);

  useEffect(() => {
    const checkGhostMode = () => {
      if (typeof window !== 'undefined') {
        const ghostMode = sessionStorage.getItem('ghost_mode');
        setIsGhostMode(ghostMode === 'true');
      }
    };

    checkGhostMode();

    // Listen for ghost mode changes
    const handleGhostModeChange = () => {
      checkGhostMode();
    };

    window.addEventListener('ghostModeChanged', handleGhostModeChange);
    window.addEventListener('storage', handleGhostModeChange);

    return () => {
      window.removeEventListener('ghostModeChanged', handleGhostModeChange);
      window.removeEventListener('storage', handleGhostModeChange);
    };
  }, []);

  return (
    <div className={className}>
      <main className={isGhostMode ? 'pb-16 sm:pb-14' : ''}>{children}</main>
      <Footer />
      <GhostModeIndicator />
    </div>
  );
}

export default MainLayout;
