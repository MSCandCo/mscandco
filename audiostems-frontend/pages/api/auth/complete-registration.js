import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user from the request
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with the user's session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const {
      role,
      firstName,
      lastName,
      dateOfBirth,
      nationality,
      country,
      city,
      backupCodes
    } = req.body;

    // Validate required fields
    if (!role || !firstName || !lastName || !dateOfBirth || !nationality || !country || !city) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role (only artist and label_admin allowed from frontend)
    if (!['artist', 'label_admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if profile already exists and is completed
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('profile_completed, registration_completed')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', profileError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingProfile?.registration_completed) {
      return res.status(400).json({ error: 'Registration already completed' });
    }

    // Create or update user profile
    const profileData = {
      id: user.id,
      email: user.email,
      role: role,
      first_name: firstName,
      last_name: lastName,
      display_name: `${firstName} ${lastName}`,
      date_of_birth: dateOfBirth,
      nationality: nationality,
      city: city,
      address: country,
      registration_completed: true,
      profile_completed: true,
      immutable_data_locked: true,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert or update the profile
    const { data: profile, error: upsertError } = await supabase
      .from('user_profiles')
      .upsert(profileData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error creating/updating profile:', upsertError);
      return res.status(500).json({ error: 'Failed to complete registration' });
    }

    // If user is an artist, create artist profile
    if (role === 'artist') {
      const { error: artistError } = await supabase
        .from('artists')
        .upsert({
          user_id: user.id,
          stage_name: `${firstName} ${lastName}`,
          real_name: `${firstName} ${lastName}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (artistError) {
        console.error('Error creating artist profile:', artistError);
        // Don't fail the registration for this
      }
    }

    res.status(200).json({
      success: true,
      message: 'Registration completed successfully',
      profile: profile
    });

  } catch (error) {
    console.error('Registration completion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
