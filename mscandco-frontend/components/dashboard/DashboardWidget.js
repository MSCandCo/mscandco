/**
 * Dashboard Widget Component
 * Sortable, draggable widget wrapper
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';
import { getColumnSpanClass } from '@/lib/dashboard/gridUtils';

// Import widget components
import StatsCard from './widgets/StatsCard';
import MessageBox from './widgets/MessageBox';
import LineChart from './widgets/LineChart';
import ActivityFeed from './widgets/ActivityFeed';
import QuickActions from './widgets/QuickActions';

export default function DashboardWidget({
  item,
  isEditMode = false,
  isDragging = false,
  onToggleVisibility
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: item.widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1
  };

  // Get appropriate widget component
  const WidgetComponent = getWidgetComponent(item.widget.widget_type.component_name);

  if (!WidgetComponent) {
    return null;
  }

  const columnSpan = getColumnSpanClass(item.grid_column_span);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${columnSpan} ${isDragging ? 'cursor-grabbing' : ''}`}
      {...attributes}
    >
      <div className="relative group h-full">
        {/* Edit Mode Controls */}
        {isEditMode && (
          <div className="absolute top-2 right-2 z-10 flex space-x-1">
            <button
              onClick={() => onToggleVisibility?.(item.widget.id, !item.is_visible)}
              className="p-1.5 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-gray-50"
              title={item.is_visible ? 'Hide widget' : 'Show widget'}
            >
              {item.is_visible ? (
                <HiEye className="w-4 h-4 text-gray-600" />
              ) : (
                <HiEyeSlash className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        )}

        {/* Drag Handle */}
        {isEditMode && item.widget.is_draggable && (
          <div
            {...listeners}
            className="absolute top-2 left-2 z-10 p-1.5 bg-white rounded-md shadow-sm border border-gray-200 cursor-grab hover:cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>
        )}

        {/* Widget Content */}
        <div className={`h-full ${isEditMode ? 'pointer-events-none' : ''}`}>
          <WidgetComponent
            widget={item.widget}
            config={item.custom_config || item.widget.config}
          />
        </div>
      </div>
    </div>
  );
}

// Map component names to actual components
function getWidgetComponent(componentName) {
  const components = {
    StatsCard,
    MessageBox,
    LineChart,
    ActivityFeed,
    QuickActions
  };

  return components[componentName] || null;
}
