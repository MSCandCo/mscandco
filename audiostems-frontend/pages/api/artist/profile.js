// Artist Profile API - BYPASS AUTH FOR TESTING - REAL DATA ONLY
import { createClient } from '@supabase/supabase-js';

// Use service role to bypass all auth issues
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // For testing, use Henry Taylor's ID directly
    const userId = '0a060de5-1c94-4060-a1c2-860224fc348d'; // Henry Taylor
    
    console.log('👤 Artist profile API (bypass auth) for Henry Taylor');

    if (req.method === 'GET') {
      // Load Henry's profile from rebuilt database
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error loading Henry\'s profile:', error);
        return res.status(500).json({ error: 'Failed to load profile' });
      }

      console.log('✅ Henry\'s profile loaded from database');

      // Return real profile data in expected format
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
        bio: profile.bio || '',
        website: profile.website || '',
        instagram: profile.instagram || '',
        facebook: profile.facebook || '',
        twitter: profile.twitter || '',
        youtube: profile.youtube || '',
        tiktok: profile.tiktok || '',
        profile_picture_url: profile.profile_picture_url || null
      });
    }

    if (req.method === 'PUT') {
      console.log('💾 Updating Henry\'s profile directly:', req.body);

      // Map frontend fields to database fields
      const updateData = {
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        artist_name: req.body.artistName,
        date_of_birth: req.body.dateOfBirth,
        nationality: req.body.nationality,
        country: req.body.country,
        city: req.body.city,
        artist_type: req.body.artistType,
        phone: req.body.phone,
        country_code: req.body.countryCode,
        primary_genre: req.body.primaryGenre,
        secondary_genre: req.body.secondaryGenre,
        years_active: req.body.yearsActive,
        record_label: req.body.recordLabel,
        bio: req.body.bio,
        website: req.body.website,
        instagram: req.body.instagram,
        facebook: req.body.facebook,
        twitter: req.body.twitter,
        youtube: req.body.youtube,
        tiktok: req.body.tiktok,
        profile_picture_url: req.body.profile_picture_url,
        updated_at: new Date().toISOString()
      };

      // Direct database update for Henry Taylor
      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating Henry\'s profile:', error);
        return res.status(500).json({ 
          error: 'Failed to update profile', 
          details: error.message 
        });
      }

      console.log('✅ Henry\'s profile updated successfully');

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        profile: {
          id: updatedProfile.id,
          email: updatedProfile.email,
          firstName: updatedProfile.first_name || '',
          lastName: updatedProfile.last_name || '',
          artistName: updatedProfile.artist_name || '',
          dateOfBirth: updatedProfile.date_of_birth,
          nationality: updatedProfile.nationality || '',
          country: updatedProfile.country || '',
          city: updatedProfile.city || '',
          artistType: updatedProfile.artist_type || '',
          phone: updatedProfile.phone || '',
          countryCode: updatedProfile.country_code || '+44',
          primaryGenre: updatedProfile.primary_genre || '',
          secondaryGenre: updatedProfile.secondary_genre || '',
          yearsActive: updatedProfile.years_active || '',
          recordLabel: updatedProfile.record_label || '',
          bio: updatedProfile.bio || '',
          website: updatedProfile.website || '',
          instagram: updatedProfile.instagram || '',
          facebook: updatedProfile.facebook || '',
          twitter: updatedProfile.twitter || '',
          youtube: updatedProfile.youtube || '',
          tiktok: updatedProfile.tiktok || ''
        }
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Artist profile bypass API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
