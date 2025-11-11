-- =====================================================
-- MASTER MIGRATION: ALL GRANT FEATURES
-- Comprehensive deployment of all 5 grant-focused features
-- =====================================================

-- This master script applies all grant feature schemas in order
-- Execute this on your Supabase database to deploy all features

-- Set session parameters for safety
SET statement_timeout = '60s';
SET lock_timeout = '10s';

BEGIN;

\echo 'Starting Grant Features Migration...'
\echo ''

-- =====================================================
-- 1. AI MUSIC RIGHTS & COPYRIGHT VERIFICATION
-- =====================================================
\echo '1/5: Deploying AI Music Rights & Copyright Verification System...'

\i GRANT_FEATURES_COPYRIGHT_VERIFICATION.sql

\echo '✓ Copyright verification system deployed'
\echo ''

-- =====================================================
-- 2. SUSTAINABILITY & CARBON TRACKING
-- =====================================================
\echo '2/5: Deploying Sustainability & Carbon Tracking System...'

\i GRANT_FEATURES_SUSTAINABILITY_CARBON.sql

\echo '✓ Carbon tracking system deployed'
\echo ''

-- =====================================================
-- 3. ACCESSIBILITY FEATURES
-- =====================================================
\echo '3/5: Deploying Accessibility Features System...'

\i GRANT_FEATURES_ACCESSIBILITY.sql

\echo '✓ Accessibility features deployed'
\echo ''

-- =====================================================
-- 4. OPEN DATA COMPONENT
-- =====================================================
\echo '4/5: Deploying Open Data Component...'

\i GRANT_FEATURES_OPEN_DATA.sql

\echo '✓ Open data component deployed'
\echo ''

-- =====================================================
-- 5. SKILLS DEVELOPMENT MODULE
-- =====================================================
\echo '5/5: Deploying Skills Development Module...'

\i GRANT_FEATURES_SKILLS_DEVELOPMENT.sql

\echo '✓ Skills development module deployed'
\echo ''

-- =====================================================
-- GRANT FEATURES METADATA
-- =====================================================
\echo 'Creating grant features metadata table...'

CREATE TABLE IF NOT EXISTS public.grant_features_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    feature_name TEXT NOT NULL UNIQUE,
    feature_description TEXT,
    grant_relevance TEXT, -- Which grants this appeals to
    deployment_status TEXT CHECK (deployment_status IN ('active', 'testing', 'maintenance', 'disabled')),

    -- Metrics
    total_users INTEGER DEFAULT 0,
    total_usage_count INTEGER DEFAULT 0,

    -- Grant reporting
    social_impact_description TEXT,
    innovation_description TEXT,
    sustainability_description TEXT,

    deployed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert feature metadata
INSERT INTO public.grant_features_metadata (feature_name, feature_description, grant_relevance, deployment_status, social_impact_description, innovation_description, sustainability_description)
VALUES
(
    'AI Copyright Verification',
    'Automated detection of potential copyright conflicts before distribution',
    'EIC Accelerator, Innovate UK - Addresses major industry pain point and shows social responsibility',
    'active',
    'Protects artists from legal issues and promotes fair use of creative works',
    'AI-powered audio fingerprinting and melody pattern matching using machine learning',
    'Reduces legal disputes and supports ethical music distribution'
),
(
    'Carbon Footprint Tracking',
    'Calculate and display carbon footprint of streaming distribution with offset options',
    'Horizon Europe, Innovate UK - Strong ESG and climate tech angle',
    'active',
    'Raises awareness of digital carbon footprint and enables carbon-neutral music distribution',
    'Real-time carbon calculation integrated with streaming analytics',
    'Direct environmental impact through carbon offsetting and transparency'
),
(
    'Accessibility Features',
    'AI-generated audio descriptions, transcriptions, translations, and sign language support',
    'EIC Accelerator, Horizon Europe - Mandatory for EU grants, demonstrates inclusion',
    'active',
    'Makes music accessible to people with disabilities, supports 15% of global population',
    'Multi-language AI translation and sign language avatar integration',
    'Promotes inclusive culture and removes barriers to music enjoyment'
),
(
    'Open Data Platform',
    'Publish anonymized industry insights and provide public API for researchers',
    'Horizon Europe - Open science and data sharing requirements',
    'active',
    'Contributes to music industry research and enables data-driven policy decisions',
    'Advanced data anonymization and researcher collaboration platform',
    'Supports academic research and transparent industry practices'
),
(
    'Skills Development',
    'AI-powered tutorials and certification system for independent artists',
    'Innovate UK, UK Government - Skills development and leveling up priorities',
    'active',
    'Empowers independent artists with professional skills, reduces industry barriers',
    'Personalized AI tutoring and industry-recognized certification',
    'Economic inclusion and democratization of music industry knowledge'
);

ALTER TABLE public.grant_features_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view grant features metadata"
    ON public.grant_features_metadata FOR SELECT
    USING (true);

GRANT SELECT ON public.grant_features_metadata TO anon, authenticated;
GRANT ALL ON public.grant_features_metadata TO service_role;

\echo '✓ Grant features metadata created'
\echo ''

COMMIT;

\echo ''
\echo '╔════════════════════════════════════════════════════════════╗'
\echo '║  ✅ ALL GRANT FEATURES DEPLOYED SUCCESSFULLY!              ║'
\echo '╚════════════════════════════════════════════════════════════╝'
\echo ''
\echo 'Features deployed:'
\echo '  1. ✓ AI Music Rights & Copyright Verification'
\echo '  2. ✓ Sustainability & Carbon Tracking Dashboard'
\echo '  3. ✓ Accessibility Features (Audio descriptions, translations, sign language)'
\echo '  4. ✓ Open Data Component (Public API and datasets)'
\echo '  5. ✓ Skills Development Module (AI tutoring and certification)'
\echo ''
\echo 'Next steps:'
\echo '  1. Verify tables created: SELECT tablename FROM pg_tables WHERE schemaname = ''public'' AND tablename LIKE ''%copyright%'' OR tablename LIKE ''%carbon%'' OR tablename LIKE ''%accessibility%'' OR tablename LIKE ''%open_data%'' OR tablename LIKE ''%learning%'';'
\echo '  2. Test RLS policies'
\echo '  3. Deploy frontend components'
\echo '  4. Update MCP server with new tools'
\echo '  5. Create grant application documentation'
\echo ''
\echo 'For rollback: Contact admin to restore from backup before this migration'
\echo ''
