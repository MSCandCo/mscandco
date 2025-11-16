/**
 * Add show_open_data_features column directly
 * Run with: node scripts/add-open-data-column-direct.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addColumn() {
  console.log('🚀 Adding show_open_data_features column...\n');

  try {
    // First check if column exists
    const { data: checkData, error: checkError } = await supabase
      .from('user_profiles')
      .select('show_open_data_features')
      .limit(1);

    if (!checkError) {
      console.log('✅ Column already exists!');
      return;
    }

    // Column doesn't exist, need to add it via raw SQL
    // Since we can't execute DDL directly, let's just verify and give instructions
    console.log('⚠️  Please run this SQL in Supabase SQL Editor:');
    console.log('');
    console.log('ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS show_open_data_features BOOLEAN DEFAULT false;');
    console.log('');
    console.log('Then press Enter to continue...');

    // Wait for user input
    await new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });

    console.log('\n✅ Assuming column has been added. Verifying...');

    // Verify the column now exists
    const { error: verifyError } = await supabase
      .from('user_profiles')
      .select('show_open_data_features')
      .limit(1);

    if (verifyError) {
      console.error('❌ Column still does not exist:', verifyError.message);
      process.exit(1);
    }

    console.log('✅ Column verified successfully!');
    console.log('🎉 Ready to use Open Data preferences!');

  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

addColumn();
