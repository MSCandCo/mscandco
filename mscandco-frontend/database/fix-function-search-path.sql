-- Fix Function Search Path Mutable Warnings
-- Sets search_path on functions to prevent search path injection attacks
-- This addresses the 3 "Function Search Path Mutable" warnings

-- =============================================
-- Fix auth_uid_cached function
-- =============================================
CREATE OR REPLACE FUNCTION auth_uid_cached()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.uid();
$$;

-- =============================================
-- Fix is_service_role function
-- =============================================
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
$$;

-- =============================================
-- Fix is_admin_user function
-- =============================================
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    (current_setting('request.jwt.claims', true)::json->>'email') IN (
      'superadmin@mscandco.com',
      'companyadmin@mscandco.com',
      'info@htay.co.uk'
    )
    OR
    (current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role') IN (
      'super_admin',
      'company_admin',
      'distribution_partner'
    )
    OR
    (current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role') IN (
      'super_admin',
      'company_admin',
      'distribution_partner'
    );
$$;

-- =============================================
-- Verify fixes
-- =============================================
SELECT 
  proname as function_name,
  prosecdef as is_security_definer,
  CASE 
    WHEN proconfig IS NULL THEN 'No search_path set'
    ELSE array_to_string(proconfig, ', ')
  END as search_path_config
FROM pg_proc
WHERE proname IN ('auth_uid_cached', 'is_service_role', 'is_admin_user')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

