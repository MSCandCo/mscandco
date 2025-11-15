# Copyright Management System - Database Setup

## Current Status
- ✅ `copyright_verifications` - EXISTS
- ✅ `copyright_clearances` - EXISTS
- ❌ `copyright_registrations` - MISSING
- ❌ `dmca_takedowns` - MISSING
- ❌ `copyright_monitoring` - MISSING

## Setup Instructions

### Option 1: Using Supabase Dashboard SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the SQL below
5. Click "Run" or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

```sql
-- Create missing copyright tables

-- 1. COPYRIGHT REGISTRATIONS
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

-- 2. DMCA TAKEDOWN REQUESTS
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

-- 3. COPYRIGHT MONITORING
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_copyright_registrations_user_id ON copyright_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_copyright_registrations_release_id ON copyright_registrations(release_id);
CREATE INDEX IF NOT EXISTS idx_dmca_takedowns_user_id ON dmca_takedowns(user_id);
CREATE INDEX IF NOT EXISTS idx_dmca_takedowns_registration_id ON dmca_takedowns(registration_id);
CREATE INDEX IF NOT EXISTS idx_copyright_monitoring_registration_id ON copyright_monitoring(registration_id);

-- Enable RLS
ALTER TABLE copyright_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dmca_takedowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_monitoring ENABLE ROW LEVEL SECURITY;

-- RLS Policies for copyright_registrations
CREATE POLICY "Users can view own copyright registrations"
  ON copyright_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own copyright registrations"
  ON copyright_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all copyright registrations"
  ON copyright_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin')
    )
  );

-- RLS Policies for dmca_takedowns
CREATE POLICY "Users can view own dmca takedowns"
  ON dmca_takedowns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own dmca takedowns"
  ON dmca_takedowns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all dmca takedowns"
  ON dmca_takedowns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin')
    )
  );

-- RLS Policies for copyright_monitoring
CREATE POLICY "Users can view own copyright monitoring"
  ON copyright_monitoring FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM copyright_registrations
      WHERE copyright_registrations.id = copyright_monitoring.registration_id
      AND copyright_registrations.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all copyright monitoring"
  ON copyright_monitoring FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin')
    )
  );
```

### Option 2: Verifying Tables Were Created

After running the SQL above, run this command to verify:

```bash
cd mscandco-frontend
node scripts/create-copyright-tables-simple.js
```

You should see all 5 tables marked with ✅

### Next Steps

After creating the tables, you can:

1. Seed sample data for testing:
   ```bash
   cd mscandco-frontend
   node scripts/seed-copyright-data.js
   ```

2. Navigate to `http://localhost:3013/admin/copyright` to see the data

## Troubleshooting

### Schema Cache Error
If you see "Could not find in schema cache" errors, the Supabase schema cache needs to refresh. Wait 1-2 minutes or restart your Next.js dev server.

### Permission Errors
Make sure your user has the `copyright:manage` permission in the `user_permissions` table.
