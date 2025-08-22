import { createClient } from '@supabase/supabase-js';

// Service role client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // Use the working approach - direct email-based function call
    const labelAdminEmail = 'labeladmin@mscandco.com';

    if (req.method === 'GET') {
      // Get label admin profile directly
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', labelAdminEmail)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }

      if (!profile) {
        return res.status(200).json({
          email: labelAdminEmail,
          firstName: '',
          lastName: '',
          labelName: '',
          companyName: '',
          phone: '',
          countryCode: '+44',
          country: '',
          website: '',
          instagram: '',
          facebook: '',
          twitter: '',
          youtube: '',
          tiktok: '',
          bio: '',
          shortBio: '',
          isBasicInfoSet: false,
          profileCompleted: false,
          lockedFields: {},
          profileLockStatus: 'unlocked'
        });
      }

      return res.status(200).json({
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        labelName: profile.artist_name || '',
        companyName: profile.artist_name || '',
        phone: profile.phone || '',
        countryCode: profile.country_code || '+44',
        country: profile.country || '',
        website: profile.website || '',
        instagram: profile.instagram || '',
        facebook: profile.facebook || '',
        twitter: profile.twitter || '',
        youtube: profile.youtube || '',
        tiktok: profile.tiktok || '',
        bio: profile.bio || '',
        shortBio: profile.short_bio || '',
        isBasicInfoSet: profile.is_basic_info_set || false,
        profileCompleted: profile.profile_completed || false,
        lockedFields: profile.locked_fields || {},
        profileLockStatus: profile.profile_lock_status || 'unlocked',
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      });
    }

    if (req.method === 'PUT') {
      // Update using the working enterprise function
      const { data: result, error } = await supabase.rpc('update_user_profile', {
        p_email: labelAdminEmail,
        p_profile_data: req.body
      });

      if (error) {
        console.error('Error updating label admin profile:', error);
        return res.status(500).json({ error: 'Failed to update profile: ' + error.message });
      }

      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Label admin profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}