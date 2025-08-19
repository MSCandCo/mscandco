import { createClient } from '@supabase/supabase-js';

// Service role client for distribution partner operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // Get user from session or use fallback
    const authHeader = req.headers.authorization;
    let user;
    
    if (authHeader) {
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
      // Development fallback - get distribution partner user from database
      const { data: dbUser, error: dbError } = await supabase.auth.admin.getUserByEmail('codegroup@mscandco.com');
      if (dbError || !dbUser.user) {
        return res.status(404).json({ error: 'Distribution partner user not found' });
      }
      user = dbUser.user;
    }

    if (req.method === 'GET') {
      // Get distribution partner profile
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
        return res.status(200).json({
          id: user.id,
          email: user.email,
          firstName: '',
          lastName: '',
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Map for distribution partner format
      const mappedProfile = {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        companyName: profile.artist_name || '', // Use artist_name field for company name
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
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        registrationDate: profile.registration_date
      };

      return res.status(200).json(mappedProfile);
    }

    if (req.method === 'PUT') {
      // Update distribution partner profile
      const profileData = req.body;
      
      // Map distribution partner fields
      const mappedData = {
        ...profileData,
        artistName: profileData.companyName, // Map company name to artist_name field
        labelName: profileData.companyName
      };

      const { data: result, error } = await supabase.rpc('update_user_profile', {
        p_user_id: user.id,
        p_profile_data: mappedData
      });

      if (error) {
        console.error('Error updating distribution partner profile:', error);
        return res.status(500).json({ error: 'Failed to update profile: ' + error.message });
      }

      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Distribution partner profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
