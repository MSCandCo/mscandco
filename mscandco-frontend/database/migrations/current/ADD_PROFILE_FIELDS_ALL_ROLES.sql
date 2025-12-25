-- Add profile fields for all user roles to user_profiles table
-- Run this in Supabase SQL Editor

-- Add Company Admin specific fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS position VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50);

-- Add Label Admin specific fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS label_name VARCHAR(255);

-- Add Distribution Partner specific fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS partner_type VARCHAR(50);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS territory VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS partnership_level VARCHAR(50);

-- Add Custom Admin specific fields
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS admin_level VARCHAR(50);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS permissions VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS access_level VARCHAR(50);

-- Add Professional Links (for business users)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255);

-- Add cache tracking columns to releases table
ALTER TABLE releases ADD COLUMN IF NOT EXISTS cache_updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS cached_artist_data JSONB;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS cached_label_data JSONB;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS cached_company_data JSONB;

-- Add foreign key references for cache relationships
ALTER TABLE releases ADD COLUMN IF NOT EXISTS label_admin_id UUID REFERENCES auth.users(id);
ALTER TABLE releases ADD COLUMN IF NOT EXISTS company_admin_id UUID REFERENCES auth.users(id);
ALTER TABLE releases ADD COLUMN IF NOT EXISTS distribution_partner_id UUID REFERENCES auth.users(id);
ALTER TABLE releases ADD COLUMN IF NOT EXISTS custom_admin_id UUID REFERENCES auth.users(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_name ON user_profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_label_name ON user_profiles(label_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_partner_type ON user_profiles(partner_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_admin_level ON user_profiles(admin_level);

CREATE INDEX IF NOT EXISTS idx_releases_cache_updated ON releases(cache_updated_at) WHERE cache_updated_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_releases_label_admin ON releases(label_admin_id);
CREATE INDEX IF NOT EXISTS idx_releases_company_admin ON releases(company_admin_id);
CREATE INDEX IF NOT EXISTS idx_releases_distribution_partner ON releases(distribution_partner_id);
CREATE INDEX IF NOT EXISTS idx_releases_custom_admin ON releases(custom_admin_id);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.company_name IS 'Company name for Company Admin and Distribution Partner users';
COMMENT ON COLUMN user_profiles.label_name IS 'Label name for Label Admin users';
COMMENT ON COLUMN user_profiles.partner_type IS 'Distribution partner type: Premium, Standard, Enterprise';
COMMENT ON COLUMN user_profiles.admin_level IS 'Custom admin level: Level 1-3, Senior Admin, Super Admin';
COMMENT ON COLUMN user_profiles.permissions IS 'Admin permissions: User Management, Content Management, etc.';

COMMENT ON COLUMN releases.cache_updated_at IS 'When cached profile data was last synced. NULL means needs refresh.';
COMMENT ON COLUMN releases.cached_artist_data IS 'Cached artist profile data for performance';
COMMENT ON COLUMN releases.cached_label_data IS 'Cached label profile data for performance';
COMMENT ON COLUMN releases.cached_company_data IS 'Cached company profile data for performance';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Profile fields added successfully for all user roles!';
    RAISE NOTICE 'Added fields: company_name, label_name, department, position, employee_id, partner_type, territory, partnership_level, admin_level, permissions, access_level, linkedin';
    RAISE NOTICE 'Added cache columns: cache_updated_at, cached_artist_data, cached_label_data, cached_company_data';
    RAISE NOTICE 'Added foreign keys: label_admin_id, company_admin_id, distribution_partner_id, custom_admin_id';
    RAISE NOTICE 'Performance indexes created for all new fields';
END $$;
