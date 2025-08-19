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
      user = { id: 'info_at_htay_dot_co.uk', email: 'info@htay.co.uk' };
      userSupabase = supabase;
    }

    if (req.method === 'GET') {
      // Get profile with locking information
      const { data: profile, error } = await userSupabase
        .from('user_profiles')
        .select(`
          *,
          locked_fields,
          profile_lock_status
        `)
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to load profile' });
      }

      if (!profile) {
        // Return default profile structure
        return res.status(200).json({
          id: user.id,
          email: user.email,
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          nationality: '',
          country: '',
          city: '',
          address: '',
          postalCode: '',
          artistName: '',
          artistType: 'Solo Artist',
          phone: '',
          countryCode: '+44',
          primaryGenre: '',
          secondaryGenre: '',
          secondaryGenres: [],
          instruments: [],
          vocalType: '',
          yearsActive: '',
          recordLabel: '',
          publisher: '',
          website: '',
          instagram: '',
          facebook: '',
          twitter: '',
          youtube: '',
          tiktok: '',
          threads: '',
          appleMusic: '',
          soundcloud: '',
          isrcPrefix: '',
          bio: '',
          shortBio: '',
          isBasicInfoSet: false,
          profileCompleted: false,
          lockedFields: {},
          profileLockStatus: 'unlocked',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Map database fields to frontend format with locking info
      const mappedProfile = {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        nationality: profile.nationality || '',
        country: profile.country || '',
        city: profile.city || '',
        address: profile.address || '',
        postalCode: profile.postal_code || '',
        dateOfBirth: profile.date_of_birth || '',
        artistName: profile.artist_name || '',
        artistType: profile.artist_type || 'Solo Artist',
        phone: profile.phone || '',
        countryCode: profile.country_code || '+44',
        primaryGenre: profile.primary_genre || '',
        secondaryGenre: profile.secondary_genre || '',
        secondaryGenres: profile.secondary_genres || [],
        instruments: profile.instruments || [],
        vocalType: profile.vocal_type || '',
        yearsActive: profile.years_active || '',
        recordLabel: profile.record_label || '',
        publisher: profile.publisher || '',
        website: profile.website || '',
        instagram: profile.instagram || '',
        facebook: profile.facebook || '',
        twitter: profile.twitter || '',
        youtube: profile.youtube || '',
        tiktok: profile.tiktok || '',
        threads: profile.threads || '',
        appleMusic: profile.apple_music || '',
        soundcloud: profile.soundcloud || '',
        isrcPrefix: profile.isrc_prefix || '',
        bio: profile.bio || '',
        shortBio: profile.short_bio || '',
        
        // Locking system data
        isBasicInfoSet: profile.is_basic_info_set || false,
        profileCompleted: profile.profile_completed || false,
        lockedFields: profile.locked_fields || {},
        profileLockStatus: profile.profile_lock_status || 'unlocked',
        
        // Timestamps
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        registrationDate: profile.registration_date
      };

      return res.status(200).json(mappedProfile);
    }

    if (req.method === 'PUT') {
      const profileData = req.body;

      // Get current profile to check locked fields
      const { data: currentProfile } = await userSupabase
        .from('user_profiles')
        .select('locked_fields, profile_lock_status, is_basic_info_set')
        .eq('id', user.id)
        .single();

      const lockedFields = currentProfile?.locked_fields || {};
      const isLocked = currentProfile?.profile_lock_status === 'locked';

      // Check if user is trying to update locked fields
      const lockedFieldNames = ['firstName', 'lastName', 'dateOfBirth', 'nationality', 'country', 'city'];
      const attemptingToUpdateLockedFields = lockedFieldNames.some(field => {
        return profileData[field] !== undefined && lockedFields[field] === true;
      });

      if (isLocked && attemptingToUpdateLockedFields) {
        return res.status(403).json({ 
          error: 'Cannot update locked fields. Please use the Request Changes feature.',
          lockedFields: Object.keys(lockedFields).filter(field => lockedFields[field])
        });
      }

      // Build update data (only non-locked fields)
      const updateData = {
        // Always allow these fields to be updated
        artist_name: profileData.artistName,
        phone: profileData.phone,
        country_code: profileData.countryCode,
        primary_genre: profileData.primaryGenre,
        secondary_genre: profileData.secondaryGenre,
        secondary_genres: profileData.secondaryGenres || [],
        instruments: profileData.instruments || [],
        vocal_type: profileData.vocalType,
        years_active: profileData.yearsActive,
        record_label: profileData.recordLabel,
        publisher: profileData.publisher,
        website: profileData.website,
        instagram: profileData.instagram,
        facebook: profileData.facebook,
        twitter: profileData.twitter,
        youtube: profileData.youtube,
        tiktok: profileData.tiktok,
        threads: profileData.threads,
        apple_music: profileData.appleMusic,
        soundcloud: profileData.soundcloud,
        isrc_prefix: profileData.isrcPrefix,
        bio: profileData.bio,
        short_bio: profileData.shortBio,
        profile_completed: profileData.profileCompleted,
        updated_at: new Date().toISOString()
      };

      // Only add locked fields if profile is not locked or this is first-time setup
      if (!isLocked || !currentProfile?.is_basic_info_set) {
        updateData.first_name = profileData.firstName;
        updateData.last_name = profileData.lastName;
        updateData.date_of_birth = profileData.dateOfBirth;
        updateData.nationality = profileData.nationality;
        updateData.country = profileData.country;
        updateData.city = profileData.city;
        updateData.address = profileData.address;
        updateData.postal_code = profileData.postalCode;
        
        // Lock the fields after first save
        if (profileData.firstName && profileData.lastName && profileData.nationality && profileData.country && profileData.city) {
          updateData.locked_fields = {
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            nationality: true,
            country: true,
            city: true
          };
          updateData.profile_lock_status = 'locked';
          updateData.is_basic_info_set = true;
        }
      }

      // Update profile in database
      const { data: updatedProfile, error } = await userSupabase
        .from('user_profiles')
        .upsert(updateData)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Failed to update profile: ' + error.message });
      }

      // Return updated profile
      const mappedProfile = {
        id: updatedProfile.id,
        email: updatedProfile.email,
        firstName: updatedProfile.first_name || '',
        lastName: updatedProfile.last_name || '',
        nationality: updatedProfile.nationality || '',
        country: updatedProfile.country || '',
        city: updatedProfile.city || '',
        address: updatedProfile.address || '',
        postalCode: updatedProfile.postal_code || '',
        dateOfBirth: updatedProfile.date_of_birth || '',
        artistName: updatedProfile.artist_name || '',
        artistType: updatedProfile.artist_type || 'Solo Artist',
        phone: updatedProfile.phone || '',
        countryCode: updatedProfile.country_code || '+44',
        primaryGenre: updatedProfile.primary_genre || '',
        secondaryGenre: updatedProfile.secondary_genre || '',
        secondaryGenres: updatedProfile.secondary_genres || [],
        instruments: updatedProfile.instruments || [],
        vocalType: updatedProfile.vocal_type || '',
        yearsActive: updatedProfile.years_active || '',
        recordLabel: updatedProfile.record_label || '',
        publisher: updatedProfile.publisher || '',
        website: updatedProfile.website || '',
        instagram: updatedProfile.instagram || '',
        facebook: updatedProfile.facebook || '',
        twitter: updatedProfile.twitter || '',
        youtube: updatedProfile.youtube || '',
        tiktok: updatedProfile.tiktok || '',
        threads: updatedProfile.threads || '',
        appleMusic: updatedProfile.apple_music || '',
        soundcloud: updatedProfile.soundcloud || '',
        isrcPrefix: updatedProfile.isrc_prefix || '',
        bio: updatedProfile.bio || '',
        shortBio: updatedProfile.short_bio || '',
        
        // Locking system data
        isBasicInfoSet: updatedProfile.is_basic_info_set || false,
        profileCompleted: updatedProfile.profile_completed || false,
        lockedFields: updatedProfile.locked_fields || {},
        profileLockStatus: updatedProfile.profile_lock_status || 'unlocked',
        
        // Timestamps
        createdAt: updatedProfile.created_at,
        updatedAt: updatedProfile.updated_at,
        registrationDate: updatedProfile.registration_date
      };

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        profile: mappedProfile
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
