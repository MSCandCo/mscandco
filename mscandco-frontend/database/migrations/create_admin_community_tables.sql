-- ============================================
-- ADMIN COMMUNITY FEATURES DATABASE SCHEMA
-- ============================================
-- Complete schema for Copyright, Accessibility, Sustainability, Skills, and Open Data
-- Single source of truth with full database connectivity
-- ============================================

-- ============================================
-- 1. COPYRIGHT MANAGEMENT TABLES
-- ============================================

-- Copyright Verifications
CREATE TABLE IF NOT EXISTS copyright_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('automated', 'manual', 'third_party')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'disputed', 'rejected')),
  verification_result JSONB DEFAULT '{}'::JSONB,
  confidence_score DECIMAL(5,2),
  verified_by TEXT,
  verification_method TEXT,
  notes TEXT,
  evidence_urls TEXT[],
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Copyright Clearances
CREATE TABLE IF NOT EXISTS copyright_clearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clearance_type TEXT NOT NULL CHECK (clearance_type IN ('sample', 'cover', 'remix', 'interpolation', 'sync')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  rights_holder TEXT,
  original_work_title TEXT,
  original_work_artist TEXT,
  license_type TEXT,
  fee_amount DECIMAL(10,2),
  fee_currency TEXT DEFAULT 'USD',
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  contract_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- DMCA Takedowns
CREATE TABLE IF NOT EXISTS dmca_takedowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  infringing_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'removed', 'rejected', 'counter_notice')),
  takedown_request_date TIMESTAMPTZ,
  removal_date TIMESTAMPTZ,
  case_number TEXT,
  platform_response TEXT,
  evidence_urls TEXT[],
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copyright Registrations
CREATE TABLE IF NOT EXISTS copyright_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_authority TEXT NOT NULL CHECK (registration_authority IN ('US_Copyright_Office', 'UK_IPO', 'EU_IPO', 'Other')),
  registration_number TEXT,
  registration_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'registered', 'rejected', 'expired')),
  certificate_url TEXT,
  expiry_date TIMESTAMPTZ,
  renewal_date TIMESTAMPTZ,
  fee_paid DECIMAL(10,2),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copyright Monitoring
CREATE TABLE IF NOT EXISTS copyright_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  monitoring_service TEXT,
  scan_date TIMESTAMPTZ DEFAULT NOW(),
  findings_count INTEGER DEFAULT 0,
  findings JSONB DEFAULT '[]'::JSONB,
  action_taken TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'resolved')),
  next_scan_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ACCESSIBILITY TABLES
-- ============================================

-- Accessibility Content
CREATE TABLE IF NOT EXISTS accessibility_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('lyrics', 'captions', 'audio_description', 'transcript', 'braille')),
  language TEXT DEFAULT 'en',
  format TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  file_url TEXT,
  quality_score DECIMAL(5,2),
  wcag_compliance_level TEXT CHECK (wcag_compliance_level IN ('A', 'AA', 'AAA')),
  validated_by TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Accessibility Requests
CREATE TABLE IF NOT EXISTS accessibility_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('captions', 'audio_description', 'sign_language', 'braille', 'large_print', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'rejected')),
  requested_language TEXT,
  due_date TIMESTAMPTZ,
  assigned_to TEXT,
  completion_percentage INTEGER DEFAULT 0,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Sign Language Interpreters
CREATE TABLE IF NOT EXISTS sign_language_interpreters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  languages TEXT[] NOT NULL,
  certification TEXT[],
  hourly_rate DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
  rating DECIMAL(3,2),
  completed_projects INTEGER DEFAULT 0,
  bio TEXT,
  portfolio_url TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accessibility Compliance
