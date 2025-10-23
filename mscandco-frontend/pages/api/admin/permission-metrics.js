/**
 * Permission Performance Metrics API
 *
 * Endpoint: GET /api/admin/permission-metrics
 * Returns performance metrics for the permission system
 * Requires admin access
 */

import permissionMonitor from '@/lib/permissionPerformanceMonitor';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { getUserPermissions } from '@/lib/permissions';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const supabase = createPagesServerClient({ req, res });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has admin permissions
    const permissions = await getUserPermissions(session.user.id, true);
    const permissionNames = permissions.map(p => p.permission_name);

    const isAdmin = permissionNames.includes('*:*:*') ||
                    permissionNames.includes('analytics:platform_analytics:read');

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required to view permission metrics'
      });
    }

    // Get query parameters
    const { format = 'summary', userId, permission, threshold } = req.query;

    // Return different data based on format
    if (format === 'summary') {
      return res.status(200).json(permissionMonitor.getSummary());
    }

    if (format === 'full') {
      return res.status(200).json(permissionMonitor.getMetrics());
    }

    if (format === 'slow') {
      const thresholdMs = threshold ? parseInt(threshold) : 500;
      return res.status(200).json({
        threshold: thresholdMs + 'ms',
        slowChecks: permissionMonitor.getSlowChecks(thresholdMs)
      });
    }

    if (format === 'user' && userId) {
      return res.status(200).json({
        userId,
        checks: permissionMonitor.getChecksByUser(userId)
      });
    }

    if (format === 'permission' && permission) {
      return res.status(200).json({
        permission,
        checks: permissionMonitor.getChecksByPermission(permission)
      });
    }

    // Default to summary
    return res.status(200).json(permissionMonitor.getSummary());

  } catch (error) {
    console.error('Error fetching permission metrics:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
