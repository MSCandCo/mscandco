// Mock data for development
let mockRoster = [
  {
    id: 1,
    name: 'John Smith',
    type: 'solo_artist',
    isni: '0000000123456789',
    thumbnail: null,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'The Midnight Echoes',
    type: 'group',
    isni: '0000000123456790',
    thumbnail: null,
    createdAt: '2024-01-16T14:20:00Z'
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    type: 'producer',
    isni: '0000000123456791',
    thumbnail: null,
    createdAt: '2024-01-17T09:15:00Z'
  },
  {
    id: 4,
    name: 'Mike Davis',
    type: 'guitarist',
    isni: '0000000123456792',
    thumbnail: null,
    createdAt: '2024-01-18T16:45:00Z'
  },
  {
    id: 5,
    name: 'Lisa Chen',
    type: 'vocalist',
    isni: '0000000123456793',
    thumbnail: null,
    createdAt: '2024-01-19T11:30:00Z'
  }
];

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