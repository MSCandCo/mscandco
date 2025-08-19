import { createClient } from '@supabase/supabase-js';

// Service role client for all operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // Get user from session or use fallback for development
    const authHeader = req.headers.authorization;
    let user;
    
    if (authHeader) {
      // Production: Use auth header
      const userSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        { global: { headers: { Authorization: authHeader } } }
      );
      
      const { data: { user: authUser }, error } = await userSupabase.auth.getUser();
      if (error || !authUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      user = authUser;
    } else {
      // Development: Determine user type from query parameter or default to artist
      const userType = req.query.type || 'artist';
      
      if (userType === 'labeladmin') {
        // Get label admin user from database
        const { data: dbUser, error: dbError } = await supabase.auth.admin.getUserByEmail('labeladmin@mscandco.com');
        if (dbError || !dbUser.user) {
          return res.status(404).json({ error: 'Label admin user not found' });
        }
        user = dbUser.user;
      } else {
        // Default to existing artist user for development
        user = { id: '8a060dc5-1c94-4060-a1c3-a60224fc348d', email: 'info@htay.co.uk' };
      }
    }

    if (req.method === 'GET') {
      // Get user profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }

      if (!profile) {
        // Return default profile structure
        return res.status(200).json({
          id: user.id,
          email: user.email,
          firstName: '',
          lastName: '',
          artistName: '',
          labelName: '',
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Map database fields to frontend format
      const mappedProfile = {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        artistName: profile.artist_name || '',
        labelName: profile.artist_name || '', // Same field for label name
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
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        registrationDate: profile.registration_date
      };

      return res.status(200).json(mappedProfile);
    }

    if (req.method === 'PUT') {
      // Update profile using the universal function
      const { data: result, error } = await supabase.rpc('update_user_profile', {
        p_user_id: user.id,
        p_profile_data: req.body
      });

      if (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Failed to update profile: ' + error.message });
      }

      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Universal profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
