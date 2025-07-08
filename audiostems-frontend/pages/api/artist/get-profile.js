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
    // Get the user ID from the request (you might need to implement authentication)
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch user data from Auth0
    const user = await management.users.get({ id: user_id });
    
    // Extract profile information from Auth0 user data
    const profile = {
      firstName: user.given_name || user.user_metadata?.firstName || '',
      lastName: user.family_name || user.user_metadata?.lastName || '',
      stageName: user.user_metadata?.stageName || '',
      email: user.email || '',
      phone: user.phone_number || user.user_metadata?.phone || '',
      artistType: user.user_metadata?.artistType || '',
      genre: user.user_metadata?.genre || '',
      contractStatus: user.user_metadata?.contractStatus || '',
      dateSigned: user.user_metadata?.dateSigned || '',
      socialMedia: user.user_metadata?.socialMedia || {
        instagram: '',
        twitter: '',
        facebook: '',
        spotify: '',
        appleMusic: '',
        soundcloud: '',
        youtube: '',
        tiktok: ''
      },
      manager: user.user_metadata?.manager || '',
      furtherInformation: user.user_metadata?.furtherInformation || '',
      profileImage: user.picture || user.user_metadata?.profileImage || '',
      profileComplete: user.user_metadata?.profileComplete || false
    };

    res.status(200).json({ 
      success: true, 
      profile 
    });

  } catch (error) {
    console.error('Error fetching artist profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      details: error.message 
    });
  }
} 