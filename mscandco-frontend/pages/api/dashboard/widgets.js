/**
 * Dashboard Widgets API
 * GET /api/dashboard/widgets
 * Fetches user's dashboard widgets with layout
 * Updated: Cookie-based auth support added
 */

import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  console.log('📊 Dashboard widgets handler - User:', req.user?.email, 'Role:', req.userRole);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user } = req;

  try {
    // First, try to get user's custom layout
    const { data: userLayout, error: userLayoutError } = await supabase
      .from('user_dashboard_layouts')
      .select(`
        id,
        widget_id,
        grid_column_span,
        grid_row,
        display_order,
        is_visible,
        widget:dashboard_widgets (
          id,
          name,
          description,
          required_role,
          required_permission,
          config,
          widget_type:dashboard_widget_types (
            id,
            name,
            display_name,
            component_name,
            default_width,
            default_height
          )
        )
      `)
      .eq('user_id', user.id)
      .order('display_order');

    if (userLayoutError) throw userLayoutError;

    // If user has custom layout, use it
    if (userLayout && userLayout.length > 0) {
      const filteredLayout = await filterWidgetsByPermissions(userLayout, user);
      return res.status(200).json({
        widgets: filteredLayout,
        isCustomLayout: true
      });
    }

    // Otherwise, get role default layout
    const { data: roleLayout, error: roleLayoutError } = await supabase
      .from('role_dashboard_layouts')
      .select(`
        widget_id,
        grid_column_span,
        grid_row,
        display_order,
        widget:dashboard_widgets (
          id,
          name,
          description,
          required_role,
          required_permission,
          config,
          widget_type:dashboard_widget_types (
            id,
            name,
            display_name,
            component_name,
            default_width,
            default_height
          )
        )
      `)
      .eq('role', user.role)
      .order('display_order');

    if (roleLayoutError) {
      console.error('Role layout error:', roleLayoutError);
      throw roleLayoutError;
    }

    if (!roleLayout || roleLayout.length === 0) {
      console.log(`No default widgets found for role: ${user.role}`);
      return res.status(200).json({
        widgets: [],
        isCustomLayout: false
      });
    }

    const filteredLayout = await filterWidgetsByPermissions(
      roleLayout.map(item => ({ ...item, is_visible: true })),
      user
    );

    return res.status(200).json({
      widgets: filteredLayout,
      isCustomLayout: false
    });

  } catch (error) {
    console.error('Error fetching dashboard widgets:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard widgets' });
  }
}

async function filterWidgetsByPermissions(layout, user) {
  const filtered = [];

  for (const item of layout) {
    const widget = item.widget;

    // Check role requirement
    if (widget.required_role && widget.required_role !== user.role && user.role !== 'superadmin') {
      continue;
    }

    // Check permission requirement
    if (widget.required_permission) {
      const hasPermission = await checkUserPermission(user.id, widget.required_permission);
      if (!hasPermission) {
        continue;
      }
    }

    filtered.push(item);
  }

  return filtered;
}

async function checkUserPermission(userId, permission) {
  // Fetch user's permissions
  const { data: userPermissions, error } = await supabase
    .from('user_permissions')
    .select('permission_id, permissions(resource, action, scope)')
    .eq('user_id', userId);

  if (error || !userPermissions) return false;

  // Check for wildcard permission
  const hasWildcard = userPermissions.some(up =>
    up.permissions?.resource === '*' &&
    up.permissions?.action === '*' &&
    up.permissions?.scope === '*'
  );

  if (hasWildcard) return true;

  // Parse required permission
  const [resource, action, scope] = permission.split(':');

  // Check for exact match or resource wildcard
  return userPermissions.some(up => {
    const p = up.permissions;
    if (!p) return false;

    return (
      (p.resource === resource || p.resource === '*') &&
      (p.action === action || p.action === '*') &&
      (p.scope === scope || p.scope === '*')
    );
  });
}

export default requireAuth(handler);