CREATE TABLE IF NOT EXISTS accessibility_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  standard TEXT NOT NULL CHECK (standard IN ('WCAG_2.1', 'WCAG_2.2', 'ADA', 'Section_508', 'EAA')),
  compliance_level TEXT CHECK (compliance_level IN ('A', 'AA', 'AAA', 'Partial', 'Non_Compliant')),
  audit_date TIMESTAMPTZ,
  auditor TEXT,
  issues_found INTEGER DEFAULT 0,
  issues_resolved INTEGER DEFAULT 0,
  compliance_score DECIMAL(5,2),
  certificate_url TEXT,
  next_audit_date TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. SUSTAINABILITY / CARBON MANAGEMENT TABLES
-- ============================================

-- Carbon Footprint Tracking
CREATE TABLE IF NOT EXISTS carbon_footprint_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('streaming', 'download', 'physical_production', 'distribution', 'touring', 'studio', 'other')),
  carbon_kg DECIMAL(10,2) NOT NULL,
  calculation_method TEXT,
  calculation_period_start DATE,
  calculation_period_end DATE,
  platform TEXT,
  region TEXT,
  data_quality TEXT CHECK (data_quality IN ('high', 'medium', 'low', 'estimated')),
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'certified')),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carbon Offset Transactions
CREATE TABLE IF NOT EXISTS carbon_offset_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  carbon_kg_offset DECIMAL(10,2) NOT NULL,
  cost_amount DECIMAL(10,2),
  cost_currency TEXT DEFAULT 'USD',
  offset_provider TEXT NOT NULL,
  project_name TEXT,
  project_type TEXT CHECK (project_type IN ('reforestation', 'renewable_energy', 'carbon_capture', 'methane_reduction', 'other')),
  certificate_number TEXT,
  certificate_url TEXT,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  verification_standard TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'verified', 'expired')),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sustainability Profiles
CREATE TABLE IF NOT EXISTS sustainability_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_carbon_kg DECIMAL(12,2) DEFAULT 0,
  total_offset_kg DECIMAL(12,2) DEFAULT 0,
  net_carbon_kg DECIMAL(12,2) DEFAULT 0,
  sustainability_score DECIMAL(5,2),
  carbon_neutral_status BOOLEAN DEFAULT false,
  carbon_neutral_since TIMESTAMPTZ,
  commitment_level TEXT CHECK (commitment_level IN ('bronze', 'silver', 'gold', 'platinum')),
  goals JSONB DEFAULT '{}'::JSONB,
  achievements TEXT[],
  certifications TEXT[],
  public_visibility BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sustainability Achievements
CREATE TABLE IF NOT EXISTS sustainability_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('carbon_neutral_release', 'first_offset', 'milestone_offset', 'yearly_reduction', 'commitment_reached')),
  achievement_name TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  points INTEGER DEFAULT 0,
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. SKILLS / LEARNING TABLES
-- ============================================

-- Learning Modules
CREATE TABLE IF NOT EXISTS learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  category TEXT CHECK (category IN ('music_production', 'marketing', 'business', 'legal', 'technology', 'performance', 'other')),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  estimated_duration_minutes INTEGER,
  content_url TEXT,
  content_type TEXT CHECK (content_type IN ('video', 'article', 'interactive', 'quiz', 'project')),
  prerequisites TEXT[],
  learning_objectives TEXT[],
  is_published BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  instructor_name TEXT,
  instructor_bio TEXT,
  thumbnail_url TEXT,
  completion_criteria JSONB DEFAULT '{}'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Learning Enrollments
CREATE TABLE IF NOT EXISTS learning_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
  progress_percentage INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER DEFAULT 0,
  quiz_scores JSONB DEFAULT '[]'::JSONB,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Learning Certificates
CREATE TABLE IF NOT EXISTS learning_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES learning_modules(id) ON DELETE SET NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  certificate_name TEXT NOT NULL,
  issued_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  credential_url TEXT,
  verification_code TEXT UNIQUE,
  skills_acquired TEXT[],
  final_score DECIMAL(5,2),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Tutor Sessions
