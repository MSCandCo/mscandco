# Smart Dashboard System - Implementation Guide

## Overview

A flexible, role-based, permission-governed dashboard system with drag-and-drop widget reordering and user customization.

## Features

✅ **12-Column Flexible Grid Layout**
- Widgets can span 1/4, 1/3, 1/2, 2/3, 3/4, or full width
- Automatic responsive layout (mobile, tablet, desktop)
- CSS Grid-based for optimal performance

✅ **Drag & Drop Reordering**
- Built with @dnd-kit library (lightweight, accessible)
- Visual feedback during drag
- Instant reordering with smooth animations
- Save custom layouts per user

✅ **Role & Permission-Based Widgets**
- Widgets filtered by user role
- Permission-based visibility (uses existing RBAC system)
- Wildcard support for superadmin

✅ **User Customization**
- Show/hide individual widgets
- Custom widget positions (drag & drop)
- Reset to role defaults
- Per-user layout persistence

✅ **Widget Types**
- **Stats Card**: Single metric with icon, value, trend
- **Message Box**: Announcements (half/full width)
- **Line Chart**: Time-series visualization (placeholder)
- **Activity Feed**: Recent events
- **Quick Actions**: Shortcut buttons

## Database Schema

### Tables Created

1. **dashboard_widget_types** - Defines available widget types
2. **dashboard_widgets** - Specific widget instances
3. **role_dashboard_layouts** - Default layouts per role
4. **user_dashboard_layouts** - User customizations
5. **dashboard_messages** - Platform messages/announcements
6. **user_dismissed_messages** - Tracks dismissed messages

### Current Data

- **6 widget types** seeded
- **10 default widgets** created:
  - 5 for admin roles (with permission checks)
  - 5 for artist role

## File Structure

```
components/dashboard/
├── DashboardGrid.js          # Main grid with drag-and-drop
├── DashboardWidget.js        # Individual widget wrapper
└── widgets/
    ├── StatsCard.js          # Statistics display
    ├── MessageBox.js         # Announcements
    ├── LineChart.js          # Chart (placeholder)
    ├── ActivityFeed.js       # Recent activity
    └── QuickActions.js       # Quick action buttons

lib/dashboard/
├── useDashboard.js           # Main dashboard hook
└── gridUtils.js              # Grid calculation utilities

database/migrations/
├── create-dashboard-system.sql
└── seed-dashboard-widgets.sql

scripts/
└── seed-dashboard-system.js
```

## How to Use

### Step 1: Import the Hook

```javascript
import { useDashboard } from '@/lib/dashboard/useDashboard';
import { useAuth } from '@/lib/auth';

function DashboardPage() {
  const { user } = useAuth();
  const {
    layout,
    messages,
    loading,
    isSaving,
    reorderWidgets,
    toggleWidgetVisibility,
    resetToDefault
  } = useDashboard(user.id, user.role);

  // ... render grid
}
```

### Step 2: Render the Grid

```javascript
import DashboardGrid from '@/components/dashboard/DashboardGrid';

return (
  <DashboardGrid
    layout={layout}
    messages={messages}
    onReorder={reorderWidgets}
    onToggleVisibility={toggleWidgetVisibility}
    onResetToDefault={resetToDefault}
    isEditMode={isEditMode}
    isSaving={isSaving}
  />
);
```

### Step 3: Enable Edit Mode

```javascript
const [isEditMode, setIsEditMode] = useState(false);

<button onClick={() => setIsEditMode(!isEditMode)}>
  {isEditMode ? 'Done' : 'Customize'}
</button>
```

## Widget Configuration

Each widget has a `config` JSONB field for custom settings:

### Stats Card Config
```json
{
  "metric": "total_users",
  "icon": "users",
  "color": "blue",
  "format": "currency"
}
```

### Message Box Config
```json
{
  "messageSource": "platform_messages",
  "priority": "high"
}
```

## Adding New Widgets

### 1. Create Widget Component

```javascript
// components/dashboard/widgets/MyWidget.js
export default function MyWidget({ widget, config }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h3>{widget.name}</h3>
      {/* Your widget content */}
    </div>
  );
}
```

### 2. Register in DashboardWidget.js

```javascript
import MyWidget from './widgets/MyWidget';

function getWidgetComponent(componentName) {
  const components = {
    StatsCard,
    MessageBox,
    MyWidget,  // Add here
    // ...
  };
  return components[componentName];
}
```

### 3. Add to Database

```sql
-- Add widget type
INSERT INTO dashboard_widget_types (name, display_name, component_name) VALUES
('my_widget', 'My Widget', 'MyWidget');

-- Create widget instance
INSERT INTO dashboard_widgets (widget_type_id, name, config) VALUES
((SELECT id FROM dashboard_widget_types WHERE name = 'my_widget'),
 'My Custom Widget',
 '{"customSetting": "value"}'::jsonb);
```

## Role-Based Layouts

To set default widgets for a role, insert into `role_dashboard_layouts`:

```sql
INSERT INTO role_dashboard_layouts (role, widget_id, grid_column_span, grid_row, display_order)
VALUES ('artist',
        (SELECT id FROM dashboard_widgets WHERE name = 'Your Total Streams'),
        3, 1, 1);
```

## Permission System Integration

Widgets automatically filter based on:

1. **required_role**: Must match user's role
2. **required_permission**: Checked via RBAC system
3. **Wildcards**: `*:*:*` grants full access

Example:
```sql
-- Only visible to users with this permission
UPDATE dashboard_widgets
SET required_permission = 'finance:earnings_management:read'
WHERE name = 'Total Revenue';
```

## API Endpoints Needed

Create these API routes for production:

1. **GET /api/dashboard/widgets** - Fetch user's widgets
2. **GET /api/dashboard/stats/:metric** - Get real stats data
3. **POST /api/dashboard/layout** - Save user layout
4. **DELETE /api/dashboard/layout** - Reset to defaults

## Next Steps

1. **Connect Real Data**
   - Replace mock data in widgets with API calls
   - Fetch actual metrics from database

2. **Add More Widget Types**
   - Bar charts
   - Pie charts
   - Tables
   - Calendar views

3. **Message Management UI**
   - Admin panel to create/edit messages
   - Schedule messages
   - Target specific roles/users

4. **Analytics**
   - Track which widgets users interact with
   - Popular layouts
   - Usage patterns

5. **Export/Import Layouts**
   - Share layouts between users
   - Template system for common setups

## Testing

```bash
# Test with different roles
# 1. Login as artist -> should see 5 artist widgets
# 2. Login as company_admin -> should see admin widgets
# 3. Test drag & drop reordering
# 4. Test show/hide widgets
# 5. Test reset to default
```

## Performance Notes

- Grid uses CSS Grid (hardware accelerated)
- Drag & drop uses transform (smooth 60fps)
- RLS policies filter widgets at database level
- User layouts cached in React state
- Debounced save to prevent excessive DB writes

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ✅ Responsive grid

---

**Built with:** React, Tailwind CSS, @dnd-kit, Supabase, PostgreSQL
