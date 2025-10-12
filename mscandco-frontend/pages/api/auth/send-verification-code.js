import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry

    // Get user by email
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Store verification code in database
    const { error: insertError } = await supabase
      .from('email_verification_codes')
      .insert({
        user_id: user.id,
        code: code,
        expires_at: expiresAt.toISOString()
      });

    if (insertError) {
      console.error('Error storing verification code:', insertError);
      return res.status(500).json({ error: 'Failed to generate verification code' });
    }

    // Send professional welcome email with verification code
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to MSC & Co - Verify Your Email</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .verification-box { background-color: #f8fafc; border: 2px dashed #667eea; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
        .verification-code { font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; margin: 20px 0; font-family: 'Courier New', monospace; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .features { background-color: #f8fafc; border-radius: 8px; padding: 25px; margin: 30px 0; }
        .feature-item { display: flex; align-items: center; margin: 15px 0; }
        .feature-icon { width: 20px; height: 20px; margin-right: 15px; color: #667eea; }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { margin: 5px 0; color: #64748b; font-size: 14px; }
        .security-note { background-color: #fef3cd; border: 1px solid #fbbf24; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .security-note p { margin: 0; color: #92400e; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎵 Welcome to MSC & Co</h1>
            <p>Your Music Distribution Journey Begins Here</p>
        </div>
        
        <div class="content">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Verify Your Email Address</h2>
            
            <p>Welcome to MSC & Co! We're excited to have you join our music distribution platform. To complete your registration and start your journey, please verify your email address using the code below:</p>
            
            <div class="verification-box">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: #475569;">Your Verification Code</p>
                <div class="verification-code">${code}</div>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #64748b;">Enter this code on the verification page</p>
            </div>
            
            <div class="security-note">
                <p><strong>Security Notice:</strong> This code expires in 15 minutes. If you didn't request this verification, please ignore this email or contact our support team.</p>
            </div>
            
            <div class="features">
                <h3 style="color: #1e293b; margin-bottom: 20px;">What's Next?</h3>
                <div class="feature-item">
                    <span class="feature-icon">🔐</span>
                    <span>Set up your backup codes for account security</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">👤</span>
                    <span>Complete your artist profile and preferences</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">🎵</span>
                    <span>Start uploading and distributing your music</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">💰</span>
                    <span>Track earnings and analytics across platforms</span>
                </div>
            </div>
            
            <p>Need help? Our support team is here for you:</p>
            <ul style="color: #64748b;">
                <li><strong>Email:</strong> support@mscandco.com</li>
                <li><strong>Documentation:</strong> help.mscandco.com</li>
                <li><strong>Community:</strong> community.mscandco.com</li>
            </ul>
        </div>
        
        <div class="footer">
            <p><strong>MSC & Co</strong> - Professional Music Distribution</p>
            <p>Empowering artists and labels worldwide</p>
            <p style="margin-top: 20px;">© 2025 MSC & Co. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

    // Here you would integrate with your email service (SendGrid, Mailgun, etc.)
    // For now, we'll just log the email content
    console.log('Verification email would be sent to:', email);
    console.log('Verification code:', code);
    console.log('Email HTML length:', emailHtml.length);

    // TODO: Integrate with actual email service
    // await sendEmail({
    //   to: email,
    //   subject: '🎵 Welcome to MSC & Co - Verify Your Email',
    //   html: emailHtml
    // });

    res.status(200).json({ 
      message: 'Verification code sent successfully',
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
