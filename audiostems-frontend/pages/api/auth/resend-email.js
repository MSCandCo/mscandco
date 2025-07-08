import { ManagementClient } from 'auth0';
import sgMail from '@sendgrid/mail';

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_MGMT_CLIENT_ID,
  clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET,
  scope: 'read:users update:users'
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
    subject: 'Your new AudioStems verification code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">AudioStems Verification Code</h2>
        <p>Hi ${firstName},</p>
        <p>Here's your new verification code:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,<br>The AudioStems Team</p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('Verification email resent successfully');
    return true;
  } catch (error) {
    console.error('Failed to resend verification email:', error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const users = await management.usersByEmail.getByEmail({ email });
    
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const userMetadata = user.user_metadata || {};

    // Generate new verification code
    const newVerificationCode = generateVerificationCode();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update user metadata with new code
    const updatedMetadata = {
      ...userMetadata,
      verificationCode: newVerificationCode,
      codeExpiry: codeExpiry.toISOString()
    };

    await management.users.update({ id: user.user_id }, {
      user_metadata: updatedMetadata
    });

    // Send new verification email
    const emailSent = await sendVerificationEmail(email, newVerificationCode, userMetadata.firstName || 'User');
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'New verification code sent to your email'
    });

  } catch (error) {
    console.error('Error resending verification email:', error);
    return res.status(500).json({ error: 'Failed to resend verification email. Please try again.' });
  }
} 