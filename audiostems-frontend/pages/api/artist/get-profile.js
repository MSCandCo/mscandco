// Legacy API endpoint - redirects to new profile API
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Redirect to new profile API
  try {
    const profileAPI = await import('./profile.js');
    return profileAPI.default(req, res);
  } catch (error) {
    console.error('Error in get-profile API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}