import { ManagementClient } from 'auth0';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: 'read:users update:users'
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    // Find user by email
    const users = await management.usersByEmail.getByEmail({ email });
    
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // In a real implementation, you would verify the code against what was sent
    // For now, we'll simulate verification by checking if the code is 6 digits
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Update user metadata to mark email as verified
    await management.users.update({ id: user.user_id }, {
      user_metadata: {
        ...user.user_metadata,
        emailVerified: true,
        registrationStep: 'email_verification_completed'
      },
      app_metadata: {
        ...user.app_metadata,
        registrationStep: 'email_verification_completed'
      }
    });

    res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully' 
    });

  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Failed to verify email. Please try again.' });
  }
} 