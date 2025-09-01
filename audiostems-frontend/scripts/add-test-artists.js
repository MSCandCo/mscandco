// Add Test Artists with Proper Names
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function addTestArtists() {
  console.log('🎤 Adding test artists with proper names...');

  const testArtists = [
    {
      email: 'moses.bliss@example.com',
      first_name: 'Moses',
      last_name: 'Bliss',
      role: 'artist',
      subscription_tier: 'artist_pro',
      subscription_status: 'active'
    },
    {
      email: 'charles.dada@example.com', 
      first_name: 'Charles',
      last_name: 'Dada',
      role: 'artist',
      subscription_tier: 'artist_starter',
      subscription_status: 'active'
    },
    {
      email: 'sarah.johnson@example.com',
      first_name: 'Sarah',
      last_name: 'Johnson', 
      role: 'artist',
      subscription_tier: 'artist_pro',
      subscription_status: 'active'
    },
    {
      email: 'david.williams@example.com',
      first_name: 'David',
      last_name: 'Williams',
      role: 'artist', 
      subscription_tier: 'artist_starter',
      subscription_status: 'active'
    }
  ];

  try {
    // First, check if artists already exist
    const { data: existing, error: checkError } = await supabase
      .from('user_profiles')
      .select('email')
      .in('email', testArtists.map(a => a.email));

    if (checkError) {
      console.error('Error checking existing artists:', checkError);
      return;
    }

    const existingEmails = existing?.map(a => a.email) || [];
    const newArtists = testArtists.filter(a => !existingEmails.includes(a.email));

    if (newArtists.length === 0) {
      console.log('✅ All test artists already exist');
      
      // Show existing artists
      const { data: allArtists } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, role')
        .eq('role', 'artist')
        .order('first_name');
        
      console.log(`\n📊 Current Artists (${allArtists?.length || 0}):`);
      allArtists?.forEach(artist => {
        console.log(`👤 ${artist.first_name} ${artist.last_name} (${artist.email})`);
      });
      
      return;
    }

    // Add new artists
    const { data: insertedArtists, error: insertError } = await supabase
      .from('user_profiles')
      .insert(newArtists.map(artist => ({
        id: require('crypto').randomUUID(),
        ...artist,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })))
      .select();

    if (insertError) {
      console.error('Error inserting test artists:', insertError);
      return;
    }

    console.log(`✅ Added ${insertedArtists?.length || 0} new test artists:`);
    insertedArtists?.forEach(artist => {
      console.log(`👤 ${artist.first_name} ${artist.last_name} (${artist.email})`);
    });

    // Show all artists now
    const { data: allArtists } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, role')
      .eq('role', 'artist')
      .order('first_name');
      
    console.log(`\n📊 Total Artists Now (${allArtists?.length || 0}):`);
    allArtists?.forEach(artist => {
      console.log(`👤 ${artist.first_name} ${artist.last_name} (${artist.email})`);
    });

  } catch (error) {
    console.error('Error adding test artists:', error);
  }
}

addTestArtists().then(() => process.exit());
