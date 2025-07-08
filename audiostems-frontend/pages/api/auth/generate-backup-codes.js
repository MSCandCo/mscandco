import { ManagementClient } from 'auth0';
import crypto from 'crypto';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope: 'read:users update:users'
});

function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    // Generate 8-character alphanumeric codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
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
    const backupCodes = generateBackupCodes();

    // Update user metadata to store backup codes and mark as generated
    await management.users.update({ id: user.user_id }, {
      user_metadata: {
        ...user.user_metadata,
        backupCodes: backupCodes,
        backupCodesGenerated: true,
        registrationStep: 'backup_codes_generated'
      },
      app_metadata: {
        ...user.app_metadata,
        registrationStep: 'backup_codes_generated'
      }
    });

    res.status(200).json({ 
      success: true, 
      message: 'Backup codes generated successfully',
      backupCodes: backupCodes
    });

  } catch (error) {
    console.error('Error generating backup codes:', error);
    res.status(500).json({ error: 'Failed to generate backup codes. Please try again.' });
  }
} 