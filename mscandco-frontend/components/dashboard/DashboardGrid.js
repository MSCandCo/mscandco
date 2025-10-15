/**
 * Dashboard Grid Component
 * Flexible 12-column grid layout with drag-and-drop widget reordering
 */

import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { HiCog6Tooth, HiEye, HiEyeSlash, HiArrowPath } from 'react-icons/hi2';
import DashboardWidget from './DashboardWidget';
import { getColumnSpanClass } from '@/lib/dashboard/gridUtils';

export default function DashboardGrid({
  layout,
  messages,
  onReorder,
  onToggleVisibility,
  onResetToDefault,
  isEditMode = false,
  isSaving = false
}) {
  const [activeId, setActiveId] = useState(null);

  // Setup drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get sortable IDs
  const sortableIds = useMemo(
    () => layout.map((item) => item.widget.id),
    [layout]
  );

  // Handle drag start
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = sortableIds.indexOf(active.id);
    const newIndex = sortableIds.indexOf(over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newLayout = arrayMove(layout, oldIndex, newIndex);
      onReorder?.(newLayout);
    }
  };

  // Get active widget for drag overlay
  const activeWidget = useMemo(
    () => layout.find((item) => item.widget.id === activeId),
    [activeId, layout]
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      {isEditMode && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HiCog6Tooth className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Customize Dashboard
            </span>
            {isSaving && (
              <span className="text-xs text-gray-500 flex items-center">
                <HiArrowPath className="w-3 h-3 animate-spin mr-1" />
                Saving...
              </span>
            )}
          </div>
          <button
            onClick={onResetToDefault}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
            disabled={isSaving}
          >
            <HiArrowPath className="w-4 h-4" />
            <span>Reset to Default</span>
          </button>
        </div>
      )}

      {/* Messages */}
      {messages && messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-lg p-4 ${getMessageStyles(message.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{message.title}</h3>
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.is_dismissible && (
                  <button
                    onClick={() => onDismissMessage?.(message.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid Layout with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-12 gap-4 auto-rows-auto">
            {layout.map((item) => (
              <DashboardWidget
                key={item.widget.id}
                item={item}
                isEditMode={isEditMode}
                onToggleVisibility={onToggleVisibility}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeWidget && (
            <div
              className={`${getColumnSpanClass(
                activeWidget.grid_column_span
              )} opacity-80`}
            >
              <DashboardWidget item={activeWidget} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {(!layout || layout.length === 0) && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <HiCog6Tooth className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No widgets available
          </h3>
          <p className="text-sm text-gray-500">
            Contact your administrator to set up dashboard widgets.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function for message styling
function getMessageStyles(type) {
  const styles = {
    info: 'bg-blue-50 border border-blue-200 text-blue-900',
    warning: 'bg-yellow-50 border border-yellow-200 text-yellow-900',
    success: 'bg-green-50 border border-green-200 text-green-900',
    error: 'bg-red-50 border border-red-200 text-red-900',
    announcement: 'bg-purple-50 border border-purple-200 text-purple-900'
  };

  return styles[type] || styles.info;
}
