/**
 * Create permission_cache table via Supabase SQL API
 */

const https = require('https');
require('dotenv').config({ path: '.env.local' });

const sql = `
-- Create permission_cache table
CREATE TABLE IF NOT EXISTS permission_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL,
  permissions JSONB NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  CONSTRAINT unique_user_cache UNIQUE (user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_permission_cache_user_id ON permission_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_permission_cache_expires_at ON permission_cache(expires_at);

-- RLS
ALTER TABLE permission_cache ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Users can view own permission cache" ON permission_cache
  FOR SELECT
  USING (auth.uid() = user_id);

-- Cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_permission_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM permission_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
`;

const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);

const postData = JSON.stringify({ query: sql });

const options = {
  hostname: url.hostname,
  port: 443,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Prefer': 'return=representation'
  }
};

console.log('🔨 Creating permission_cache table...\n');
console.log('SQL to execute:');
console.log('-'.repeat(60));
console.log(sql);
console.log('-'.repeat(60));

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`\nResponse status: ${res.statusCode}`);

    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ permission_cache table created successfully!');
      console.log('\nTable features:');
      console.log('  ✅ UUID primary key with auto-generation');
      console.log('  ✅ Foreign key to auth.users (CASCADE on delete)');
      console.log('  ✅ JSONB permissions column for flexible storage');
      console.log('  ✅ Auto-expiry after 1 hour');
      console.log('  ✅ Unique constraint per user');
      console.log('  ✅ 2 indexes for performance');
      console.log('  ✅ RLS enabled');
      console.log('  ✅ Cleanup function installed');
      process.exit(0);
    } else if (res.statusCode === 404) {
      console.log('⚠️  RPC endpoint not available');
      console.log('ℹ️  Please run the SQL manually in Supabase Dashboard > SQL Editor');
      console.log('\nSQL saved to: database/create_permission_cache.sql');
      process.exit(1);
    } else {
      console.error('❌ Error creating table:', data);
      console.log('\n💡 Fallback: Run SQL manually in Supabase Dashboard');
      console.log('   File: database/create_permission_cache.sql');
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('💥 Request failed:', error.message);
  console.log('\n💡 Fallback: Run SQL manually in Supabase Dashboard');
  console.log('   File: database/create_permission_cache.sql');
  process.exit(1);
});

req.write(postData);
req.end();
