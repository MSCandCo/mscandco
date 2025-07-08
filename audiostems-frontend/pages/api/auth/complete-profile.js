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
    const { email, artistType, genre, contractStatus, dateSigned, socialMedia, managerInfo, furtherInfo } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const users = await management.usersByEmail.getByEmail({ email });
    
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Parse JSON strings back to objects
    const parsedSocialMedia = typeof socialMedia === 'string' ? JSON.parse(socialMedia) : socialMedia;
    const parsedManagerInfo = typeof managerInfo === 'string' ? JSON.parse(managerInfo) : managerInfo;

    // Update user metadata with complete profile information
    const updatedMetadata = {
      ...user.user_metadata,
      artistType,
      genre,
      contractStatus,
      dateSigned,
      socialMedia: parsedSocialMedia,
      managerInfo: parsedManagerInfo,
      furtherInfo,
      profileComplete: true,
      registrationStep: 'profile_completed'
    };

    // If email or phone number changed, update the main user fields
    const updateData = {
      user_metadata: updatedMetadata,
      app_metadata: {
        ...user.app_metadata,
        registrationStep: 'profile_completed'
      }
    };

    // Update email if it changed
    if (email !== user.email) {
      updateData.email = email;
      updateData.email_verified = false; // Reset verification since email changed
    }

    // Update phone number if provided
    if (req.body.phoneNumber && req.body.phoneNumber !== user.phone_number) {
      updateData.phone_number = req.body.phoneNumber;
      updateData.phone_verified = false; // Reset verification since phone changed
    }

    await management.users.update({ id: user.user_id }, updateData);

    res.status(200).json({ 
      success: true, 
      message: 'Profile completed successfully' 
    });

  } catch (error) {
    console.error('Error completing profile:', error);
    res.status(500).json({ error: 'Failed to complete profile. Please try again.' });
  }
} 