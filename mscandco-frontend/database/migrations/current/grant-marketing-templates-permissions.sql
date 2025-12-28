-- ===========================================
-- Grant Database-Level Permissions for marketing_email_templates
-- ===========================================
-- Date: 2025-01-28
-- Purpose: Grant table-level permissions to service_role
-- ===========================================

-- Grant permissions to service_role (this is required in addition to RLS policies)
GRANT ALL ON marketing_email_templates TO service_role;
GRANT ALL ON marketing_email_templates TO authenticated;
GRANT ALL ON marketing_email_templates TO anon;

-- Also grant usage on the schema if needed
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant SELECT permission specifically to authenticated users
GRANT SELECT ON marketing_email_templates TO authenticated;

-- Grant usage on sequences if they exist (marketing_email_templates uses UUID, but just in case)
-- Note: Since the table uses UUID with gen_random_uuid(), there's no sequence to grant

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================
-- This grants database-level permissions (in addition to RLS policies)
-- Required for PostgreSQL to allow access even with RLS enabled

