-- Create PostgreSQL roles that the system expects
-- This fixes the "role 'artist' does not exist" error

-- Create the PostgreSQL roles (these are different from our user_roles table)
DO $$ 
BEGIN
    -- Create artist role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'artist') THEN
        CREATE ROLE artist;
    END IF;
    
    -- Create label_admin role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'label_admin') THEN
        CREATE ROLE label_admin;
    END IF;
    
    -- Create company_admin role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'company_admin') THEN
        CREATE ROLE company_admin;
    END IF;
    
    -- Create super_admin role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'super_admin') THEN
        CREATE ROLE super_admin;
    END IF;
END $$;

-- Grant necessary permissions to these roles
GRANT USAGE ON SCHEMA public TO artist, label_admin, company_admin, super_admin;
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO artist, label_admin, company_admin, super_admin;
GRANT SELECT ON public.user_roles TO artist, label_admin, company_admin, super_admin;
GRANT SELECT ON public.user_role_assignments TO artist, label_admin, company_admin, super_admin;

-- Grant the authenticated role to these roles so they can be used by authenticated users
GRANT artist TO authenticated;
GRANT label_admin TO authenticated;
GRANT company_admin TO authenticated; 
GRANT super_admin TO authenticated;

-- Verify roles were created
SELECT 'PostgreSQL roles created successfully' as status;
SELECT rolname as created_roles FROM pg_roles WHERE rolname IN ('artist', 'label_admin', 'company_admin', 'super_admin');
