/**
 * Create missing copyright tables directly in Supabase
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

const SQL_STATEMENTS = [
  {
    name: 'Create copyright_registrations table',
    sql: `
      CREATE TABLE IF NOT EXISTS copyright_registrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
        work_title TEXT NOT NULL,
        work_type TEXT NOT NULL,
        registration_number TEXT UNIQUE,
        registration_date DATE,
        registration_country TEXT DEFAULT 'US',
        registration_organization TEXT,
        copyright_owner TEXT NOT NULL,
        co_owners JSONB,
        certificate_url TEXT,
        documentation_url TEXT,
        status TEXT DEFAULT 'pending',
        metadata JSONB DEFAULT '{}',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'Create dmca_takedowns table',
    sql: `
      CREATE TABLE IF NOT EXISTS dmca_takedowns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        registration_id UUID REFERENCES copyright_registrations(id) ON DELETE SET NULL,
        platform TEXT NOT NULL,
        infringing_url TEXT NOT NULL,
        infringement_description TEXT NOT NULL,
        submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status TEXT NOT NULL DEFAULT 'pending',
        platform_reference_number TEXT,
        takedown_date TIMESTAMP WITH TIME ZONE,
        evidence_urls JSONB,
        metadata JSONB DEFAULT '{}',
        admin_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'Create copyright_monitoring table',
    sql: `
      CREATE TABLE IF NOT EXISTS copyright_monitoring (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        registration_id UUID NOT NULL REFERENCES copyright_registrations(id) ON DELETE CASCADE,
        platform TEXT NOT NULL,
        detected_url TEXT,
        detection_method TEXT,
        confidence_score INTEGER,
        match_details JSONB,
        is_resolved BOOLEAN DEFAULT FALSE,
        resolution_method TEXT,
        resolution_date TIMESTAMP WITH TIME ZONE,
        metadata JSONB DEFAULT '{}',
        notes TEXT,
        detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  },
  {
    name: 'Create indexes for copyright_registrations',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_copyright_registrations_user_id ON copyright_registrations(user_id);
      CREATE INDEX IF NOT EXISTS idx_copyright_registrations_release_id ON copyright_registrations(release_id);
      CREATE INDEX IF NOT EXISTS idx_copyright_registrations_status ON copyright_registrations(status);
      CREATE INDEX IF NOT EXISTS idx_copyright_registrations_created_at ON copyright_registrations(created_at DESC);
    `
  },
  {
    name: 'Create indexes for dmca_takedowns',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_dmca_takedowns_user_id ON dmca_takedowns(user_id);
      CREATE INDEX IF NOT EXISTS idx_dmca_takedowns_registration_id ON dmca_takedowns(registration_id);
      CREATE INDEX IF NOT EXISTS idx_dmca_takedowns_status ON dmca_takedowns(status);
      CREATE INDEX IF NOT EXISTS idx_dmca_takedowns_platform ON dmca_takedowns(platform);
      CREATE INDEX IF NOT EXISTS idx_dmca_takedowns_created_at ON dmca_takedowns(created_at DESC);
    `
  },
  {
    name: 'Create indexes for copyright_monitoring',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_copyright_monitoring_registration_id ON copyright_monitoring(registration_id);
      CREATE INDEX IF NOT EXISTS idx_copyright_monitoring_platform ON copyright_monitoring(platform);
      CREATE INDEX IF NOT EXISTS idx_copyright_monitoring_is_resolved ON copyright_monitoring(is_resolved);
      CREATE INDEX IF NOT EXISTS idx_copyright_monitoring_detected_at ON copyright_monitoring(detected_at DESC);
    `
  },
  {
    name: 'Enable RLS on copyright_registrations',
    sql: `ALTER TABLE copyright_registrations ENABLE ROW LEVEL SECURITY;`
  },
  {
    name: 'Enable RLS on dmca_takedowns',
    sql: `ALTER TABLE dmca_takedowns ENABLE ROW LEVEL SECURITY;`
  },
  {
    name: 'Enable RLS on copyright_monitoring',
    sql: `ALTER TABLE copyright_monitoring ENABLE ROW LEVEL SECURITY;`
  },
  {
    name: 'RLS policy: Users view own registrations',
    sql: `
      CREATE POLICY IF NOT EXISTS "Users can view own copyright registrations"
        ON copyright_registrations FOR SELECT
        USING (auth.uid() = user_id);
    `
  },
  {
    name: 'RLS policy: Users create own registrations',
    sql: `
      CREATE POLICY IF NOT EXISTS "Users can create own copyright registrations"
        ON copyright_registrations FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    `
  },
  {
    name: 'RLS policy: Admins view all registrations',
    sql: `
      CREATE POLICY IF NOT EXISTS "Admins can view all copyright registrations"
        ON copyright_registrations FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('super_admin', 'company_admin')
          )
        );
    `
  },
  {
    name: 'RLS policy: Admins update all registrations',
    sql: `
      CREATE POLICY IF NOT EXISTS "Admins can update all copyright registrations"
        ON copyright_registrations FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('super_admin', 'company_admin')
          )
        );
    `
  },
  {
    name: 'RLS policy: Users view own DMCA takedowns',
    sql: `
      CREATE POLICY IF NOT EXISTS "Users can view own dmca takedowns"
        ON dmca_takedowns FOR SELECT
        USING (auth.uid() = user_id);
    `
  },
  {
    name: 'RLS policy: Users create own DMCA takedowns',
    sql: `
      CREATE POLICY IF NOT EXISTS "Users can create own dmca takedowns"
        ON dmca_takedowns FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    `
  },
  {
    name: 'RLS policy: Admins view all DMCA takedowns',
    sql: `
      CREATE POLICY IF NOT EXISTS "Admins can view all dmca takedowns"
        ON dmca_takedowns FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('super_admin', 'company_admin')
          )
        );
    `
  },
  {
    name: 'RLS policy: Admins update all DMCA takedowns',
    sql: `
      CREATE POLICY IF NOT EXISTS "Admins can update all dmca takedowns"
        ON dmca_takedowns FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('super_admin', 'company_admin')
          )
        );
    `
  },
  {
    name: 'RLS policy: Users view own monitoring',
    sql: `
      CREATE POLICY IF NOT EXISTS "Users can view own copyright monitoring"
        ON copyright_monitoring FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM copyright_registrations
            WHERE copyright_registrations.id = copyright_monitoring.registration_id
            AND copyright_registrations.user_id = auth.uid()
          )
        );
    `
  },
  {
    name: 'RLS policy: Admins view all monitoring',
    sql: `
      CREATE POLICY IF NOT EXISTS "Admins can view all copyright monitoring"
        ON copyright_monitoring FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('super_admin', 'company_admin')
          )
        );
    `
  },
  {
    name: 'RLS policy: Admins update all monitoring',
    sql: `
      CREATE POLICY IF NOT EXISTS "Admins can update all copyright monitoring"
        ON copyright_monitoring FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('super_admin', 'company_admin')
          )
        );
    `
  }
];

async function createTables() {
  console.log('🚀 Creating Missing Copyright Tables...\n');
  console.log('='.repeat(60));

  let successCount = 0;
  let errorCount = 0;

  for (const statement of SQL_STATEMENTS) {
    try {
      console.log(`\n📝 ${statement.name}...`);

      const { error } = await supabase.rpc('exec_sql', {
        sql_string: statement.sql
      });

      if (error) {
        // Try alternative method if exec_sql doesn't exist
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ sql_string: statement.sql })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        console.log(`✅ Success`);
        successCount++;
      } else {
        console.log(`✅ Success`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log('\n' + '='.repeat(60));

  if (errorCount === SQL_STATEMENTS.length) {
    console.log('\n⚠️  All statements failed!');
    console.log('\n💡 This means the exec_sql RPC function doesn\'t exist.');
    console.log('   You\'ll need to run the SQL manually in Supabase Dashboard.');
    console.log('\n📄 SQL file location:');
    console.log('   database/migrations/create_copyright_tables.sql');
    console.log('\n📍 Steps:');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log('   2. Copy/paste the SQL from the migration file');
    console.log('   3. Run it');
  } else {
    console.log('\n✨ Tables created successfully!');
    console.log('🔄 Verifying tables...\n');
    await verifyTables();
  }
}

async function verifyTables() {
  const tables = [
    'copyright_registrations',
    'dmca_takedowns',
    'copyright_monitoring'
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: Not accessible`);
      } else {
        console.log(`✅ ${table}: Ready (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Error - ${err.message}`);
    }
  }
}

createTables();
