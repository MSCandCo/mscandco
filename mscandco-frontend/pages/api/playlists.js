import { requireAuth } from '@/lib/rbac/middleware';

// Simple playlists API endpoint to prevent 404 errors
function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware
  if (req.method === 'GET') {
    // Return empty playlists for now
    res.status(200).json([]);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default requireAuth(handler)