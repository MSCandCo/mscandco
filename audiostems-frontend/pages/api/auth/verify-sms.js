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
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'Phone number and verification code are required' });
    }

    // In a real implementation, you would verify the SMS code against what was sent
    // For now, we'll simulate verification by checking if the code is 6 digits
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid SMS verification code' });
    }

    // For demo purposes, we'll assume the verification is successful
    // In a real app, you would verify against the actual SMS code sent

    res.status(200).json({ 
      success: true, 
      message: 'SMS verified successfully' 
    });

  } catch (error) {
    console.error('Error verifying SMS:', error);
    res.status(500).json({ error: 'Failed to verify SMS. Please try again.' });
  }
} 