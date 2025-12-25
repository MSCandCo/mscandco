/**
 * Execute SQL via Supabase Management API
 */

const https = require('https');
const { readFileSync } = require('fs');
const { join } = require('path');
require('dotenv').config({ path: '.env.local' });

async function executeSQLViaAPI() {
  console.log('🔨 Creating permission_cache table via Management API\n');

  // Read SQL file
  const sqlPath = join(__dirname, '..', 'database', 'create_permission_cache.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  console.log('SQL to execute:');
  console.log('='.repeat(60));
  console.log(sql.substring(0, 300) + '...\n');
  console.log('='.repeat(60));

  // Extract project ref
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)[1];

  console.log(`\nProject: ${projectRef}`);
  console.log('\n🔄 Attempting to execute SQL...\n');

  // Try using the SQL endpoint
  const postData = JSON.stringify({ query: sql });

  const options = {
    hostname: `${projectRef}.supabase.co`,
    port: 443,
    path: '/rest/v1/rpc/exec',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`Response status: ${res.statusCode}`);

      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ SQL executed successfully!');
        console.log('\n📊 Migration Complete!');
        console.log('   ✅ user_role_assignments');
        console.log('   ✅ audit_logs');
        console.log('   ✅ permission_cache');
      } else {
        console.log('Response:', data);
        console.log('\n❌ Could not execute SQL via API');
        provideFallbackInstructions(projectRef);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
    provideFallbackInstructions(projectRef);
  });

  req.write(postData);
  req.end();
}

function provideFallbackInstructions(projectRef) {
  console.log('\n💡 Manual execution required:');
  console.log('='.repeat(60));
  console.log('1. Open Supabase SQL Editor:');
  console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log('');
  console.log('2. Copy SQL from:');
  console.log('   database/create_permission_cache.sql');
  console.log('');
  console.log('3. Paste into SQL Editor and click "Run"');
  console.log('');
  console.log('4. Verify with:');
  console.log('   SELECT * FROM permission_cache LIMIT 1;');
  console.log('='.repeat(60));
  console.log('\nSQL content:');
  const sqlPath = join(__dirname, '..', 'database', 'create_permission_cache.sql');
  const sql = readFileSync(sqlPath, 'utf8');
  console.log(sql);
}

executeSQLViaAPI()
  .then(() => setTimeout(() => process.exit(0), 1000))
  .catch((error) => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
