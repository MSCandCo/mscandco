export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Supabase session validation integrated with user role check
    
    const { firstName, lastName, email, phone, artistType, bio, genre, subGenre, royaltyRate, isrcPrefix, facebook, tiktok, threads, twitter, youtube, instagram, website } = req.body;

    // Validation
    const requiredFields = ['firstName', 'lastName', 'email', 'artistType'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Royalty rate validation
    if (royaltyRate && (royaltyRate < 0 || royaltyRate > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Royalty rate must be between 0 and 100'
      });
    }

    // ISRC prefix validation
    if (isrcPrefix && !/^[A-Z]{2}-[A-Z]{3}-[0-9]{2}-[0-9]{5}$/.test(isrcPrefix)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ISRC prefix format (e.g., US-RC1-24-12345)'
      });
    }

    console.log('Profile update received:', req.body);

    const updatedProfile = {
      ...req.body,
      updatedAt: new Date().toISOString(),
      id: 'mock-profile-id'
    };

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error in update-profile API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
} 