-- Fix Critical RLS Security Issues
-- Generated: 2025-10-28
-- Priority: CRITICAL

-- ============================================
-- 1. ENABLE RLS ON ALL PUBLIC TABLES
-- ============================================

-- Enable RLS on tables that have it disabled
ALTER TABLE public.ghost_login_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. FIX user_metadata SECURITY VULNERABILITY
-- ============================================

-- Drop insecure policies that reference user_metadata
DROP POLICY IF EXISTS subscriptions_admin_read ON public.subscriptions;
DROP POLICY IF EXISTS subscriptions_admin_write ON public.subscriptions;
DROP POLICY IF EXISTS wallet_transactions_admin_read ON public.wallet_transactions;
DROP POLICY IF EXISTS wallet_transactions_admin_write ON public.wallet_transactions;

-- Create SECURE policies using user_profiles.role instead of user_metadata
-- Subscriptions policies
CREATE POLICY subscriptions_admin_read ON public.subscriptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('superadmin', 'admin')
  )
);

CREATE POLICY subscriptions_admin_write ON public.subscriptions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('superadmin', 'admin')
  )
);

-- Wallet transactions policies
CREATE POLICY wallet_transactions_admin_read ON public.wallet_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('superadmin', 'admin')
  )
  OR
  user_id = auth.uid()
);

CREATE POLICY wallet_transactions_admin_write ON public.wallet_transactions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('superadmin', 'admin')
  )
);

-- ============================================
-- 3. ADD RLS POLICIES FOR NEWLY ENABLED TABLES
-- ============================================

-- ghost_login_audit: Only superadmins can access
CREATE POLICY ghost_login_superadmin_only ON public.ghost_login_audit
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'superadmin'
  )
);

-- user_permissions: Users can read their own, superadmins can manage
CREATE POLICY user_permissions_read_own ON public.user_permissions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY user_permissions_superadmin_all ON public.user_permissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'superadmin'
  )
);

-- roles: Everyone can read, only superadmins can modify
CREATE POLICY roles_read_all ON public.roles
FOR SELECT
USING (true);

CREATE POLICY roles_superadmin_write ON public.roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'superadmin'
  )
);

-- permissions: Everyone can read, only superadmins can modify
CREATE POLICY permissions_read_all ON public.permissions
FOR SELECT
USING (true);

CREATE POLICY permissions_superadmin_write ON public.permissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'superadmin'
  )
);

-- role_permissions: Everyone can read, only superadmins can modify
CREATE POLICY role_permissions_read_all ON public.role_permissions
FOR SELECT
USING (true);

CREATE POLICY role_permissions_superadmin_write ON public.role_permissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'superadmin'
  )
);

-- permission_audit_log: Read own logs, superadmins read all
CREATE POLICY permission_audit_read_own ON public.permission_audit_log
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY permission_audit_superadmin_read ON public.permission_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'superadmin'
  )
);

-- ============================================
-- 4. VERIFY RLS IS ENABLED
-- ============================================

-- Create a verification function
CREATE OR REPLACE FUNCTION verify_rls_enabled()
RETURNS TABLE(table_name text, rls_enabled boolean) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tablename::text,
    rowsecurity::boolean
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION verify_rls_enabled() TO authenticated;

COMMENT ON FUNCTION verify_rls_enabled() IS 'Verify RLS is enabled on all public tables';
