/**
 * Example Dashboard Page
 * Demonstrates the smart dashboard system with drag-and-drop customization
 */

import { useState } from 'react';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { useDashboard } from '@/lib/dashboard/useDashboard';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import { HiAdjustmentsHorizontal, HiArrowPath } from 'react-icons/hi2';

export default function DashboardExample() {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    layout,
    messages,
    loading,
    error,
    isSaving,
    reorderWidgets,
    toggleWidgetVisibility,
    resetToDefault
  } = useDashboard(user?.id, user?.role);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Please log in to view your dashboard</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading dashboard</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome back, {user.name || user.email}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {isEditMode && (
                <button
                  onClick={resetToDefault}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiArrowPath className="w-4 h-4 mr-2" />
                  Reset to Default
                </button>
              )}
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                  isEditMode
                    ? 'border-blue-600 text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <HiAdjustmentsHorizontal className="w-4 h-4 mr-2" />
                {isEditMode ? 'Done' : 'Customize'}
              </button>
            </div>
          </div>

          {/* Edit Mode Banner */}
          {isEditMode && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <HiAdjustmentsHorizontal className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-800">
                    Customization Mode
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Drag widgets to reorder them</li>
                      <li>Use the eye icon to show/hide widgets</li>
                      <li>Click "Reset to Default" to restore your role's default layout</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Saving Indicator */}
          {isSaving && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-3"></div>
              <p className="text-sm text-gray-600">Saving your changes...</p>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {layout.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No widgets available for your role</p>
          </div>
        ) : (
          <DashboardGrid
            layout={layout}
            messages={messages}
            onReorder={reorderWidgets}
            onToggleVisibility={toggleWidgetVisibility}
            onResetToDefault={resetToDefault}
            isEditMode={isEditMode}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
}
