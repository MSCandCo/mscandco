// Super Admin Profile API - Uses Universal Profile System
import { requireRole } from '@/lib/rbac/middleware';

const universalHandler = require('../profile/index.js').default;

async function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware
  // Set user type for universal handler
  req.query.type = 'superadmin';
  req.headers['x-user-type'] = 'superadmin';

  // Use universal profile handler
  return universalHandler(req, res);
}

export default requireRole('super_admin')(handler);
