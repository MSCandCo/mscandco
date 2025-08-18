-- =====================================================
-- TEMPORARILY DISABLE ALL DATABASE TRIGGERS
-- To isolate the Auth issue
-- =====================================================

-- Disable all triggers on user_profiles
DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON public.user_profiles;

-- Disable all triggers on artists
DROP TRIGGER IF EXISTS trigger_artists_updated_at ON public.artists;

-- Disable all triggers on releases
DROP TRIGGER IF EXISTS trigger_releases_updated_at ON public.releases;
DROP TRIGGER IF EXISTS trigger_auto_save_release ON public.releases;

-- Disable any other triggers that might exist
DROP TRIGGER IF EXISTS trigger_sync_profile_data ON public.user_profiles;
DROP TRIGGER IF EXISTS trigger_handle_new_user ON auth.users;

-- Check for any remaining triggers
SELECT 
    schemaname,
    tablename,
    triggername
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname IN ('public', 'auth')
AND NOT tgisinternal;

SELECT 'All triggers disabled for testing!' as status;