CREATE TABLE IF NOT EXISTS ai_tutor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES learning_modules(id) ON DELETE SET NULL,
  session_topic TEXT,
  messages JSONB DEFAULT '[]'::JSONB,
  message_count INTEGER DEFAULT 0,
  ai_model TEXT DEFAULT 'gpt-4',
  tokens_used INTEGER DEFAULT 0,
  satisfaction_rating DECIMAL(3,2),
  user_feedback TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. OPEN DATA TABLES
-- ============================================

-- Open Data Metrics
CREATE TABLE IF NOT EXISTS open_data_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_category TEXT CHECK (metric_category IN ('streaming', 'engagement', 'demographics', 'financial', 'environmental', 'other')),
  metric_value JSONB NOT NULL,
  aggregation_period TEXT CHECK (aggregation_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  period_start DATE,
  period_end DATE,
  data_source TEXT,
  is_public BOOLEAN DEFAULT true,
  anonymization_level TEXT CHECK (anonymization_level IN ('none', 'partial', 'full')),
  quality_score DECIMAL(5,2),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research Datasets
CREATE TABLE IF NOT EXISTS research_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  dataset_type TEXT CHECK (dataset_type IN ('streaming_data', 'user_behavior', 'market_trends', 'acoustic_features', 'social_metrics', 'other')),
  file_url TEXT,
  file_size_bytes BIGINT,
  file_format TEXT,
  record_count INTEGER,
  column_count INTEGER,
  schema_definition JSONB,
  license TEXT DEFAULT 'CC-BY-4.0',
  is_published BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  citation_count INTEGER DEFAULT 0,
  version TEXT DEFAULT '1.0',
  doi TEXT,
  keywords TEXT[],
  contact_email TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Open Data API Keys
CREATE TABLE IF NOT EXISTS open_data_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key TEXT UNIQUE NOT NULL,
  key_name TEXT,
  description TEXT,
  rate_limit_per_hour INTEGER DEFAULT 100,
  rate_limit_per_day INTEGER DEFAULT 1000,
  allowed_endpoints TEXT[],
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dataset Access Requests
CREATE TABLE IF NOT EXISTS dataset_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dataset_id UUID REFERENCES research_datasets(id) ON DELETE CASCADE,
  request_reason TEXT NOT NULL,
  intended_use TEXT,
  organization TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'revoked')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  access_granted_at TIMESTAMPTZ,
  access_expires_at TIMESTAMPTZ,
  terms_accepted BOOLEAN DEFAULT false,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Copyright Indexes
CREATE INDEX IF NOT EXISTS idx_copyright_verifications_release ON copyright_verifications(release_id);
CREATE INDEX IF NOT EXISTS idx_copyright_verifications_user ON copyright_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_copyright_verifications_status ON copyright_verifications(status);
CREATE INDEX IF NOT EXISTS idx_copyright_clearances_release ON copyright_clearances(release_id);
CREATE INDEX IF NOT EXISTS idx_copyright_clearances_status ON copyright_clearances(status);
CREATE INDEX IF NOT EXISTS idx_dmca_takedowns_platform ON dmca_takedowns(platform);
CREATE INDEX IF NOT EXISTS idx_dmca_takedowns_status ON dmca_takedowns(status);

-- Accessibility Indexes
CREATE INDEX IF NOT EXISTS idx_accessibility_content_release ON accessibility_content(release_id);
CREATE INDEX IF NOT EXISTS idx_accessibility_content_type ON accessibility_content(content_type);
CREATE INDEX IF NOT EXISTS idx_accessibility_requests_status ON accessibility_requests(status);
CREATE INDEX IF NOT EXISTS idx_sign_language_interpreters_availability ON sign_language_interpreters(availability);

-- Sustainability Indexes
CREATE INDEX IF NOT EXISTS idx_carbon_tracking_user ON carbon_footprint_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_tracking_release ON carbon_footprint_tracking(release_id);
CREATE INDEX IF NOT EXISTS idx_carbon_tracking_period ON carbon_footprint_tracking(calculation_period_start, calculation_period_end);
CREATE INDEX IF NOT EXISTS idx_carbon_offsets_user ON carbon_offset_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_profiles_user ON sustainability_profiles(user_id);

