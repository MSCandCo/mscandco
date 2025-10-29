-- Migration: Welcome Email Trigger
-- Automatically sends welcome email when user verifies their email address
-- Created: 2025-10-29

-- First, ensure we have the pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to send welcome email via Edge Function
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_verification()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  user_display_name TEXT;
  function_url TEXT;
  request_id BIGINT;
BEGIN
  -- Only proceed if email is newly confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND
     (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at) THEN

    -- Get user email
    user_email := NEW.email;

    -- Get user name from user_profiles if exists
    SELECT
      COALESCE(display_name, name, 'there')
    INTO
      user_name
    FROM public.user_profiles
    WHERE id = NEW.id
    LIMIT 1;

    -- If user_profiles doesn't exist yet, use default
    IF user_name IS NULL THEN
      user_name := 'there';
    END IF;

    -- Build Edge Function URL
    function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-email';

    -- Call Edge Function to send welcome email asynchronously
    -- We use pg_net to make HTTP request without blocking
    SELECT net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'emailType', 'welcome',
        'to', user_email,
        'data', jsonb_build_object(
          'UserName', user_name,
          'DashboardURL', current_setting('app.settings.app_url', true) || '/dashboard'
        )
      ),
      timeout_milliseconds := 5000
    ) INTO request_id;

    -- Log the request (optional, for debugging)
    RAISE LOG 'Welcome email request sent for user % (request_id: %)', NEW.id, request_id;

  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the trigger
    RAISE WARNING 'Failed to send welcome email for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_user_email_confirmed ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_verification();

-- Set configuration variables
-- NOTE: These should be set to your actual Supabase URL and app URL
-- The service role key should be set via secrets for security

DO $$
BEGIN
  -- Set Supabase URL
  EXECUTE 'ALTER DATABASE ' || current_database() ||
    ' SET app.settings.supabase_url = ''https://fzqpoayhdisusgrotyfg.supabase.co''';

  -- Set App URL
  EXECUTE 'ALTER DATABASE ' || current_database() ||
    ' SET app.settings.app_url = ''https://mscandco.com''';

  RAISE NOTICE 'Configuration variables set successfully';
  RAISE NOTICE 'Remember to set app.settings.service_role_key via Supabase Dashboard > Project Settings > Database > Connection string';
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION net.http_post TO postgres, service_role;

-- Add comment for documentation
COMMENT ON FUNCTION public.send_welcome_email_on_verification() IS
  'Automatically sends welcome email via Edge Function when user verifies their email address';

-- Test query (commented out - uncomment to test manually)
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = 'your-user-id';
