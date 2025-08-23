import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user } = req.body;
    
    if (!user || !user.id) {
      return res.status(400).json({ error: 'User data required' });
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return res.status(200).json({ message: 'Profile already exists', profile: existingProfile });
    }

    // Create new profile
    const profileData = {
      id: user.id,
      email: user.email,
      first_name: user.user_metadata?.given_name || user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.family_name || user.user_metadata?.last_name || '',
      role: user.user_metadata?.role || 'artist',
      brand: user.user_metadata?.brand || 'YHWH',
      email_verified: user.email_confirmed_at ? true : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newProfile, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      return res.status(500).json({ error: 'Failed to create profile', details: error.message });
    }

    return res.status(201).json({ message: 'Profile created successfully', profile: newProfile });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}