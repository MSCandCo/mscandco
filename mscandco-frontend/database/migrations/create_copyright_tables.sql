-- =====================================================
-- COPYRIGHT MANAGEMENT SYSTEM - COMPREHENSIVE SCHEMA
-- =====================================================
-- This migration creates all tables for the copyright management system
-- including verifications, clearances, DMCA takedowns, registrations, and monitoring

-- 1. COPYRIGHT VERIFICATIONS TABLE
-- Tracks copyright verification requests for releases
CREATE TABLE IF NOT EXISTS copyright_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,

  -- Verification details
  verification_status TEXT NOT NULL DEFAULT 'pending',
  -- Options: pending, processing, clear, conflict_detected, potential_conflict, manual_review_required, failed

  confidence_score INTEGER, -- 0-100
  conflict_severity TEXT, -- critical, high, medium, low
  conflict_details JSONB, -- Detailed information about any conflicts found
  verification_method TEXT, -- API name or method used for verification

  -- Metadata
  metadata JSONB DEFAULT '{}',
  admin_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. COPYRIGHT CLEARANCES TABLE
-- Tracks sample/cover clearance requests
CREATE TABLE IF NOT EXISTS copyright_clearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,

  -- Original work details
  original_work_title TEXT NOT NULL,
  original_artist TEXT NOT NULL,
  clearance_type TEXT NOT NULL, -- sample, cover, interpolation, remix

  -- Clearance details
  license_holder TEXT,
  license_holder_contact TEXT,
  percentage_used DECIMAL(5,2), -- For samples

  -- Approval tracking
  approval_status TEXT NOT NULL DEFAULT 'pending',
  -- Options: pending, approved, rejected, expired

  approval_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,

  -- Documents
  documentation_url TEXT,
  contract_url TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. COPYRIGHT REGISTRATIONS TABLE
-- Tracks formal copyright registrations
CREATE TABLE IF NOT EXISTS copyright_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,

  -- Work details
  work_title TEXT NOT NULL,
  work_type TEXT NOT NULL, -- musical_composition, sound_recording, lyrics, both

  -- Registration details
  registration_number TEXT UNIQUE,
  registration_date DATE,
  registration_country TEXT DEFAULT 'US',
  registration_organization TEXT, -- e.g., "US Copyright Office", "UK IPO"

  -- Ownership
  copyright_owner TEXT NOT NULL,
  co_owners JSONB, -- Array of co-owner details

  -- Documents
  certificate_url TEXT,
  documentation_url TEXT,

  -- Status
  status TEXT DEFAULT 'pending', -- pending, registered, expired, transferred

  -- Metadata
  metadata JSONB DEFAULT '{}',
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DMCA TAKEDOWN REQUESTS TABLE
-- Tracks DMCA/copyright infringement takedown requests
CREATE TABLE IF NOT EXISTS dmca_takedowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES copyright_registrations(id) ON DELETE SET NULL,

  -- Infringement details
  platform TEXT NOT NULL, -- youtube, spotify, soundcloud, etc.
  infringing_url TEXT NOT NULL,
  infringement_description TEXT NOT NULL,

  -- Submission tracking
  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  -- Options: pending, submitted, in_progress, completed, rejected

  platform_reference_number TEXT, -- Reference number from the platform
  takedown_date TIMESTAMP WITH TIME ZONE,

  -- Evidence
  evidence_urls JSONB, -- Array of evidence URLs (screenshots, recordings, etc.)

  -- Metadata
  metadata JSONB DEFAULT '{}',
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COPYRIGHT MONITORING TABLE
-- Tracks automated monitoring results for registered works
CREATE TABLE IF NOT EXISTS copyright_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES copyright_registrations(id) ON DELETE CASCADE,

  -- Detection details
  platform TEXT NOT NULL,
  detected_url TEXT,
  detection_method TEXT, -- content_id, fingerprinting, metadata_match, manual
  confidence_score INTEGER, -- 0-100

  -- Match details
  match_details JSONB, -- Detailed information about the match

  -- Status
  is_resolved BOOLEAN DEFAULT FALSE,
  resolution_method TEXT, -- takedown, authorized, false_positive, etc.
  resolution_date TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  notes TEXT,

  -- Timestamps
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Copyright Verifications indexes
CREATE INDEX IF NOT EXISTS idx_copyright_verifications_user_id ON copyright_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_copyright_verifications_release_id ON copyright_verifications(release_id);
CREATE INDEX IF NOT EXISTS idx_copyright_verifications_status ON copyright_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_copyright_verifications_created_at ON copyright_verifications(created_at DESC);

-- Copyright Clearances indexes
CREATE INDEX IF NOT EXISTS idx_copyright_clearances_user_id ON copyright_clearances(user_id);
CREATE INDEX IF NOT EXISTS idx_copyright_clearances_release_id ON copyright_clearances(release_id);
CREATE INDEX IF NOT EXISTS idx_copyright_clearances_status ON copyright_clearances(approval_status);
CREATE INDEX IF NOT EXISTS idx_copyright_clearances_created_at ON copyright_clearances(created_at DESC);

-- Copyright Registrations indexes
CREATE INDEX IF NOT EXISTS idx_copyright_registrations_user_id ON copyright_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_copyright_registrations_release_id ON copyright_registrations(release_id);
CREATE INDEX IF NOT EXISTS idx_copyright_registrations_status ON copyright_registrations(status);
CREATE INDEX IF NOT EXISTS idx_copyright_registrations_created_at ON copyright_registrations(created_at DESC);

