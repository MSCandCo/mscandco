require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyReleasesSetup() {
  console.log('🔍 Verifying releases table setup...\n');

  // 1. Get artist user
  const { data: artistProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, email, role')
    .eq('email', 'info@htay.co.uk')
    .single();

  if (profileError || !artistProfile) {
    console.error('❌ Could not find artist profile:', profileError);
    return;
  }

  console.log('✅ Artist Profile:', {
    id: artistProfile.id,
    email: artistProfile.email,
    role: artistProfile.role
  });

  // 2. Check releases table structure
  console.log('\n📋 Checking releases table...');
  const { data: releases, error: releasesError } = await supabase
    .from('releases')
    .select('id, title, artist_id, status, created_at')
    .limit(5);

  if (releasesError) {
    console.error('❌ Error querying releases:', releasesError);
  } else {
    console.log(`✅ Found ${releases.length} releases in total`);
    if (releases.length > 0) {
      console.log('\nSample release structure:');
      console.log(releases[0]);
    }
  }

  // 3. Check releases for this artist
  console.log('\n📋 Checking releases for artist:', artistProfile.id);
  const { data: artistReleases, error: artistReleasesError } = await supabase
    .from('releases')
    .select('id, title, artist_id, status, created_at')
    .eq('artist_id', artistProfile.id);

  if (artistReleasesError) {
    console.error('❌ Error querying artist releases:', artistReleasesError);
  } else {
    console.log(`✅ Found ${artistReleases.length} releases for this artist`);
    if (artistReleases.length > 0) {
      console.log('\nArtist releases:');
      artistReleases.forEach((release, index) => {
        console.log(`${index + 1}. ${release.title} (${release.status}) - ${release.created_at}`);
      });
    } else {
      console.log('⚠️  No releases found for this artist!');
      console.log('\nLet me check if there are releases with different artist_id values...');
      
      const { data: allReleases } = await supabase
        .from('releases')
        .select('id, title, artist_id, status')
        .limit(10);
      
      if (allReleases && allReleases.length > 0) {
        console.log('\nAll releases in database:');
        allReleases.forEach((release, index) => {
          console.log(`${index + 1}. ${release.title} - artist_id: ${release.artist_id}`);
        });
        console.log(`\nExpected artist_id: ${artistProfile.id}`);
      }
    }
  }

  // 4. Check RLS policies
  console.log('\n📋 Checking RLS policies on releases table...');
  const { data: policies, error: policiesError } = await supabase
    .rpc('exec_sql', { 
      sql: `
        SELECT policyname, cmd, qual, with_check
        FROM pg_policies
        WHERE tablename = 'releases'
        ORDER BY policyname;
      ` 
    })
    .catch(() => {
      // Fallback: just check if RLS is enabled
      return { data: null, error: 'Cannot query policies directly' };
    });

  if (policies) {
    console.log('✅ RLS Policies:', policies);
  } else {
    console.log('⚠️  Could not query RLS policies (this is normal, requires special permissions)');
  }

  console.log('\n✅ Verification complete\n');
}

verifyReleasesSetup();

