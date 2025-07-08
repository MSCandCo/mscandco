import { ManagementClient } from 'auth0';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_MGMT_CLIENT_ID,
  clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET,
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
    const userMetadata = user.user_metadata || {};

    // Check if verification code exists and is valid
    if (!userMetadata.verificationCode) {
      return res.status(400).json({ error: 'No verification code found. Please request a new one.' });
    }

    // Check if code has expired
    if (userMetadata.codeExpiry) {
      const expiryTime = new Date(userMetadata.codeExpiry);
      const currentTime = new Date();
      
      if (currentTime > expiryTime) {
        return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      }
    }

    // Verify the code
    if (userMetadata.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Update user metadata to mark email as verified and clear the verification code
    const updatedMetadata = {
      ...userMetadata,
      emailVerified: true,
      registrationStep: 'email_verified',
      verificationCode: null,
      codeExpiry: null
    };

    await management.users.update({ id: user.user_id }, {
      user_metadata: updatedMetadata,
      app_metadata: {
        ...user.app_metadata,
        registrationStep: 'email_verified'
      }
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully',
      registrationStep: 'email_verified'
    });

  } catch (error) {
    console.error('Error verifying email:', error);
    return res.status(500).json({ error: 'Failed to verify email. Please try again.' });
  }
} 