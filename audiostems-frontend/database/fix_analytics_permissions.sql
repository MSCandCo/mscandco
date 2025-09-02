-- Fix analytics table permissions for service role access
-- Temporarily disable RLS to allow admin operations

ALTER TABLE artist_releases DISABLE ROW LEVEL SECURITY;
ALTER TABLE artist_milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE artist_rankings DISABLE ROW LEVEL SECURITY;
ALTER TABLE artist_career_snapshot DISABLE ROW LEVEL SECURITY;
ALTER TABLE artist_demographics DISABLE ROW LEVEL SECURITY;
ALTER TABLE artist_platform_performance DISABLE ROW LEVEL SECURITY;

-- Grant full access to service role
GRANT ALL ON artist_releases TO service_role;
GRANT ALL ON artist_milestones TO service_role;
GRANT ALL ON artist_rankings TO service_role;
GRANT ALL ON artist_career_snapshot TO service_role;
GRANT ALL ON artist_demographics TO service_role;
GRANT ALL ON artist_platform_performance TO service_role;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
