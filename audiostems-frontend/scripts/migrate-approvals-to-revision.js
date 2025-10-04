// Migration script: Update approvals status to revision
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🔄 Running migration: Update approvals to revision...');
  console.log('📍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');

  try {
    // Update all releases with 'approvals' status to 'revision'
    const { data: updateData, error: updateError } = await supabase
      .from('releases')
      .update({ status: 'revision' })
      .eq('status', 'approvals')
      .select();

    if (updateError) {
      console.error('❌ Migration failed:', updateError);
      process.exit(1);
    }

    console.log(`✅ Updated ${updateData?.length || 0} releases from 'approvals' to 'revision'`);

    // Verify the update - get all releases and count by status
    const { data: allReleases, error: fetchError } = await supabase
      .from('releases')
      .select('status');

    if (fetchError) {
      console.error('❌ Failed to verify:', fetchError);
      process.exit(1);
    }

    const statusCounts = allReleases.reduce((acc, release) => {
      acc[release.status] = (acc[release.status] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Release status counts:');
    Object.entries(statusCounts).sort().forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

runMigration();
