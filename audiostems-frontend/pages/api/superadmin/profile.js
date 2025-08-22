// Super Admin Profile API - Uses Universal Profile System
const universalHandler = require('../profile/index.js').default;

export default async function handler(req, res) {
  // Set user type for universal handler
  req.query.type = 'superadmin';
  req.headers['x-user-type'] = 'superadmin';
  
  // Use universal profile handler
  return universalHandler(req, res);
}
