export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the verification code in Auth0 user metadata or a temporary storage
    // For now, we'll use a simple approach - in production, use Redis or similar
    const verificationData = {
      email,
      code: verificationCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
    };

    // Store verification data (in production, use Redis or database)
    global.verificationCodes = global.verificationCodes || new Map();
    global.verificationCodes.set(email, verificationData);

    // Send email using Auth0's email service or your preferred email service
    const emailResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/jobs/verification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AUTH0_MANAGEMENT_TOKEN}`
      },
      body: JSON.stringify({
        user_id: email, // This should be the Auth0 user ID
        client_id: process.env.AUTH0_CLIENT_ID,
        template: 'verification-email',
        template_data: {
          verification_code: verificationCode,
          user_name: email.split('@')[0]
        }
      })
    });

    if (!emailResponse.ok) {
      // Fallback: Send email using your own email service
      await sendVerificationEmail(email, verificationCode);
    }

    return res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      message: 'Failed to send verification email'
    });
  }
}

async function sendVerificationEmail(email, code) {
  // Implement your email sending logic here
  // You can use services like SendGrid, AWS SES, or Nodemailer
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">AudioStems Email Verification</h2>
      <p>Your verification code is: <strong style="font-size: 24px; color: #007bff;">${code}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    </div>
  `;

  // Example using a simple email service
  // In production, use a proper email service
  console.log(`Verification email sent to ${email} with code: ${code}`);
} 