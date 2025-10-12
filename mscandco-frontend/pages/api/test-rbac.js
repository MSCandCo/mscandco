/**
 * Test API Route for RBAC Middleware
 * 
 * This route tests the RBAC middleware functionality:
 * - Should work for company_admin and super_admin (have user:view:any permission)
 * - Should fail for artist (doesn't have user:view:any permission)
 * - Returns user info and role for debugging
 */

import { requirePermission } from '@/lib/rbac/middleware';

async function handler(req, res) {
  // SECURITY: Disable test endpoint in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // req.user and req.userRole are automatically attached by middleware
    const { user, userRole } = req;

    return res.status(200).json({
      success: true,
      message: 'RBAC middleware working correctly!',
      data: {
        userId: user.id,
        userEmail: user.email,
        userRole: userRole,
        timestamp: new Date().toISOString(),
        permissions: {
          tested: 'user:view:any',
          result: 'PASSED - You have the required permission'
        }
      }
    });

  } catch (error) {
    console.error('Test RBAC error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process RBAC test'
    });
  }
}

// Protect with user:view:any permission (should work for company_admin/super_admin, fail for artist)
export default requirePermission('user:view:any')(handler);

