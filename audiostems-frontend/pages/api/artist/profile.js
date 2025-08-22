import { createClient } from '@supabase/supabase-js';

// Service role client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const artistEmail = 'info@htay.co.uk';

    if (req.method === 'GET') {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', artistEmail)
        .single();

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }

      if (!profile) {
        return res.status(200).json({
          email: artistEmail,
          firstName: '',
          lastName: '',
          artistName: '',
          dateOfBirth: null,
          nationality: '',
          country: '',
          city: '',
          artistType: '',
          phone: '',
          countryCode: '+44',
          primaryGenre: '',
          secondaryGenre: '',
          yearsActive: '',
          recordLabel: '',
          publisher: '',
          bio: '',
          shortBio: '',
          website: '',
          instagram: '',
          facebook: '',
          twitter: '',
          youtube: '',
          tiktok: '',
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
        artistName: profile.artist_name || '',
        dateOfBirth: profile.date_of_birth,
        nationality: profile.nationality || '',
        country: profile.country || '',
        city: profile.city || '',
        artistType: profile.artist_type || '',
        phone: profile.phone || '',
        countryCode: profile.country_code || '+44',
        primaryGenre: profile.primary_genre || '',
        secondaryGenre: profile.secondary_genre || '',
        yearsActive: profile.years_active || '',
        recordLabel: profile.record_label || '',
        publisher: profile.publisher || '',
        bio: profile.bio || '',
        shortBio: profile.short_bio || '',
        website: profile.website || '',
        instagram: profile.instagram || '',
        facebook: profile.facebook || '',
        twitter: profile.twitter || '',
        youtube: profile.youtube || '',
        tiktok: profile.tiktok || '',
        isBasicInfoSet: profile.is_basic_info_set || false,
        profileCompleted: profile.profile_completed || false,
        lockedFields: profile.locked_fields || {},
        profileLockStatus: profile.profile_lock_status || 'unlocked',
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      });
    }

    if (req.method === 'PUT') {
      const { data: result, error } = await supabase.rpc('update_user_profile', {
        p_email: artistEmail,
        p_profile_data: req.body
      });

      if (error) {
        console.error('Error updating artist profile:', error);
        return res.status(500).json({ error: 'Failed to update profile: ' + error.message });
      }

      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Artist profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}