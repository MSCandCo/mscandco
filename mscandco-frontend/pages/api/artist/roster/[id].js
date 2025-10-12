import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { requirePermission } from '@/lib/rbac/middleware';

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

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

async function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Supabase session validation integrated
      
      const mockContributor = {
        id: id,
        name: 'John Doe',
        type: 'Solo Artist',
        isni: '0000000123456789',
        thumbnail: '/api/placeholder/100/100',
        email: 'john.doe@example.com',
        role: 'Lead Artist',
        bio: 'A passionate musician with over 10 years of experience.',
        socialMedia: {
          instagram: 'johndoemusic',
          twitter: '@johndoe',
          facebook: 'johndoemusic'
        },
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-07-28T22:00:00Z'
      };

      return res.status(200).json({
        success: true,
        contributor: mockContributor
      });
    } catch (error) {
      console.error('Error in roster [id] GET API:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      // Supabase session validation integrated
      
      console.log('PUT request received for contributor:', id);
      console.log('Request body:', req.body);

      return res.status(200).json({
        success: true,
        message: 'Contributor updated successfully',
        contributor: {
          id: id,
          ...req.body,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error in roster [id] PUT API:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Supabase session validation integrated
      
      console.log('DELETE request received for contributor:', id);

      return res.status(200).json({
        success: true,
        message: 'Contributor deleted successfully'
      });
    } catch (error) {
      console.error('Error in roster [id] DELETE API:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

export default requirePermission('roster:edit:own')(handler);