/**
 * Inspect actual table structure
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectTables() {
  console.log('🔍 Inspecting RBAC Table Structures\n');
  console.log('=' .repeat(60));

  // 1. Get actual data from user_role_assignments to see columns
  console.log('\n📋 user_role_assignments structure:');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_role_assignments?limit=5`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'count=exact'
        }
      }
    );

    const count = response.headers.get('content-range');
    const data = await response.json();

    if (data && data.length > 0) {
      console.log('✅ Table exists with data\n');
      console.log(`Total records: ${count ? count.split('/')[1] : 'unknown'}\n`);
      console.log('Columns found:');
      Object.keys(data[0]).forEach(col => {
        console.log(`  - ${col}: ${typeof data[0][col]} (${JSON.stringify(data[0][col]).substring(0, 50)}...)`);
      });

      console.log('\nSample records:');
      data.forEach((record, idx) => {
        console.log(`\nRecord ${idx + 1}:`);
        Object.entries(record).forEach(([key, value]) => {
          console.log(`  ${key}: ${JSON.stringify(value)}`);
        });
      });

      // Count by role
      console.log('\n📊 Role Distribution:');
      const roleCounts = data.reduce((acc, record) => {
        const role = record.role_name || record.role || 'unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});
      Object.entries(roleCounts).forEach(([role, count]) => {
        console.log(`  ${role}: ${count} users`);
      });

    } else if (Array.isArray(data) && data.length === 0) {
      console.log('✅ Table exists but is empty');
      console.log('⚠️  No role assignments found - users need roles assigned');
    } else {
      console.log('❌ Could not retrieve data:', JSON.stringify(data));
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }

  // 2. Check audit_logs structure
  console.log('\n\n📋 audit_logs structure:');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/audit_logs?order=created_at.desc&limit=5`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'count=exact'
        }
      }
    );

    const count = response.headers.get('content-range');
    const data = await response.json();

    if (data && data.length > 0) {
      console.log('✅ Table exists with data\n');
      console.log(`Total records: ${count ? count.split('/')[1] : 'unknown'}\n`);
      console.log('Columns found:');
      Object.keys(data[0]).forEach(col => {
        console.log(`  - ${col}`);
      });

      console.log('\nLatest audit logs:');
      data.slice(0, 3).forEach((record, idx) => {
        console.log(`\nLog ${idx + 1}:`);
        console.log(`  action: ${record.action}`);
        console.log(`  status: ${record.status}`);
        console.log(`  email: ${record.email}`);
        console.log(`  created_at: ${record.created_at}`);
      });

    } else if (Array.isArray(data) && data.length === 0) {
      console.log('✅ Table exists but is empty');
      console.log('ℹ️  Audit logs will populate as users access protected routes');
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }

  // 3. Check permission_cache
  console.log('\n\n📋 permission_cache structure:');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/permission_cache?limit=5`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'count=exact'
        }
      }
    );

    const count = response.headers.get('content-range');
    const data = await response.json();

    if (data && data.length > 0) {
      console.log('✅ Table exists with data\n');
      console.log(`Total cached entries: ${count ? count.split('/')[1] : 'unknown'}`);
    } else if (Array.isArray(data) && data.length === 0) {
      console.log('✅ Table exists but is empty');
      console.log('ℹ️  Cache will populate automatically during runtime');
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Inspection complete\n');
}

inspectTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Inspection failed:', error);
    process.exit(1);
  });
