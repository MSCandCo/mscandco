// Roster will be populated from release contributors
import { requireAuth } from '@/lib/rbac/middleware';

let mockRoster = [];

async function handler(req, res) {
  try {
    // req.user and req.userRole are automatically attached by middleware
    console.log('API: Basic roster endpoint called');

    if (req.method === 'GET') {
      console.log('GET /api/artist/roster - Returning mock data');
      return res.status(200).json(mockRoster);
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('API: Error in handler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default requireAuth(handler); 