'use client'

import { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext({
  showAccessibilityLink: false,
  setShowAccessibilityLink: () => {},
});

export function AccessibilityProvider({ children, initialValue = false }) {
  const [showAccessibilityLink, setShowAccessibilityLink] = useState(initialValue);

  return (
    <AccessibilityContext.Provider value={{ showAccessibilityLink, setShowAccessibilityLink }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    // Return default values if used outside of provider (e.g., in admin/labeladmin areas)
    return {
      showAccessibilityLink: false,
      setShowAccessibilityLink: () => {}
    };
  }
  return context;
}
