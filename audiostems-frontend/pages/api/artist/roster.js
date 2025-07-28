import { getSession } from '@auth0/nextjs-auth0';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

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
  const session = await getSession(req, res);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userRole = session.user['https://mscandco.com/role'];
  if (!userRole || !['artist', 'label_admin', 'company_admin', 'super_admin'].includes(userRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req, res) {
  try {
    // Return mock data for now
    // In production, this would query the database
    res.status(200).json(mockRoster);
  } catch (error) {
    console.error('Error fetching roster:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePost(req, res) {
  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ message: 'Error parsing form data' });
      }

      const { name, type, isni } = fields;
      
      // Validate required fields
      if (!name || !type || !isni) {
        return res.status(400).json({ 
          message: 'Missing required fields: name, type, isni' 
        });
      }

      // Validate ISNI format
      const isniRegex = /^[0-9]{15}[0-9X]$/;
      if (!isniRegex.test(isni)) {
        return res.status(400).json({ 
          message: 'Invalid ISNI format. Must be 16 digits with last character being a digit or X.' 
        });
      }

      // Check if ISNI already exists
      const existingContributor = mockRoster.find(c => c.isni === isni);
      if (existingContributor) {
        return res.status(409).json({ 
          message: 'Contributor with this ISNI already exists' 
        });
      }

      // Handle thumbnail upload
      let thumbnailPath = null;
      if (files.thumbnail) {
        const file = files.thumbnail;
        const fileName = `roster_${Date.now()}_${file.originalFilename}`;
        const newPath = path.join(process.cwd(), 'public', 'uploads', fileName);
        
        // Copy file to uploads directory
        fs.copyFileSync(file.filepath, newPath);
        thumbnailPath = `/uploads/${fileName}`;
        
        // Clean up temporary file
        fs.unlinkSync(file.filepath);
      }

      // Create new contributor
      const newContributor = {
        id: Math.max(...mockRoster.map(c => c.id)) + 1,
        name: name.toString(),
        type: type.toString(),
        isni: isni.toString(),
        thumbnail: thumbnailPath,
        createdAt: new Date().toISOString()
      };

      mockRoster.push(newContributor);

      res.status(201).json(newContributor);
    });
  } catch (error) {
    console.error('Error creating contributor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const contributorId = parseInt(id);

    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ message: 'Error parsing form data' });
      }

      const { name, type, isni } = fields;
      
      // Find existing contributor
      const contributorIndex = mockRoster.findIndex(c => c.id === contributorId);
      if (contributorIndex === -1) {
        return res.status(404).json({ message: 'Contributor not found' });
      }

      // Validate required fields
      if (!name || !type || !isni) {
        return res.status(400).json({ 
          message: 'Missing required fields: name, type, isni' 
        });
      }

      // Validate ISNI format
      const isniRegex = /^[0-9]{15}[0-9X]$/;
      if (!isniRegex.test(isni)) {
        return res.status(400).json({ 
          message: 'Invalid ISNI format. Must be 16 digits with last character being a digit or X.' 
        });
      }

      // Check if ISNI already exists (excluding current contributor)
      const existingContributor = mockRoster.find(c => c.isni === isni && c.id !== contributorId);
      if (existingContributor) {
        return res.status(409).json({ 
          message: 'Contributor with this ISNI already exists' 
        });
      }

      // Handle thumbnail upload
      let thumbnailPath = mockRoster[contributorIndex].thumbnail;
      if (files.thumbnail) {
        const file = files.thumbnail;
        const fileName = `roster_${Date.now()}_${file.originalFilename}`;
        const newPath = path.join(process.cwd(), 'public', 'uploads', fileName);
        
        // Copy file to uploads directory
        fs.copyFileSync(file.filepath, newPath);
        thumbnailPath = `/uploads/${fileName}`;
        
        // Clean up temporary file
        fs.unlinkSync(file.filepath);
      }

      // Update contributor
      mockRoster[contributorIndex] = {
        ...mockRoster[contributorIndex],
        name: name.toString(),
        type: type.toString(),
        isni: isni.toString(),
        thumbnail: thumbnailPath,
        updatedAt: new Date().toISOString()
      };

      res.status(200).json(mockRoster[contributorIndex]);
    });
  } catch (error) {
    console.error('Error updating contributor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    const contributorId = parseInt(id);

    const contributorIndex = mockRoster.findIndex(c => c.id === contributorId);
    if (contributorIndex === -1) {
      return res.status(404).json({ message: 'Contributor not found' });
    }

    // Remove contributor from array
    mockRoster.splice(contributorIndex, 1);

    res.status(200).json({ message: 'Contributor deleted successfully' });
  } catch (error) {
    console.error('Error deleting contributor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 