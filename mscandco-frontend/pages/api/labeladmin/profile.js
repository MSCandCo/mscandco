import { createClient } from '@supabase/supabase-js';
import { requirePermission } from '@/lib/rbac/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handler(req, res) {
  // req.user and req.userRole are automatically attached by middleware

  const user = req.user;

  if (req.method === 'GET') {
    // Fetch label admin profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    
    // Map snake_case to camelCase for client
    const mappedProfile = {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      labelName: profile.artist_name, // Label admins use artist_name field for label name
      dateOfBirth: profile.date_of_birth,
      nationality: profile.nationality,
      country: profile.country,
      city: profile.city,
      phone: profile.phone,
      countryCode: profile.country_code,
      primaryGenre: profile.primary_genre,
      secondaryGenre: profile.secondary_genre,
      yearsActive: profile.years_active,
      companyName: profile.record_label, // Using record_label field for company name
      bio: profile.bio,
      website: profile.website,
      instagram: profile.instagram,
      facebook: profile.facebook,
      twitter: profile.twitter,
      youtube: profile.youtube,
      tiktok: profile.tiktok,
      spotify: profile.spotify,
      apple_music: profile.apple_music,
      profile_picture_url: profile.profile_picture_url
    };
    
    return res.status(200).json(mappedProfile);
  }

  if (req.method === 'PUT') {
    // Update label admin profile
    const updates = req.body;
    
    console.log('👤 Label Admin profile API - Updating profile for:', user.email);
    console.log('📋 Updates received:', updates);
    
    // Map camelCase to snake_case for database
    const dbUpdates = {
      artist_name: updates.labelName,
      primary_genre: updates.primaryGenre,
      secondary_genre: updates.secondaryGenre,
      years_active: updates.yearsActive,
      record_label: updates.companyName,
      bio: updates.bio,
      website: updates.website,
      instagram: updates.instagram,
      facebook: updates.facebook,
      twitter: updates.twitter,
      youtube: updates.youtube,
      tiktok: updates.tiktok,
      spotify: updates.spotify,
      apple_music: updates.apple_music
    };
    
    // Remove undefined values
    Object.keys(dbUpdates).forEach(key => {
      if (dbUpdates[key] === undefined) {
        delete dbUpdates[key];
      }
    });
    
    console.log('📝 Final updates after mapping:', dbUpdates);

    const { data, error } = await supabase
      .from('user_profiles')
      .update(dbUpdates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Database update error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Profile updated successfully in database');

    // SINGLE SOURCE OF TRUTH: Mark all label's releases for cache refresh
    try {
      await supabase
        .from('releases')
        .update({ cache_updated_at: null })
        .eq('label_admin_id', user.id);
      console.log('🔄 Label Admin releases marked for cache refresh');
    } catch (cacheError) {
      console.error('Cache refresh error:', cacheError);
    }
    
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Protect with profile:view:own or profile:edit:own (GET uses view, PUT uses edit)
export default requirePermission(['profile:view:own', 'profile:edit:own'])(handler);