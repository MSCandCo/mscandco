import { createClient } from '@supabase/supabase-js';

// Service role client for all operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// User mapping for development - maps user types to actual users
const USER_MAPPING = {
  artist: { email: 'info@htay.co.uk' },
  labeladmin: { email: 'labeladmin@mscandco.com' },
  distributionpartner: { email: 'codegroup@mscandco.com' },
  companyadmin: { email: 'companyadmin@mscandco.com' },
  superadmin: { email: 'superadmin@mscandco.com' }
};

export default async function handler(req, res) {
  try {
    // Determine user type and get user
    const userType = req.query.type || req.headers['x-user-type'] || 'artist';
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
      // Development: Get user by type
      const mapping = USER_MAPPING[userType];
      if (!mapping) {
        return res.status(400).json({ error: `Invalid user type: ${userType}` });
      }

      // Get user from database by email
      const { data: dbUser, error: dbError } = await supabase.auth.admin.getUserByEmail(mapping.email);
      if (dbError || !dbUser.user) {
        return res.status(404).json({ error: `${userType} user not found: ${mapping.email}` });
      }
      user = dbUser.user;
    }

    if (req.method === 'GET') {
      // Get profile for any user type
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to fetch profile' });
      }

      // Get user role for locked fields
      const { data: roleData } = await supabase
        .from('user_role_assignments')
        .select('role_name')
        .eq('user_id', user.id)
        .single();

      const userRole = roleData?.role_name || 'artist';

      if (!profile) {
        // Return default profile structure based on role
        const defaultProfile = getDefaultProfileForRole(user, userRole);
        return res.status(200).json(defaultProfile);
      }

      // Map database fields to universal format
      const mappedProfile = mapProfileFromDatabase(profile, userRole);
      return res.status(200).json(mappedProfile);
    }

    if (req.method === 'PUT') {
      // Universal profile update using email (more reliable)
      const { data: result, error } = await supabase.rpc('update_user_profile', {
        p_email: user.email,
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

// Get default profile structure based on role
function getDefaultProfileForRole(user, role) {
  const baseProfile = {
    id: user.id,
    email: user.email,
    firstName: '',
    lastName: '',
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
  };

  // Role-specific fields
  switch (role) {
    case 'artist':
      return {
        ...baseProfile,
        artistName: '',
        dateOfBirth: null,
        nationality: '',
        city: '',
        artistType: '',
        primaryGenre: '',
        secondaryGenre: '',
        yearsActive: '',
        recordLabel: '',
        publisher: '',
        lockedFields: {},
        profileLockStatus: 'unlocked'
      };
    
    case 'label_admin':
      return {
        ...baseProfile,
        labelName: '',
        companyName: '',
        lockedFields: {
          firstName: false,
          lastName: false,
          labelName: false,
          companyName: false,
          phone: false,
          country: false
        },
        profileLockStatus: 'unlocked'
      };
    
    case 'distribution_partner':
      return {
        ...baseProfile,
        companyName: '',
        businessType: 'distribution'
      };
    
    case 'company_admin':
    case 'super_admin':
      return {
        ...baseProfile,
        companyName: '',
        adminLevel: role,
        department: ''
      };
    
    default:
      return baseProfile;
  }
}

// Map database profile to universal format
function mapProfileFromDatabase(profile, role) {
  const baseMapping = {
    id: profile.id,
    email: profile.email,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
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

  // Add role-specific fields
  switch (role) {
    case 'artist':
      return {
        ...baseMapping,
        artistName: profile.artist_name || '',
        dateOfBirth: profile.date_of_birth,
        nationality: profile.nationality || '',
        city: profile.city || '',
        artistType: profile.artist_type || '',
        primaryGenre: profile.primary_genre || '',
        secondaryGenre: profile.secondary_genre || '',
        yearsActive: profile.years_active || '',
        recordLabel: profile.record_label || '',
        publisher: profile.publisher || '',
        lockedFields: profile.locked_fields || {},
        profileLockStatus: profile.profile_lock_status || 'unlocked'
      };
    
    case 'label_admin':
      return {
        ...baseMapping,
        labelName: profile.artist_name || '',
        companyName: profile.artist_name || '',
        lockedFields: profile.locked_fields || {
          firstName: false,
          lastName: false,
          labelName: false,
          companyName: false,
          phone: false,
          country: false
        },
        profileLockStatus: profile.profile_lock_status || 'unlocked'
      };
    
    case 'distribution_partner':
      return {
        ...baseMapping,
        companyName: profile.artist_name || '',
        businessType: 'distribution'
      };
    
    case 'company_admin':
    case 'super_admin':
      return {
        ...baseMapping,
        companyName: profile.artist_name || '',
        adminLevel: role,
        department: profile.department || ''
      };
    
    default:
      return baseMapping;
  }
}
