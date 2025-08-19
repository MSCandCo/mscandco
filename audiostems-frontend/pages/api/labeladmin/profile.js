import { createClient } from '@supabase/supabase-js';

// Initialize Supabase clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    // Get user from session
    const authHeader = req.headers.authorization;
    
    let userSupabase;
    let user;
    
    if (authHeader) {
      // Create user-authenticated client
      userSupabase = createClient(
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
      // Fallback for development
      user = { id: 'c47cc6e8-8e4a-4b8a-9f1e-2c7d89e0f3a', email: 'labeladmin@mscandco.com' };
      userSupabase = supabase;
    }

    // Role check temporarily disabled for development
    // const { data: userRole } = await userSupabase
    //   .from('user_role_assignments')
    //   .select('role_name')
    //   .eq('user_id', user.id)
    //   .single();

    // if (!userRole || userRole.role_name !== 'label_admin') {
    //   return res.status(403).json({ error: 'Label admin access required' });
    // }

    if (req.method === 'GET') {
      // Get label admin profile
      const { data: profile, error } = await userSupabase
        .from('user_profiles')
        .select(`
          id, email, first_name, last_name,
          artist_name, phone, country_code,
          website, instagram, facebook, twitter, youtube, tiktok,
          bio, short_bio, is_basic_info_set, profile_completed,
          created_at, updated_at, registration_date
        `)
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Database error:', error);
        // Continue with default profile instead of failing
      }

      if (!profile) {
        // Create default profile for label admin and return it
        console.log('No profile found, creating default for label admin');
        return res.status(200).json({
          id: user.id,
          email: user.email,
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
        labelName: profile.artist_name || '', // Using artist_name field for label name
        companyName: profile.artist_name || '', // Can be same as label name
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
      const profileData = req.body;

      // Build update data for label admin
      const updateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        artist_name: profileData.labelName, // Store label name in artist_name field
        phone: profileData.phone,
        country_code: profileData.countryCode,
        country: profileData.country,
        website: profileData.website,
        instagram: profileData.instagram,
        facebook: profileData.facebook,
        twitter: profileData.twitter,
        youtube: profileData.youtube,
        tiktok: profileData.tiktok,
        bio: profileData.bio,
        short_bio: profileData.shortBio,
        is_basic_info_set: profileData.isBasicInfoSet,
        profile_completed: profileData.profileCompleted,
        updated_at: new Date().toISOString()
      };

      // Update profile using raw SQL to avoid UUID issues
      const { data: updatedProfile, error } = await userSupabase.rpc('update_label_admin_profile', {
        p_user_id: user.id,
        p_first_name: profileData.firstName,
        p_last_name: profileData.lastName,
        p_artist_name: profileData.labelName,
        p_phone: profileData.phone,
        p_country_code: profileData.countryCode,
        p_country: profileData.country,
        p_website: profileData.website,
        p_instagram: profileData.instagram,
        p_facebook: profileData.facebook,
        p_twitter: profileData.twitter,
        p_youtube: profileData.youtube,
        p_tiktok: profileData.tiktok,
        p_bio: profileData.bio,
        p_short_bio: profileData.shortBio,
        p_is_basic_info_set: profileData.isBasicInfoSet,
        p_profile_completed: profileData.profileCompleted
      });

      if (error) {
        console.error('Error updating label admin profile:', error);
        return res.status(500).json({ error: 'Failed to update profile: ' + error.message });
      }

      // Return updated profile
      const mappedProfile = {
        id: updatedProfile.id,
        email: updatedProfile.email,
        firstName: updatedProfile.first_name || '',
        lastName: updatedProfile.last_name || '',
        labelName: updatedProfile.artist_name || '',
        companyName: updatedProfile.artist_name || '',
        phone: updatedProfile.phone || '',
        countryCode: updatedProfile.country_code || '+44',
        country: updatedProfile.country || '',
        website: updatedProfile.website || '',
        instagram: updatedProfile.instagram || '',
        facebook: updatedProfile.facebook || '',
        twitter: updatedProfile.twitter || '',
        youtube: updatedProfile.youtube || '',
        tiktok: updatedProfile.tiktok || '',
        bio: updatedProfile.bio || '',
        shortBio: updatedProfile.short_bio || '',
        isBasicInfoSet: updatedProfile.is_basic_info_set || false,
        profileCompleted: updatedProfile.profile_completed || false,
        createdAt: updatedProfile.created_at,
        updatedAt: updatedProfile.updated_at,
        registrationDate: updatedProfile.registration_date
      };

      return res.status(200).json({
        success: true,
        message: 'Label admin profile updated successfully',
        profile: mappedProfile
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Label admin profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

