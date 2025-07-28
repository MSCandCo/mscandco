import { getSession } from '@auth0/nextjs-auth0';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is an artist
    const userRole = session.user['https://mscandco.com/role'];
    if (userRole !== 'artist') {
      return res.status(403).json({ message: 'Access denied. Artists only.' });
    }

    const profileData = req.body;

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'artistName', 'email', 'primaryGenre'];
    const missingFields = requiredFields.filter(field => !profileData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate royalty rate
    if (profileData.royaltyRate && (profileData.royaltyRate < 0 || profileData.royaltyRate > 100)) {
      return res.status(400).json({ message: 'Royalty rate must be between 0 and 100' });
    }

    // Validate ISRC prefix format (if provided)
    if (profileData.isrcPrefix && !/^[A-Z]{2}-[A-Z0-9]{3}-\d{2}$/.test(profileData.isrcPrefix)) {
      return res.status(400).json({ message: 'Invalid ISRC prefix format. Use format: XX-XXX-XX' });
    }

    // In production, you would save this to your database
    // For now, we'll just return success
    const updatedProfile = {
      ...profileData,
      updatedAt: new Date().toISOString(),
      isVerified: profileData.isVerified || false
    };

    // Mock database save
    console.log('Saving artist profile:', updatedProfile);

    res.status(200).json({ 
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Error updating artist profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 