-- DMCA Takedowns indexes
CREATE INDEX IF NOT EXISTS idx_dmca_takedowns_user_id ON dmca_takedowns(user_id);
CREATE INDEX IF NOT EXISTS idx_dmca_takedowns_registration_id ON dmca_takedowns(registration_id);
CREATE INDEX IF NOT EXISTS idx_dmca_takedowns_status ON dmca_takedowns(status);
CREATE INDEX IF NOT EXISTS idx_dmca_takedowns_platform ON dmca_takedowns(platform);
CREATE INDEX IF NOT EXISTS idx_dmca_takedowns_created_at ON dmca_takedowns(created_at DESC);

-- Copyright Monitoring indexes
CREATE INDEX IF NOT EXISTS idx_copyright_monitoring_registration_id ON copyright_monitoring(registration_id);
CREATE INDEX IF NOT EXISTS idx_copyright_monitoring_platform ON copyright_monitoring(platform);
CREATE INDEX IF NOT EXISTS idx_copyright_monitoring_is_resolved ON copyright_monitoring(is_resolved);
CREATE INDEX IF NOT EXISTS idx_copyright_monitoring_detected_at ON copyright_monitoring(detected_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE copyright_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_clearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dmca_takedowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_monitoring ENABLE ROW LEVEL SECURITY;

-- COPYRIGHT VERIFICATIONS POLICIES
-- Users can view their own verifications
CREATE POLICY "Users can view own copyright verifications"
  ON copyright_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own verifications
CREATE POLICY "Users can create own copyright verifications"
  ON copyright_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own verifications
CREATE POLICY "Users can update own copyright verifications"
  ON copyright_verifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all verifications
CREATE POLICY "Admins can view all copyright verifications"
  ON copyright_verifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin')
    )
  );

-- Admins can update all verifications
CREATE POLICY "Admins can update all copyright verifications"
  ON copyright_verifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin')
    )
  );

-- COPYRIGHT CLEARANCES POLICIES
-- Users can view their own clearances
CREATE POLICY "Users can view own copyright clearances"
  ON copyright_clearances
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own clearances
CREATE POLICY "Users can create own copyright clearances"
  ON copyright_clearances
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own clearances
CREATE POLICY "Users can update own copyright clearances"
  ON copyright_clearances
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all clearances
CREATE POLICY "Admins can view all copyright clearances"
  ON copyright_clearances
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin')
    )
  );

-- Admins can update all clearances
CREATE POLICY "Admins can update all copyright clearances"
  ON copyright_clearances
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin')
    )
  );

-- COPYRIGHT REGISTRATIONS POLICIES
-- Users can view their own registrations
CREATE POLICY "Users can view own copyright registrations"
  ON copyright_registrations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own registrations
CREATE POLICY "Users can create own copyright registrations"
  ON copyright_registrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own registrations
CREATE POLICY "Users can update own copyright registrations"
  ON copyright_registrations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all registrations
CREATE POLICY "Admins can view all copyright registrations"
  ON copyright_registrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin')
    )
  );

-- Admins can update all registrations
CREATE POLICY "Admins can update all copyright registrations"
  ON copyright_registrations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin')
    )
  );

-- DMCA TAKEDOWNS POLICIES
-- Users can view their own takedowns
CREATE POLICY "Users can view own dmca takedowns"
  ON dmca_takedowns
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own takedowns
CREATE POLICY "Users can create own dmca takedowns"
  ON dmca_takedowns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own takedowns
CREATE POLICY "Users can update own dmca takedowns"
  ON dmca_takedowns
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all takedowns
CREATE POLICY "Admins can view all dmca takedowns"
  ON dmca_takedowns
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin')
    )
  );

-- Admins can update all takedowns
CREATE POLICY "Admins can update all dmca takedowns"
  ON dmca_takedowns
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin')
    )
  );

-- COPYRIGHT MONITORING POLICIES
-- Users can view monitoring for their registrations
CREATE POLICY "Users can view own copyright monitoring"
  ON copyright_monitoring
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM copyright_registrations
      WHERE copyright_registrations.id = copyright_monitoring.registration_id
      AND copyright_registrations.user_id = auth.uid()
    )
  );

-- Admins can view all monitoring
CREATE POLICY "Admins can view all copyright monitoring"
  ON copyright_monitoring
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin')
    )
  );

-- Admins can update all monitoring
CREATE POLICY "Admins can update all copyright monitoring"
  ON copyright_monitoring
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('super_admin', 'company_admin')
    )
  );

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all tables
DROP TRIGGER IF EXISTS update_copyright_verifications_updated_at ON copyright_verifications;
CREATE TRIGGER update_copyright_verifications_updated_at
  BEFORE UPDATE ON copyright_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_copyright_clearances_updated_at ON copyright_clearances;
CREATE TRIGGER update_copyright_clearances_updated_at
  BEFORE UPDATE ON copyright_clearances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_copyright_registrations_updated_at ON copyright_registrations;
CREATE TRIGGER update_copyright_registrations_updated_at
  BEFORE UPDATE ON copyright_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dmca_takedowns_updated_at ON dmca_takedowns;
CREATE TRIGGER update_dmca_takedowns_updated_at
  BEFORE UPDATE ON dmca_takedowns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_copyright_monitoring_updated_at ON copyright_monitoring;
CREATE TRIGGER update_copyright_monitoring_updated_at
  BEFORE UPDATE ON copyright_monitoring
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================
-- Uncomment the following to add sample data for testing

/*
-- Sample verification (you'll need to replace user_id and release_id with real values)
INSERT INTO copyright_verifications (
  user_id,
  release_id,
  verification_status,
  confidence_score,
  conflict_severity,
  verification_method
) VALUES (
  'YOUR_USER_ID_HERE',
  'YOUR_RELEASE_ID_HERE',
  'clear',
  98,
  NULL,
  'automated_api'
);
*/
