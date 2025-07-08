import { ManagementClient } from 'auth0';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_MGMT_CLIENT_ID,
  clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET,
  scope: 'read:users create:users update:users delete:users read:roles assign:roles'
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

    // Debug: Log environment variables (without secrets)
    console.log('Auth0 Domain:', process.env.AUTH0_DOMAIN);
    console.log('Auth0 MGMT Client ID:', process.env.AUTH0_MGMT_CLIENT_ID ? 'SET' : 'NOT SET');
    console.log('Auth0 MGMT Client Secret:', process.env.AUTH0_MGMT_CLIENT_SECRET ? 'SET' : 'NOT SET');

    // Check if user already exists
    try {
      const existingUsers = await management.usersByEmail.getByEmail({ email });
      if (existingUsers && existingUsers.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
    } catch (error) {
      console.log('User check error (this is normal if user doesn\'t exist):', error.message);
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

    console.log('Attempting to create user with data:', { ...userData, password: '[HIDDEN]' });
    
    const user = await management.users.create(userData);
    console.log('User created successfully:', user.user_id);

    // Send email verification
    try {
      await management.jobs.verifyEmail.create({
        user_id: user.user_id
      });
      console.log('Email verification job created');
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
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      body: error.body
    });
    
    if (error.message.includes('Password is too weak')) {
      return res.status(400).json({ error: 'Password is too weak. Please choose a stronger password.' });
    }
    
    if (error.message.includes('Invalid email')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
} 