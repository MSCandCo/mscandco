import { createClient } from '@supabase/supabase-js';

// Create admin client to check if email exists
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

    console.log('🔍 Checking if email exists:', email);

    // Check if email exists in Supabase Auth
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return res.status(500).json({ error: 'Failed to check email' });
    }

    // Check if any user has this email
    const existingUser = users.users.find(user => 
      user.email && user.email.toLowerCase() === email.toLowerCase()
    );

    const emailExists = !!existingUser;
    
    console.log('📧 Email check result:', {
      email,
      exists: emailExists,
      userId: existingUser?.id || null
    });

    res.status(200).json({
      success: true,
      emailExists,
      message: emailExists 
        ? 'This email address exists and is associated with an account. Please log in instead.'
        : 'Email is available for registration.'
    });

  } catch (error) {
    console.error('💥 Email check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

