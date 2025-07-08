import { ManagementClient } from 'auth0';
import sgMail from '@sendgrid/mail';

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_MGMT_CLIENT_ID,
  clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET,
  scope: 'read:users create:users update:users delete:users read:roles assign:roles'
});

// Generate a 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email via SendGrid
async function sendVerificationEmail(email, code, firstName) {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@audiostems.com',
    subject: 'Your AudioStems verification code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0; font-size: 28px;">AudioStems</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Your verification code</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h2 style="color: #333; margin: 0; font-size: 32px; letter-spacing: 5px; font-family: 'Courier New', monospace;">${code}</h2>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Enter this code to verify your email address</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              This code will expire in 10 minutes.<br>
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Verification email sent to ${email} with code: ${code}`);
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    if (error.response) {
      console.error('SendGrid response body:', error.response.body);
    }
    
    // Fallback: Log the code to console for development
    console.log(`📧 DEVELOPMENT MODE: Verification code for ${email}: ${code}`);
    console.log(`📧 In production, this would be sent via SendGrid`);
    return false;
  }
}

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

    // Check SendGrid configuration
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY is not set');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET');
    console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || 'NOT SET');

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create user data
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
        backupCodesGenerated: false,
        verificationCode,
        codeExpiry: codeExpiry.toISOString()
      },
      app_metadata: {
        registrationStep: 'basic_info_completed'
      }
    };

    console.log('Attempting to create user with data:', { ...userData, password: '[HIDDEN]' });
    
    const user = await management.users.create(userData);
    console.log('User created successfully:', user.user_id);

    // Send verification email via SendGrid
    const emailSent = await sendVerificationEmail(email, verificationCode, firstName);
    
    if (emailSent) {
      return res.status(200).json({ 
        success: true, 
        message: 'Account created successfully. Please check your email for the 6-digit verification code.',
        userId: user.user_id 
      });
    } else {
      // User was created but email failed
      return res.status(200).json({ 
        success: true, 
        message: 'Account created successfully, but verification email failed to send. Please contact support.',
        userId: user.user_id 
      });
    }

  } catch (error) {
    console.error('Error creating account:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      body: error.body
    });

    if (error.statusCode === 409) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
} 