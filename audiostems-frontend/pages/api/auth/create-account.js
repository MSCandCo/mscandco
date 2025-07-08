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
    const { email, password, firstName, lastName, stageName, brand } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !stageName || !brand) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, password, firstName, lastName, stageName, brand' 
      });
    }

    console.log('Auth0 Domain:', process.env.AUTH0_DOMAIN);
    console.log('Auth0 MGMT Client ID:', process.env.AUTH0_MGMT_CLIENT_ID ? 'SET' : 'NOT SET');
    console.log('Auth0 MGMT Client Secret:', process.env.AUTH0_MGMT_CLIENT_SECRET ? 'SET' : 'NOT SET');

    // Check if user already exists
    try {
      const existingUsers = await management.users.getAll({
        q: `email:"${email}"`,
        search_engine: 'v3'
      });
      
      if (existingUsers && existingUsers.length > 0) {
        return res.status(409).json({ 
          error: 'User with this email already exists' 
        });
      }
    } catch (error) {
      console.log('User check error (this is normal if user doesn\'t exist):', error.message);
    }

    // Create user data with Auth0's native email verification enabled
    const userData = {
      email,
      password,
      connection: 'Username-Password-Authentication',
      name: `${firstName} ${lastName}`,
      given_name: firstName,
      family_name: lastName,
      email_verified: false, // Will be verified when user enters the 6-digit code
      verify_email: true, // Enable Auth0's native email verification
      user_metadata: {
        firstName,
        lastName,
        stageName,
        brand, // Add brand selection
        registrationStep: 'basic_info_completed',
        emailVerified: false,
        mobileVerified: false,
        profileComplete: false,
        backupCodesGenerated: false
      },
      app_metadata: { 
        registrationStep: 'basic_info_completed',
        brand // Add brand to app metadata as well
      }
    };

    console.log('Attempting to create user with data:', { ...userData, password: '[HIDDEN]' });
    
    const user = await management.users.create(userData);
    console.log('User created successfully:', user.user_id);

    // Auth0 will automatically send the verification email with 6-digit code
    console.log('Auth0 will send verification email with 6-digit code to:', email);

    return res.status(200).json({
      success: true,
      message: 'User created successfully. Please check your email for the verification code.',
      userId: user.user_id,
      email: email
    });

  } catch (error) {
    console.error('Error creating account:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      body: error.body
    });

    if (error.statusCode === 409) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    return res.status(500).json({ 
      error: 'Failed to create account',
      details: error.message 
    });
  }
} 