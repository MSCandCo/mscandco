import { requireAuth } from '@/lib/rbac/middleware';

// Playlists populate API endpoint to prevent 404 errors
function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware
  if (req.method === 'GET') {
    // Return empty result for now
    res.status(200).json({ success: true, data: [] });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default requireAuth(handler)