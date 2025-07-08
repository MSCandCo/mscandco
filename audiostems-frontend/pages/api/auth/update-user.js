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
    const { user_id, email, phone_number } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Prepare update object
    const updateData = {};
    
    if (email) {
      updateData.email = email;
      updateData.email_verified = false; // Require email verification for new email
    }
    
    if (phone_number) {
      updateData.phone_number = phone_number;
    }

    // Update Auth0 user
    const updatedUser = await management.users.update({ id: user_id }, updateData);

    res.status(200).json({ 
      success: true, 
      user: {
        id: updatedUser.user_id,
        email: updatedUser.email,
        phone_number: updatedUser.phone_number,
        email_verified: updatedUser.email_verified
      },
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating Auth0 user:', error);
    res.status(500).json({ 
      error: 'Failed to update user',
      details: error.message 
    });
  }
} 