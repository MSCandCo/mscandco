import { createClient } from '@supabase/supabase-js';

// Create admin client to check user verification
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('🔍 Checking verification for email:', email);

    // Get all users and find by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return res.status(500).json({ error: 'Failed to check verification status' });
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isVerified = !!(user.email_confirmed_at || user.confirmed_at);
    
    console.log('✅ Verification check result:', {
      email: user.email,
      id: user.id,
      email_confirmed_at: user.email_confirmed_at,
      confirmed_at: user.confirmed_at,
      isVerified
    });

    res.status(200).json({
      success: true,
      isVerified,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        confirmed_at: user.confirmed_at
      }
    });

  } catch (error) {
    console.error('💥 Verification check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

