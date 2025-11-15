/**
 * Check the actual schema of copyright tables
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
  console.log('🔍 Checking Copyright Table Schemas...\n');

  const tables = [
    'copyright_verifications',
    'copyright_clearances',
    'copyright_registrations',
    'dmca_takedowns',
    'copyright_monitoring'
  ];

  for (const table of tables) {
    console.log(`\n📋 ${table}:`);
    console.log('='.repeat(60));

    try {
      // Try to select one row to see the structure
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`❌ Error: ${error.message}`);
        continue;
      }

      if (data && data.length > 0) {
        console.log('Columns found:');
        Object.keys(data[0]).forEach(col => {
          console.log(`  - ${col}: ${typeof data[0][col]}`);
        });
      } else {
        // Table is empty, try inserting a minimal record to see what columns are required
        console.log('Table is empty. Attempting to discover required columns...');

        // Try inserting with minimal data to get error
        const { error: insertError } = await supabase
          .from(table)
          .insert({ test: 'test' })
          .select();

        if (insertError) {
          console.log('Required columns (from error):');
          console.log(`  ${insertError.message}`);
        }
      }
    } catch (err) {
      console.error(`❌ Error checking table: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
}

checkSchema();
