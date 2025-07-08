import { ManagementClient } from 'auth0';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_MGMT_CLIENT_ID,
  clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET,
  scope: 'read:users'
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In a real implementation, you would get the user ID from the authenticated session
    // For now, we'll return a mock profile for demonstration
    const mockProfile = {
      firstName: 'John',
      lastName: 'Doe',
      stageName: 'Johnny Music',
      email: 'john@example.com',
      phoneNumber: '+1234567890',
      artistType: 'solo artist',
      genre: 'pop',
      contractStatus: 'active',
      dateSigned: '2024-01-15',
      socialMedia: {
        instagram: '@johnnymusic',
        twitter: '@johnnymusic',
        facebook: 'johnnymusic',
        youtube: 'JohnnyMusic',
        tiktok: '@johnnymusic'
      },
      managerInfo: {
        name: 'Jane Manager',
        email: 'jane@management.com',
        phone: '+1987654321'
      },
      furtherInfo: 'Award-winning pop artist with over 10 years of experience in the music industry.'
    };

    res.status(200).json({ 
      success: true, 
      profile: mockProfile
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile. Please try again.' });
  }
} 