-- Learning Indexes
CREATE INDEX IF NOT EXISTS idx_learning_modules_published ON learning_modules(is_published);
CREATE INDEX IF NOT EXISTS idx_learning_modules_category ON learning_modules(category);
CREATE INDEX IF NOT EXISTS idx_learning_enrollments_user ON learning_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_enrollments_module ON learning_enrollments(module_id);
CREATE INDEX IF NOT EXISTS idx_learning_enrollments_status ON learning_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_learning_certificates_user ON learning_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tutor_sessions_user ON ai_tutor_sessions(user_id);

-- Open Data Indexes
CREATE INDEX IF NOT EXISTS idx_open_data_metrics_public ON open_data_metrics(is_public);
CREATE INDEX IF NOT EXISTS idx_open_data_metrics_period ON open_data_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_research_datasets_published ON research_datasets(is_published);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON open_data_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON open_data_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_dataset_access_status ON dataset_access_requests(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE copyright_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_clearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE dmca_takedowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE copyright_monitoring ENABLE ROW LEVEL SECURITY;

ALTER TABLE accessibility_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessibility_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sign_language_interpreters ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessibility_compliance ENABLE ROW LEVEL SECURITY;

ALTER TABLE carbon_footprint_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_offset_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_achievements ENABLE ROW LEVEL SECURITY;

ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tutor_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE open_data_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_data_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_access_requests ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can view their own data, admins can view all)
-- Copyright tables - users can view their own, service role can view all
DO $$
BEGIN
  -- Copyright Verifications
  DROP POLICY IF EXISTS "Users can view own copyright verifications" ON copyright_verifications;
  CREATE POLICY "Users can view own copyright verifications"
    ON copyright_verifications FOR SELECT
    USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

  -- Copyright Clearances
  DROP POLICY IF EXISTS "Users can view own copyright clearances" ON copyright_clearances;
  CREATE POLICY "Users can view own copyright clearances"
    ON copyright_clearances FOR SELECT
    USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

  -- Similar policies for other copyright tables...
  DROP POLICY IF EXISTS "Service role full access to dmca_takedowns" ON dmca_takedowns;
  CREATE POLICY "Service role full access to dmca_takedowns"
    ON dmca_takedowns FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

  DROP POLICY IF EXISTS "Service role full access to copyright_registrations" ON copyright_registrations;
  CREATE POLICY "Service role full access to copyright_registrations"
    ON copyright_registrations FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

  DROP POLICY IF EXISTS "Service role full access to copyright_monitoring" ON copyright_monitoring;
  CREATE POLICY "Service role full access to copyright_monitoring"
    ON copyright_monitoring FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

  -- Accessibility tables
  DROP POLICY IF EXISTS "Service role full access to accessibility_content" ON accessibility_content;
  CREATE POLICY "Service role full access to accessibility_content"
    ON accessibility_content FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

  DROP POLICY IF EXISTS "Service role full access to accessibility_requests" ON accessibility_requests;
  CREATE POLICY "Service role full access to accessibility_requests"
    ON accessibility_requests FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

  DROP POLICY IF EXISTS "Anyone can view interpreters" ON sign_language_interpreters;
  CREATE POLICY "Anyone can view interpreters"
    ON sign_language_interpreters FOR SELECT
    USING (true);

  DROP POLICY IF EXISTS "Service role full access to accessibility_compliance" ON accessibility_compliance;
  CREATE POLICY "Service role full access to accessibility_compliance"
    ON accessibility_compliance FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

  -- Sustainability tables
  DROP POLICY IF EXISTS "Service role full access to carbon_footprint_tracking" ON carbon_footprint_tracking;
  CREATE POLICY "Service role full access to carbon_footprint_tracking"
    ON carbon_footprint_tracking FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

  DROP POLICY IF EXISTS "Service role full access to carbon_offset_transactions" ON carbon_offset_transactions;
  CREATE POLICY "Service role full access to carbon_offset_transactions"
    ON carbon_offset_transactions FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

  DROP POLICY IF EXISTS "Public can view public sustainability profiles" ON sustainability_profiles;
  CREATE POLICY "Public can view public sustainability profiles"
    ON sustainability_profiles FOR SELECT
    USING (public_visibility = true OR auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

  DROP POLICY IF EXISTS "Service role full access to sustainability_achievements" ON sustainability_achievements;
  CREATE POLICY "Service role full access to sustainability_achievements"
    ON sustainability_achievements FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

  -- Learning tables
  DROP POLICY IF EXISTS "Anyone can view published modules" ON learning_modules;
  CREATE POLICY "Anyone can view published modules"
    ON learning_modules FOR SELECT
    USING (is_published = true OR auth.jwt() ->> 'role' = 'service_role');

  DROP POLICY IF EXISTS "Users can view own enrollments" ON learning_enrollments;
  CREATE POLICY "Users can view own enrollments"
    ON learning_enrollments FOR SELECT
    USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

  DROP POLICY IF EXISTS "Users can view own certificates" ON learning_certificates;
  CREATE POLICY "Users can view own certificates"
    ON learning_certificates FOR SELECT
    USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

  DROP POLICY IF EXISTS "Users can view own AI sessions" ON ai_tutor_sessions;
  CREATE POLICY "Users can view own AI sessions"
    ON ai_tutor_sessions FOR SELECT
    USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

  -- Open Data tables
  DROP POLICY IF EXISTS "Anyone can view public metrics" ON open_data_metrics;
  CREATE POLICY "Anyone can view public metrics"
    ON open_data_metrics FOR SELECT
    USING (is_public = true OR auth.jwt() ->> 'role' = 'service_role');

  DROP POLICY IF EXISTS "Anyone can view published datasets" ON research_datasets;
  CREATE POLICY "Anyone can view published datasets"
    ON research_datasets FOR SELECT
    USING (is_published = true OR auth.jwt() ->> 'role' = 'service_role');

  DROP POLICY IF EXISTS "Users can view own API keys" ON open_data_api_keys;
  CREATE POLICY "Users can view own API keys"
    ON open_data_api_keys FOR SELECT
    USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

  DROP POLICY IF EXISTS "Service role full access to dataset_access_requests" ON dataset_access_requests;
  CREATE POLICY "Service role full access to dataset_access_requests"
    ON dataset_access_requests FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');
END
$$;

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Apply updated_at triggers to all tables with updated_at column
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN (
      'copyright_verifications', 'copyright_clearances', 'dmca_takedowns',
      'copyright_registrations', 'copyright_monitoring',
      'accessibility_content', 'accessibility_requests', 'sign_language_interpreters',
      'accessibility_compliance',
      'carbon_footprint_tracking', 'carbon_offset_transactions',
      'sustainability_profiles', 'open_data_metrics', 'research_datasets',
      'open_data_api_keys', 'dataset_access_requests',
      'learning_modules', 'learning_enrollments', 'ai_tutor_sessions'
    )
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END
$$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Query to verify all tables were created successfully
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
  'copyright_verifications', 'copyright_clearances', 'dmca_takedowns', 'copyright_registrations', 'copyright_monitoring',
  'accessibility_content', 'accessibility_requests', 'sign_language_interpreters', 'accessibility_compliance',
  'carbon_footprint_tracking', 'carbon_offset_transactions', 'sustainability_profiles', 'sustainability_achievements',
  'learning_modules', 'learning_enrollments', 'learning_certificates', 'ai_tutor_sessions',
  'open_data_metrics', 'research_datasets', 'open_data_api_keys', 'dataset_access_requests'
)
ORDER BY table_name;
