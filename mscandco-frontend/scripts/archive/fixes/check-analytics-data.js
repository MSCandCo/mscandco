// Diagnostic script to check analytics data in database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAnalyticsData() {
  console.log('\n🔍 Checking Analytics Data in Database\n');
  console.log('='.repeat(60));

  // Get Henry's profile
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('id, email, first_name, last_name, artist_name, analytics_data')
    .eq('email', 'info@htay.co.uk')
    .single();

  if (error) {
    console.error('❌ Error fetching profile:', error);
    return;
  }

  console.log('\n📋 User Profile:');
  console.log(`  ID: ${profile.id}`);
  console.log(`  Email: ${profile.email}`);
  console.log(`  Name: ${profile.first_name} ${profile.last_name}`);
  console.log(`  Artist Name: ${profile.artist_name || 'Not set'}`);
  
  console.log('\n📊 Analytics Data:');
  if (!profile.analytics_data) {
    console.log('  ❌ NO ANALYTICS DATA FOUND');
    return;
  }

  const data = profile.analytics_data;
  console.log(`  Type: ${data.type || 'Not set'}`);
  console.log(`  Last Updated: ${data.lastUpdated || 'Not set'}`);
  console.log(`  Updated By: ${data.updatedBy || 'Not set'}`);

  console.log('\n🎵 Latest Release:');
  if (data.latestRelease) {
    console.log(`  ✅ Title: ${data.latestRelease.title || 'Not set'}`);
    console.log(`  ✅ Streams: ${data.latestRelease.totalStreams || 'Not set'}`);
    console.log(`  ✅ Change: ${data.latestRelease.changePercentage || 'Not set'}`);
  } else {
    console.log('  ❌ No latest release data');
  }

  console.log('\n🏆 Milestones:');
  if (data.milestones && data.milestones.length > 0) {
    console.log(`  ✅ Count: ${data.milestones.length}`);
    data.milestones.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.title} - ${m.tag} (${m.date})`);
    });
  } else {
    console.log('  ❌ No milestones');
  }

  console.log('\n👁️ Section Visibility:');
  if (data.sectionVisibility) {
    const sections = data.sectionVisibility;
    console.log(`  Latest Release: ${sections.latestRelease ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    console.log(`  Milestones: ${sections.milestones ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    console.log(`  Top Tracks: ${sections.topTracks ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    console.log(`  Top Markets: ${sections.topMarkets ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    console.log(`  All Releases: ${sections.allReleases ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    console.log(`  Artist Ranking: ${sections.artistRanking ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    console.log(`  Career Snapshot: ${sections.careerSnapshot ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    console.log(`  Audience Summary: ${sections.audienceSummary ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    console.log(`  Platform Performance: ${sections.platformPerformance ? '✅ VISIBLE' : '❌ HIDDEN'}`);
  } else {
    console.log('  ❌ NO VISIBILITY SETTINGS');
  }

  console.log('\n🚀 Advanced Data:');
  if (data.advancedData) {
    const adv = data.advancedData;
    console.log(`  Artist Ranking: ${adv.artistRanking ? '✅ Present' : '❌ Missing'}`);
    console.log(`  Career Snapshot: ${adv.careerSnapshot ? '✅ Present' : '❌ Missing'}`);
    console.log(`  Audience Summary: ${adv.audienceSummary ? '✅ Present' : '❌ Missing'}`);
    console.log(`  Top Markets: ${adv.topMarkets ? '✅ Present' : '❌ Missing'}`);
    console.log(`  Top Statistics: ${adv.topStatistics ? '✅ Present' : '❌ Missing'}`);
    console.log(`  Platform Performance: ${adv.platformPerformance ? '✅ Present' : '❌ Missing'}`);
  } else {
    console.log('  ❌ No advanced data');
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Diagnostic complete!\n');
}

checkAnalyticsData().catch(console.error);

