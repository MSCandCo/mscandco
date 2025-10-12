// Artist Profile API - COMPLETE REBUILD - REAL DATA ONLY
import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS issues
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // Get user from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authorization token' });
    }

    console.log('👤 Artist profile API called by:', user.email);

    if (req.method === 'GET') {
      // Load artist profile from rebuilt database
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error loading profile:', error);
        return res.status(500).json({ error: 'Failed to load profile' });
      }

      if (!profile) {
        // Return empty profile structure
        return res.status(200).json({
          id: user.id,
          email: user.email,
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
          bio: '',
          website: '',
          instagram: '',
          facebook: '',
          twitter: '',
          youtube: '',
          tiktok: ''
        });
      }

      // Return real profile data
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
        tiktok: profile.tiktok || ''
      });
    }

    if (req.method === 'PUT') {
      // Update profile directly - NO RPC FUNCTIONS
      console.log('💾 Updating artist profile with real data:', req.body);

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
        updated_at: new Date().toISOString()
      };

      // Direct database update
      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating profile:', error);
        return res.status(500).json({ 
          error: 'Failed to update profile', 
          details: error.message 
        });
      }

      console.log('✅ Profile updated successfully');

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
    console.error('❌ Artist profile API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
