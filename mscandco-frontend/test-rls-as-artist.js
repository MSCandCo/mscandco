require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testRLSAsArtist() {
  console.log('🔍 Testing RLS as artist user...\n');

  // Get artist auth token (you'll need to log in first to get this)
  // For now, let's simulate what the API does
  
  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 1. Get artist user
  const { data: users } = await serviceSupabase.auth.admin.listUsers();
  const artistUser = users.users.find(u => u.email === 'info@htay.co.uk');
  
  if (!artistUser) {
    console.error('❌ Artist user not found');
    return;
  }

  console.log('✅ Artist user found:', artistUser.id);

  // 2. Try to query as the user would (with anon key, no service role)
  const anonSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('\n📋 Testing query with ANON key (simulating RLS)...');
  const { data: releases, error } = await anonSupabase
    .from('releases')
    .select('*')
    .eq('artist_id', artistUser.id);

  if (error) {
    console.error('❌ RLS Error:', error);
    console.log('\n⚠️  This means RLS policies are blocking the query!');
    console.log('The policies might not be set up correctly.\n');
  } else {
    console.log(`✅ RLS Working! Found ${releases.length} releases`);
    releases.forEach((r, i) => {
      console.log(`${i + 1}. ${r.title} (${r.status})`);
    });
  }

  console.log('\n📋 Checking if RLS is enabled...');
  const { data: tableInfo } = await serviceSupabase
    .from('pg_tables')
    .select('*')
    .eq('tablename', 'releases')
    .single();

  console.log('Table info:', tableInfo);

  console.log('\n✅ Test complete\n');
}

testRLSAsArtist();

