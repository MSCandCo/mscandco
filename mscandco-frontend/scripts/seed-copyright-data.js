/**
 * Seed copyright management tables with sample data
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seedCopyrightData() {
  console.log('🌱 Seeding Copyright Management Data...\n');

  try {
    // Get existing users and releases to link to
    console.log('📋 Fetching existing users and releases...');

    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, artist_name, email')
      .in('role', ['artist', 'label_admin'])
      .limit(10);

    if (usersError || !users || users.length === 0) {
      console.error('❌ Error: No artists or label admins found in the database');
      console.log('💡 Tip: Create some artist users first before seeding copyright data');
      return;
    }

    console.log(`✅ Found ${users.length} users`);

    const { data: releases, error: releasesError } = await supabase
      .from('releases')
      .select('id, title, artist_name')
      .limit(10);

    if (releasesError) {
      console.log('⚠️  No releases found, continuing without release links...');
    } else {
      console.log(`✅ Found ${releases?.length || 0} releases`);
    }

    console.log('\n' + '='.repeat(60));

    // 1. Seed Copyright Verifications
    console.log('\n1️⃣  Seeding Copyright Verifications...');

    const verifications = users.slice(0, 5).map((user, index) => ({
      user_id: user.id,
      release_id: releases && releases[index] ? releases[index].id : null,
      verification_status: ['pending', 'clear', 'conflict_detected', 'manual_review_required'][index % 4],
      confidence_score: 70 + (index * 5),
      conflict_severity: index % 2 === 0 ? null : ['low', 'medium', 'high', 'critical'][index % 4],
      verification_method: 'automated_api',
      metadata: { source: 'sample_seed' }
    }));

    const { data: insertedVerifications, error: verificationsError } = await supabase
      .from('copyright_verifications')
      .insert(verifications)
      .select();

    if (verificationsError) {
      console.error('❌ Error seeding verifications:', verificationsError.message);
    } else {
      console.log(`✅ Created ${insertedVerifications.length} copyright verifications`);
    }

    // 2. Seed Copyright Clearances
    console.log('\n2️⃣  Seeding Copyright Clearances...');

    const clearances = users.slice(0, 4).map((user, index) => ({
      user_id: user.id,
      release_id: releases && releases[index] ? releases[index].id : null,
      original_work_title: ['Stairway to Heaven', 'Billie Jean', 'Imagine', 'Bohemian Rhapsody'][index],
      original_artist: ['Led Zeppelin', 'Michael Jackson', 'John Lennon', 'Queen'][index],
      clearance_type: ['sample', 'cover', 'interpolation', 'remix'][index],
      license_holder: ['Warner Music', 'Sony Music', 'Universal Music', 'EMI'][index],
      license_holder_contact: `licensing@${['warner', 'sony', 'universal', 'emi'][index]}.com`,
      percentage_used: [15.5, 30.0, 10.0, 25.0][index],
      approval_status: ['pending', 'approved', 'rejected', 'pending'][index],
      metadata: { source: 'sample_seed' }
    }));

    const { data: insertedClearances, error: clearancesError } = await supabase
      .from('copyright_clearances')
      .insert(clearances)
      .select();

    if (clearancesError) {
      console.error('❌ Error seeding clearances:', clearancesError.message);
    } else {
      console.log(`✅ Created ${insertedClearances.length} copyright clearances`);
    }

    // 3. Seed Copyright Registrations
    console.log('\n3️⃣  Seeding Copyright Registrations...');

    const registrations = users.slice(0, 6).map((user, index) => ({
      user_id: user.id,
      release_id: releases && releases[index] ? releases[index].id : null,
      work_title: releases && releases[index] ? releases[index].title : `Sample Work ${index + 1}`,
      work_type: ['musical_composition', 'sound_recording', 'both', 'lyrics'][index % 4],
      registration_number: `CR-${2024}-${String(index + 1).padStart(6, '0')}`,
      registration_date: new Date(2024, 0, 15 + index).toISOString().split('T')[0],
      registration_country: ['US', 'UK', 'CA', 'AU'][index % 4],
      registration_organization: ['US Copyright Office', 'UK IPO', 'CIPO', 'IP Australia'][index % 4],
      copyright_owner: user.artist_name || user.email.split('@')[0],
      status: ['registered', 'pending', 'registered', 'registered'][index % 4],
      metadata: { source: 'sample_seed' }
    }));

    const { data: insertedRegistrations, error: registrationsError } = await supabase
      .from('copyright_registrations')
      .insert(registrations)
      .select();

    if (registrationsError) {
      console.error('❌ Error seeding registrations:', registrationsError.message);
    } else {
      console.log(`✅ Created ${insertedRegistrations.length} copyright registrations`);
    }

    // 4. Seed DMCA Takedowns (linked to registrations)
    if (insertedRegistrations && insertedRegistrations.length > 0) {
      console.log('\n4️⃣  Seeding DMCA Takedowns...');

      const dmcaTakedowns = insertedRegistrations.slice(0, 3).map((reg, index) => ({
        user_id: reg.user_id,
        registration_id: reg.id,
        platform: ['youtube', 'spotify', 'soundcloud'][index],
        infringing_url: `https://${['youtube', 'spotify', 'soundcloud'][index]}.com/fake/infringing/url/${index}`,
        infringement_description: `Unauthorized use of "${reg.work_title}" without permission`,
        status: ['submitted', 'in_progress', 'completed'][index],
        platform_reference_number: `DMCA-${2024}-${String(index + 1).padStart(6, '0')}`,
        metadata: { source: 'sample_seed' }
      }));

      const { data: insertedDmca, error: dmcaError } = await supabase
        .from('dmca_takedowns')
        .insert(dmcaTakedowns)
        .select();

      if (dmcaError) {
        console.error('❌ Error seeding DMCA takedowns:', dmcaError.message);
      } else {
        console.log(`✅ Created ${insertedDmca.length} DMCA takedowns`);
      }
    }

    // 5. Seed Copyright Monitoring (linked to registrations)
    if (insertedRegistrations && insertedRegistrations.length > 0) {
      console.log('\n5️⃣  Seeding Copyright Monitoring...');

      const monitoring = insertedRegistrations.slice(0, 4).map((reg, index) => ({
        registration_id: reg.id,
        platform: ['youtube', 'tiktok', 'instagram', 'facebook'][index],
        detected_url: `https://${['youtube', 'tiktok', 'instagram', 'facebook'][index]}.com/detected/url/${index}`,
        detection_method: ['content_id', 'fingerprinting', 'metadata_match', 'manual'][index],
        confidence_score: 80 + (index * 3),
        is_resolved: index % 2 === 0,
        resolution_method: index % 2 === 0 ? 'takedown' : null,
        metadata: { source: 'sample_seed' }
      }));

      const { data: insertedMonitoring, error: monitoringError } = await supabase
        .from('copyright_monitoring')
        .insert(monitoring)
        .select();

      if (monitoringError) {
        console.error('❌ Error seeding monitoring:', monitoringError.message);
      } else {
        console.log(`✅ Created ${insertedMonitoring.length} monitoring records`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Copyright data seeding complete!');
    console.log('🎉 You can now test the copyright management system');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

seedCopyrightData();
