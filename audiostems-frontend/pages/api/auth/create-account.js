import { ManagementClient } from 'auth0';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: 'read:users create:users update:users'
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, stageName, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !stageName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    try {
      const existingUsers = await management.usersByEmail.getByEmail({ email });
      if (existingUsers && existingUsers.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
    } catch (error) {
      // User doesn't exist, continue with creation
    }

    // Create user in Auth0
    const userData = {
      email,
      password,
      connection: 'Username-Password-Authentication',
      name: `${firstName} ${lastName}`,
      given_name: firstName,
      family_name: lastName,
      user_metadata: {
        firstName,
        lastName,
        stageName,
        registrationStep: 'basic_info_completed',
        emailVerified: false,
        mobileVerified: false,
        profileComplete: false,
        backupCodesGenerated: false
      },
      app_metadata: {
        registrationStep: 'basic_info_completed'
      }
    };

    const user = await management.users.create(userData);

    // Send email verification
    try {
      await management.jobs.verifyEmail.create({
        user_id: user.user_id
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Continue even if email verification fails
    }

    res.status(200).json({ 
      success: true, 
      message: 'Account created successfully',
      userId: user.user_id 
    });

  } catch (error) {
    console.error('Error creating account:', error);
    
    if (error.message.includes('Password is too weak')) {
      return res.status(400).json({ error: 'Password is too weak. Please choose a stronger password.' });
    }
    
    if (error.message.includes('Invalid email')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
} 