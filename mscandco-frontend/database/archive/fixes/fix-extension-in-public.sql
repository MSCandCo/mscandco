-- Fix Extension in Public Schema Warning
-- Moves pg_net extension to extensions schema to improve security
-- This addresses the "Extension in Public" warning

-- =============================================
-- Create extensions schema if it doesn't exist
-- =============================================
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- =============================================
-- Move pg_net extension to extensions schema
-- =============================================
-- Note: This may fail if pg_net is managed by Supabase and cannot be moved
-- If it fails, this is acceptable as pg_net is a Supabase-managed extension

DO $$
BEGIN
  -- Check if pg_net exists in public schema
  IF EXISTS (
    SELECT 1 
    FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE e.extname = 'pg_net'
    AND n.nspname = 'public'
  ) THEN
    -- Try to alter the extension schema
    -- This may fail if Supabase has restrictions
    BEGIN
      ALTER EXTENSION pg_net SET SCHEMA extensions;
      RAISE NOTICE 'Successfully moved pg_net extension to extensions schema';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not move pg_net extension: %. This is acceptable if it is Supabase-managed.', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'pg_net extension not found in public schema';
  END IF;
END $$;

-- =============================================
-- Verify extension location
-- =============================================
SELECT 
  e.extname as extension_name,
  n.nspname as schema_name,
  CASE 
    WHEN n.nspname = 'public' THEN '⚠️ In public schema'
    WHEN n.nspname = 'extensions' THEN '✅ In extensions schema'
    ELSE 'ℹ️ In ' || n.nspname || ' schema'
  END as status
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE e.extname = 'pg_net';

