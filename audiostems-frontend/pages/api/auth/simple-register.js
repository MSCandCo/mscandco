import { createClient } from '@supabase/supabase-js';

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    console.log('🚀 Starting registration for:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Step 1: Create auth user with admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        registration_source: 'simple_register'
      }
    });

    if (authError) {
      console.error('❌ Auth creation failed:', authError);
      return res.status(400).json({ error: authError.message });
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Step 2: Create user profile using service role
    const profileData = {
      id: authData.user.id,
      email: email,
      role: 'artist',
      first_name: '',
      last_name: '',
      display_name: email.split('@')[0],
      registration_completed: false,
      profile_completed: false,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ error: 'Failed to create user profile: ' + profileError.message });
    }

    console.log('✅ Profile created successfully');

    // Step 3: Create artist profile
    const { error: artistError } = await supabaseAdmin
      .from('artists')
      .insert({
        user_id: authData.user.id,
        stage_name: email.split('@')[0],
        real_name: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (artistError) {
      console.warn('⚠️ Artist profile creation failed (non-critical):', artistError);
    } else {
      console.log('✅ Artist profile created');
    }

    res.status(200).json({
      success: true,
      message: 'Registration successful! You can now sign in.',
      user: {
        id: authData.user.id,
        email: email,
        role: 'artist'
      }
    });

  } catch (error) {
    console.error('💥 Registration error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
