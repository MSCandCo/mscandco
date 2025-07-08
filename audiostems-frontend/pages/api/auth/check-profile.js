import { getSession } from '@auth0/nextjs-auth0';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the user session from Auth0
    const session = await getSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { user } = session;

    // Check if profile is complete based on user metadata
    const profileComplete = user['https://audiostems.com/profile_complete'] || false;

    return res.status(200).json({
      profileComplete,
      user: {
        id: user.sub,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });

  } catch (error) {
    console.error('Profile check error:', error);
    return res.status(500).json({
      message: 'Failed to check profile status'
    });
  }
} 