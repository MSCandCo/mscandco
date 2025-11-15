/**
 * Simple script to create copyright tables using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createCopyrightTables() {
  console.log('🚀 Creating Copyright Management Tables...\n');

  try {
    // Check if tables exist
    console.log('📋 Checking existing tables...\n');

    const { count: verificationsCount, error: verificationsError } = await supabase
      .from('copyright_verifications')
      .select('*', { count: 'exact', head: true });

    if (!verificationsError) {
      console.log(`✅ copyright_verifications table exists (${verificationsCount || 0} rows)`);
    } else {
      console.log('❌ copyright_verifications table does not exist');
    }

    const { count: clearancesCount, error: clearancesError } = await supabase
      .from('copyright_clearances')
      .select('*', { count: 'exact', head: true });

    if (!clearancesError) {
      console.log(`✅ copyright_clearances table exists (${clearancesCount || 0} rows)`);
    } else {
      console.log('❌ copyright_clearances table does not exist');
    }

    const { count: registrationsCount, error: registrationsError } = await supabase
      .from('copyright_registrations')
      .select('*', { count: 'exact', head: true });

    if (!registrationsError) {
      console.log(`✅ copyright_registrations table exists (${registrationsCount || 0} rows)`);
    } else {
      console.log('❌ copyright_registrations table does not exist');
    }

    const { count: dmcaCount, error: dmcaError } = await supabase
      .from('dmca_takedowns')
      .select('*', { count: 'exact', head: true });

    if (!dmcaError) {
      console.log(`✅ dmca_takedowns table exists (${dmcaCount || 0} rows)`);
    } else {
      console.log('❌ dmca_takedowns table does not exist');
    }

    const { count: monitoringCount, error: monitoringError } = await supabase
      .from('copyright_monitoring')
      .select('*', { count: 'exact', head: true });

    if (!monitoringError) {
      console.log(`✅ copyright_monitoring table exists (${monitoringCount || 0} rows)`);
    } else {
      console.log('❌ copyright_monitoring table does not exist');
    }

    console.log('\n' + '='.repeat(60));

    // If any table is missing, show instructions
    if (verificationsError || clearancesError || registrationsError || dmcaError || monitoringError) {
      console.log('\n⚠️  Some copyright tables are missing!');
      console.log('\n📝 To create the tables, follow these steps:');
      console.log('\n1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy the contents of: database/migrations/create_copyright_tables.sql');
      console.log('4. Paste and run the SQL in the editor');
      console.log('\nOR\n');
      console.log('Run this SQL directly in Supabase SQL Editor:\n');
      console.log('The SQL file is located at:');
      console.log('  mscandco-frontend/database/migrations/create_copyright_tables.sql');
    } else {
      console.log('\n✨ All copyright tables exist!');
      console.log('\n📊 Table Summary:');
      console.log(`   - copyright_verifications: ${verificationsCount || 0} rows`);
      console.log(`   - copyright_clearances: ${clearancesCount || 0} rows`);
      console.log(`   - copyright_registrations: ${registrationsCount || 0} rows`);
      console.log(`   - dmca_takedowns: ${dmcaCount || 0} rows`);
      console.log(`   - copyright_monitoring: ${monitoringCount || 0} rows`);
    }

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

createCopyrightTables();
