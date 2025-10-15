/**
 * Dashboard Stats API
 * GET /api/dashboard/stats/:metric
 * Fetches real-time statistics for dashboard widgets
 */

import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user } = req;
  const { metric } = req.query;

  try {
    let data;

    switch (metric) {
      case 'total_users':
        data = await getTotalUsers(user);
        break;
      case 'total_revenue':
        data = await getTotalRevenue(user);
        break;
      case 'total_streams':
        data = await getTotalStreams(user);
        break;
      case 'active_releases':
        data = await getActiveReleases(user);
        break;
      case 'pending_requests':
        data = await getPendingRequests(user);
        break;
      default:
        return res.status(400).json({ error: 'Invalid metric' });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error(`Error fetching metric ${metric}:`, error);
    return res.status(500).json({ error: 'Failed to fetch metric' });
  }
}

async function getTotalUsers(user) {
  // For admin roles - get all users
  if (['company_admin', 'analytics_admin', 'superadmin'].includes(user.role)) {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    // Get previous month count for trend calculation
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const { count: prevCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', lastMonth.toISOString());

    const change = prevCount > 0 ? ((count - prevCount) / prevCount) * 100 : 0;

    return {
      value: count || 0,
      change: parseFloat(change.toFixed(1)),
      label: 'Total Users',
      format: 'number'
    };
  }

  return {
    value: 0,
    change: 0,
    label: 'Total Users',
    format: 'number',
    error: 'Insufficient permissions'
  };
}

async function getTotalRevenue(user) {
  // For admin and financial roles
  if (['company_admin', 'financial_admin', 'superadmin'].includes(user.role)) {
    // TODO: Replace with actual revenue calculation from earnings table
    return {
      value: 45320.50,
      change: 8.2,
      label: 'Total Revenue',
      format: 'currency'
    };
  }

  return {
    value: 0,
    change: 0,
    label: 'Total Revenue',
    format: 'currency',
    error: 'Insufficient permissions'
  };
}

async function getTotalStreams(user) {
  if (user.role === 'artist') {
    // TODO: Get artist's streams from analytics table
    return {
      value: 125430,
      change: 15.3,
      label: 'Total Streams',
      format: 'number'
    };
  }

  if (['company_admin', 'analytics_admin', 'superadmin'].includes(user.role)) {
    // TODO: Get all streams
    return {
      value: 2456789,
      change: 12.5,
      label: 'Total Streams',
      format: 'number'
    };
  }

  return {
    value: 0,
    change: 0,
    label: 'Total Streams',
    format: 'number',
    error: 'Insufficient permissions'
  };
}

async function getActiveReleases(user) {
  if (user.role === 'artist') {
    // TODO: Get artist's releases
    return {
      value: 12,
      change: 0,
      label: 'Your Releases',
      format: 'number'
    };
  }

  if (['company_admin', 'content_moderator', 'superadmin'].includes(user.role)) {
    // TODO: Get all active releases
    return {
      value: 342,
      change: 5.2,
      label: 'Active Releases',
      format: 'number'
    };
  }

  return {
    value: 0,
    change: 0,
    label: 'Active Releases',
    format: 'number',
    error: 'Insufficient permissions'
  };
}

async function getPendingRequests(user) {
  // TODO: Implement actual request counting based on role
  if (['company_admin', 'requests_admin', 'superadmin'].includes(user.role)) {
    return {
      value: 23,
      change: -15.5,
      label: 'Pending Requests',
      format: 'number'
    };
  }

  return {
    value: 0,
    change: 0,
    label: 'Pending Requests',
    format: 'number',
    error: 'Insufficient permissions'
  };
}

export default requireAuth(handler);
