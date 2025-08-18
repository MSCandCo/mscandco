// Roster will be populated from release contributors
let mockRoster = [];

export default async function handler(req, res) {
  try {
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