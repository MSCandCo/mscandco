// Company Admin Profile API - Uses Universal Profile System
const universalHandler = require('../profile/index.js').default;

export default async function handler(req, res) {
  // Set user type for universal handler
  req.query.type = 'companyadmin';
  req.headers['x-user-type'] = 'companyadmin';
  
  // Use universal profile handler
  return universalHandler(req, res);
}
