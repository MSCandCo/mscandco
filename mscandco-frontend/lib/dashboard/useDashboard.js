/**
 * Custom hook for managing dashboard widgets and layouts
 * Handles fetching, updating, and persisting user dashboard configurations
 */

import { useState, useEffect, useCallback } from 'react';

export function useDashboard(userId, userRole) {
  const [widgets, setWidgets] = useState([]);
  const [layout, setLayout] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Fetch user's dashboard layout from API
   * Priority: user_dashboard_layouts > role_dashboard_layouts
   */
  const fetchDashboardLayout = useCallback(async () => {
    if (!userId || !userRole) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch widgets and layout from API
      const response = await fetch('/api/dashboard/widgets');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard widgets');
      }

      const data = await response.json();

      setLayout(data.widgets || []);
      setWidgets(data.widgets?.map(item => item.widget) || []);

      // Fetch active messages
      await fetchDashboardMessages();

    } catch (err) {
      console.error('Error fetching dashboard layout:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  /**
   * Fetch active dashboard messages
   */
  const fetchDashboardMessages = async () => {
    try {
      // Messages are currently handled via widget config
      // Future: Implement API endpoint for messages
      setMessages([]);
    } catch (err) {
      console.error('Error fetching dashboard messages:', err);
    }
  };

  /**
   * Save user's custom dashboard layout via API
   */
  const saveLayout = async (newLayout) => {
    if (!userId) return;

    setIsSaving(true);

    try {
      const response = await fetch('/api/dashboard/layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ layout: newLayout })
      });

      if (!response.ok) {
        throw new Error('Failed to save dashboard layout');
      }

      setLayout(newLayout);

    } catch (err) {
      console.error('Error saving dashboard layout:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Update widget visibility
   */
  const toggleWidgetVisibility = async (widgetId, isVisible) => {
    const updatedLayout = layout.map(item =>
      item.widget.id === widgetId ? { ...item, is_visible: isVisible } : item
    );

    await saveLayout(updatedLayout);
  };

  /**
   * Reorder widgets
   */
  const reorderWidgets = async (reorderedLayout) => {
    await saveLayout(reorderedLayout);
  };

  /**
   * Dismiss a message
   */
  const dismissMessage = async (messageId) => {
    try {
      // Remove from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      console.error('Error dismissing message:', err);
    }
  };

  /**
   * Reset to role default layout via API
   */
  const resetToDefault = async () => {
    if (!userId) return;

    setIsSaving(true);

    try {
      const response = await fetch('/api/dashboard/layout', {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to reset dashboard layout');
      }

      // Reload layout (will fetch role defaults)
      await fetchDashboardLayout();

    } catch (err) {
      console.error('Error resetting dashboard:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Load dashboard on mount and when user/role changes
  useEffect(() => {
    fetchDashboardLayout();
  }, [fetchDashboardLayout]);

  return {
    widgets,
    layout,
    messages,
    loading,
    error,
    isSaving,
    saveLayout,
    toggleWidgetVisibility,
    reorderWidgets,
    dismissMessage,
    resetToDefault,
    refetch: fetchDashboardLayout
  };
}
