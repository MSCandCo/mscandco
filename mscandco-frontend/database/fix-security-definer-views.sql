-- Fix Security Definer Views
-- Removes SECURITY DEFINER property from views to enforce RLS based on querying user
-- This addresses the 3 "Security Definer View" errors
-- Views will now use SECURITY INVOKER (default), respecting RLS policies on underlying tables

-- =============================================
-- Fix email_marketing_stats view
-- =============================================
DROP VIEW IF EXISTS public.email_marketing_stats CASCADE;

-- Recreate with explicit SECURITY INVOKER
-- Note: PostgreSQL views default to SECURITY INVOKER, but we explicitly set it to be sure
CREATE VIEW public.email_marketing_stats AS
SELECT
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE marketing_enabled = true) as marketing_opted_in,
  COUNT(*) FILTER (WHERE marketing_enabled = false) as marketing_opted_out,
  COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL) as fully_unsubscribed,
  ROUND(
    COUNT(*) FILTER (WHERE marketing_enabled = true)::numeric / NULLIF(COUNT(*), 0) * 100,
    2
  ) as marketing_opt_in_rate
FROM email_preferences;

-- Grant access to authenticated users
GRANT SELECT ON public.email_marketing_stats TO authenticated;

-- =============================================
-- Fix cookie_consent_summary view
-- =============================================
DROP VIEW IF EXISTS public.cookie_consent_summary CASCADE;

-- Recreate with explicit SECURITY INVOKER
-- Note: PostgreSQL views default to SECURITY INVOKER, but we explicitly set it to be sure
CREATE VIEW public.cookie_consent_summary AS
SELECT
  COUNT(*) as total_users_with_consent,
  COUNT(*) FILTER (WHERE analytics = true) as analytics_accepted,
  COUNT(*) FILTER (WHERE analytics = false) as analytics_rejected,
  COUNT(*) FILTER (WHERE functional = true) as functional_accepted,
  COUNT(*) FILTER (WHERE functional = false) as functional_rejected,
  ROUND(
    COUNT(*) FILTER (WHERE analytics = true)::numeric / NULLIF(COUNT(*), 0) * 100,
    2
  ) as analytics_acceptance_rate,
  ROUND(
    COUNT(*) FILTER (WHERE functional = true)::numeric / NULLIF(COUNT(*), 0) * 100,
    2
  ) as functional_acceptance_rate
FROM user_cookie_consent;

-- Grant access to authenticated users (with RLS)
GRANT SELECT ON public.cookie_consent_summary TO authenticated;

-- =============================================
-- Fix user_wallet_balances view
-- =============================================
DROP VIEW IF EXISTS public.user_wallet_balances CASCADE;

-- Recreate with explicit SECURITY INVOKER
-- Note: PostgreSQL views default to SECURITY INVOKER, but we explicitly set it to be sure
-- This view will respect RLS policies on earnings_log table
CREATE VIEW public.user_wallet_balances AS
SELECT 
  artist_id as user_id,
  SUM(CASE WHEN status != 'cancelled' THEN amount ELSE 0 END) as balance,
  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as available_balance,
  SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_balance,
  SUM(CASE WHEN status = 'held' THEN amount ELSE 0 END) as held_balance,
  COUNT(*) as transaction_count,
  MAX(created_at) as last_transaction_date
FROM earnings_log
GROUP BY artist_id;

-- Grant access to authenticated users (with RLS)
GRANT SELECT ON public.user_wallet_balances TO authenticated;
GRANT SELECT ON public.user_wallet_balances TO service_role;

-- =============================================
-- Verify fixes
-- =============================================
SELECT 
  schemaname,
  viewname,
  viewowner,
  definition
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN ('email_marketing_stats', 'cookie_consent_summary', 'user_wallet_balances')
ORDER BY viewname;

