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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Find the user by email
    const users = await management.users.getAll({
      q: `email:"${email}"`,
      search_engine: 'v3'
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const user = users[0];

    // Check if user is already verified
    if (user.email_verified) {
      return res.status(400).json({ 
        error: 'Email is already verified' 
      });
    }

    // Trigger Auth0's built-in email verification
    // This will send a new 6-digit verification code
    await management.users.update({ id: user.user_id }, {
      verify_email: true
    });

    console.log(`✅ Verification email resent to: ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
      userId: user.user_id
    });

  } catch (error) {
    console.error('Error resending verification email:', error);
    
    return res.status(500).json({ 
      error: 'Failed to resend verification email',
      details: error.message 
    });
  }
} 