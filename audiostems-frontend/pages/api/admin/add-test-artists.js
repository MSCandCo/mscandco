// API endpoint to add test artists with proper names
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🎤 Adding test artists with proper names...');

    const testArtists = [
      {
        email: 'moses.bliss@example.com',
        password: 'TempPass123!',
        first_name: 'Moses',
        last_name: 'Bliss',
        artist_name: 'Moses Bliss',
        role: 'artist'
      },
      {
        email: 'charles.dada@example.com', 
        password: 'TempPass123!',
        first_name: 'Charles',
        last_name: 'Dada',
        artist_name: 'Charles Dada',
        role: 'artist'
      },
      {
        email: 'sarah.johnson@example.com',
        password: 'TempPass123!',
        first_name: 'Sarah',
        last_name: 'Johnson',
        artist_name: 'Sarah Johnson',
        role: 'artist'
      },
      {
        email: 'david.williams@example.com',
        password: 'TempPass123!',
        first_name: 'David',
        last_name: 'Williams',
        artist_name: 'David Williams',
        role: 'artist'
      }
    ];

    // First, check if artists already exist in auth
    const authUsersResult = await supabase.auth.admin.listUsers();
    const existingAuthUsers = authUsersResult.data?.users || [];
    const existingEmails = existingAuthUsers.map(u => u.email);
    const newArtists = testArtists.filter(a => !existingEmails.includes(a.email));

    if (newArtists.length === 0) {
      console.log('✅ All test artists already exist');
      
      // Show existing artists from profiles
      const { data: allArtists } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, artist_name')
        .order('first_name');
        
      return res.status(200).json({ 
        message: 'All test artists already exist',
        artists: allArtists,
        added: 0,
        total: allArtists?.length || 0
      });
    }

    // Create new artists (auth user + profile)
    const createdArtists = [];
    
    for (const artist of newArtists) {
      try {
        // Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: artist.email,
          password: artist.password,
          user_metadata: { role: artist.role },
          email_confirm: true
        });

        if (authError) {
          console.error(`Failed to create auth user for ${artist.email}:`, authError);
          continue;
        }

        // Create user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authUser.user.id,
            email: artist.email,
            first_name: artist.first_name,
            last_name: artist.last_name,
            artist_name: artist.artist_name,
            profile_completed: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (profileError) {
          console.error(`Failed to create profile for ${artist.email}:`, profileError);
          // Clean up auth user if profile creation fails
          await supabase.auth.admin.deleteUser(authUser.user.id);
          continue;
        }

        createdArtists.push({
          id: authUser.user.id,
          email: artist.email,
          first_name: artist.first_name,
          last_name: artist.last_name,
          artist_name: artist.artist_name
        });
        
      } catch (error) {
        console.error(`Error creating artist ${artist.email}:`, error);
      }
    }

    console.log(`✅ Added ${createdArtists.length} new test artists`);

    // Show all artists now
    const { data: allArtists } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, artist_name')
      .order('first_name');
      
    return res.status(200).json({
      message: `Successfully added ${createdArtists.length} test artists`,
      added: createdArtists.length,
      artists: allArtists,
      total: allArtists?.length || 0
    });

  } catch (error) {
    console.error('Error adding test artists:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
