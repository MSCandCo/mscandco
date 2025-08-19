import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with error handling
let supabase;
try {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables');
  }
  
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
} catch (error) {
  console.error('Error initializing Supabase:', error);
}

export default async function handler(req, res) {
  try {
    // Production Supabase integration
    if (!supabase) {
      console.error('Supabase not properly configured');
      return res.status(500).json({ error: 'Database not available' });
    }

    // Get user from session
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header, using fallback for development');
      // Fallback to mock for development when no auth
      return handleMockProfile(req, res);
    }

    const token = authHeader.replace('Bearer ', '');
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data: { user }, error: userError } = await userSupabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (req.method === 'GET') {
      // Get artist profile - query all available fields using user's authenticated session
      console.log('Querying profile for user ID:', user.id);
      const { data: profile, error } = await userSupabase
        .from('user_profiles')
        .select(`
          id, email, first_name, last_name,
          nationality, country, city, address, postal_code, date_of_birth,
          artist_name, artist_type, phone, country_code,
          primary_genre, secondary_genre, vocal_type, years_active,
          record_label, publisher, website, bio,
          instagram, facebook, twitter, youtube, tiktok, threads, soundcloud, apple_music,
          basic_profile_locked, isrc_prefix, short_bio, secondary_genres, instruments,
          is_basic_info_set, profile_completed, registration_date,
          locked_fields, profile_lock_status,
          created_at, updated_at
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('No profile found, returning default structure:', error.message);
        // If no profile exists, return default structure
        const defaultProfile = {
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
          artistType: '',
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
          isBasicInfoSet: false,
          profileCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return res.status(200).json(defaultProfile);
      }

      // Map database fields to frontend format (only use existing fields)
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
        artistType: profile.artist_type || '',
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
        isBasicInfoSet: profile.is_basic_info_set || false,
        lockedFields: profile.locked_fields || {},
        profileLockStatus: profile.profile_lock_status || 'unlocked',
        profileCompleted: profile.profile_completed || false,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        registrationDate: profile.registration_date
      };

      return res.status(200).json(mappedProfile);
    }

    if (req.method === 'PUT') {
      // Update artist profile
      const profileData = req.body;
      
      // Validate required fields for basic info
      if (profileData.isBasicInfoSet) {
        const requiredFields = ['firstName', 'lastName', 'nationality', 'country', 'city'];
        const missingFields = requiredFields.filter(field => !profileData[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({
            error: `Missing required fields: ${missingFields.join(', ')}`
          });
        }
      }

      // Map frontend fields to database fields
      const updateData = {
        id: user.id,
        email: user.email,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        nationality: profileData.nationality,
        country: profileData.country,
        city: profileData.city,
        address: profileData.address,
        postal_code: profileData.postalCode,
        date_of_birth: profileData.dateOfBirth,
        artist_name: profileData.artistName,
        artist_type: profileData.artistType || 'Solo Artist',
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
        is_basic_info_set: profileData.isBasicInfoSet,
        profile_completed: profileData.profileCompleted,
        updated_at: new Date().toISOString()
      };

      // Check if this is the first time setting basic info (lock it after first save)
      if (profileData.firstName && profileData.lastName && profileData.nationality && profileData.country && profileData.city) {
        updateData.is_basic_info_set = true;
      }

      // Update profile in database using user's authenticated session
      const { data: updatedProfile, error } = await userSupabase
        .from('user_profiles')
        .upsert(updateData)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Failed to update profile: ' + error.message });
      }

      // Map back to frontend format (preserve all frontend fields, update what we saved)
      const mappedProfile = {
        ...profileData, // Keep all the frontend data
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
        artistType: updatedProfile.artist_type || '',
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
        isBasicInfoSet: updatedProfile.is_basic_info_set || false,
        lockedFields: updatedProfile.locked_fields || {},
        profileLockStatus: updatedProfile.profile_lock_status || 'unlocked',
        profileCompleted: updatedProfile.profile_completed || false,
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
    console.error('Error in profile API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Persistent storage for development
const fs = require('fs');
const path = require('path');

const PROFILE_STORAGE_PATH = path.join(process.cwd(), 'data', 'profiles.json');

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load profiles from file
function loadProfiles() {
  try {
    ensureDataDirectory();
    if (fs.existsSync(PROFILE_STORAGE_PATH)) {
      const data = fs.readFileSync(PROFILE_STORAGE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading profiles:', error);
  }
  return {};
}

// Save profiles to file
function saveProfiles(profiles) {
  try {
    ensureDataDirectory();
    fs.writeFileSync(PROFILE_STORAGE_PATH, JSON.stringify(profiles, null, 2));
    console.log('Profiles saved to file successfully');
  } catch (error) {
    console.error('Error saving profiles:', error);
  }
}

// Get user ID from email (for development)
function getUserId(email) {
  return email ? email.replace('@', '_at_').replace('.', '_dot_') : 'default_user';
}

// Mock profile handler with persistent storage
function handleMockProfile(req, res) {
  const profiles = loadProfiles();
  const userEmail = 'info@htay.co.uk'; // Default for development
  const userId = '8a060dc5-1c94-4060-a1c3-a60224fc348d'; // Your actual UUID from database

  const defaultProfile = {
    id: userId,
    email: userEmail,
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    country: '',
    city: '',
    address: '',
    postalCode: '',
    artistName: '',
    artistType: '',
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
    isBasicInfoSet: true,
    profileCompleted: false,
    lockedFields: {"firstName": true, "lastName": true, "dateOfBirth": true, "nationality": true, "country": true, "city": true},
    profileLockStatus: "locked",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (req.method === 'GET') {
    // Return existing profile or default
    const existingProfile = profiles[userId] || defaultProfile;
    console.log('Loading profile for user:', userId, existingProfile);
    return res.status(200).json(existingProfile);
  }

  if (req.method === 'PUT') {
    // Update and save profile
    const updatedProfile = {
      ...(profiles[userId] || defaultProfile),
      ...req.body,
      id: userId,
      email: userEmail,
      updatedAt: new Date().toISOString()
    };

    // Save to file
    profiles[userId] = updatedProfile;
    saveProfiles(profiles);

    console.log('Profile updated and saved permanently:', updatedProfile);

    return res.status(200).json({
      success: true,
      message: 'Profile updated and saved permanently',
      profile: updatedProfile
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
