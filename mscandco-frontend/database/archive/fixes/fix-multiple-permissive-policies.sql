-- Fix Multiple Permissive Policies
-- Consolidates multiple permissive policies into single policies per action
-- This addresses the remaining 12 "Multiple Permissive Policies" warnings

-- =============================================
-- Fix artist_requests
-- =============================================
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  -- Drop all existing policies
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'artist_requests' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON artist_requests', policy_record.policyname);
  END LOOP;
  
  -- Create consolidated policies
  -- SELECT: admin OR own access
  CREATE POLICY "artist_requests_select" ON artist_requests
    FOR SELECT TO authenticated
    USING (
      is_admin_user() OR
      (select auth.uid()) = to_artist_id OR
      (select auth.uid()) = from_label_id
    );
  
  -- INSERT: admin OR label admin creating request
  CREATE POLICY "artist_requests_insert" ON artist_requests
    FOR INSERT TO authenticated
    WITH CHECK (
      is_admin_user() OR
      (select auth.uid()) = from_label_id
    );
  
  -- UPDATE: admin OR artist responding to request
  CREATE POLICY "artist_requests_update" ON artist_requests
    FOR UPDATE TO authenticated
    USING (
      is_admin_user() OR
      (select auth.uid()) = to_artist_id
    )
    WITH CHECK (
      is_admin_user() OR
      (select auth.uid()) = to_artist_id
    );
  
  -- DELETE: admin only
  CREATE POLICY "artist_requests_delete" ON artist_requests
    FOR DELETE TO authenticated
    USING (is_admin_user());
END $$;

-- =============================================
-- Fix navigation_menus
-- =============================================
DO $$
DECLARE
  policy_record RECORD;
  has_public_read BOOLEAN;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'navigation_menus' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON navigation_menus', policy_record.policyname);
  END LOOP;
  
  -- Check if public_read column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'navigation_menus' 
    AND column_name = 'public_read'
  ) INTO has_public_read;
  
  -- SELECT: admin OR public read (if public_read column exists)
  IF has_public_read THEN
    CREATE POLICY "navigation_menus_select" ON navigation_menus
      FOR SELECT TO authenticated
      USING (
        is_admin_user() OR
        public_read = true
      );
  ELSE
    CREATE POLICY "navigation_menus_select" ON navigation_menus
      FOR SELECT TO authenticated
      USING (is_admin_user());
  END IF;
  
  -- Admin manage (INSERT, UPDATE, DELETE only - SELECT is handled by navigation_menus_select)
  CREATE POLICY "navigation_menus_admin_insert" ON navigation_menus
    FOR INSERT TO authenticated
    WITH CHECK (is_admin_user());
  
  CREATE POLICY "navigation_menus_admin_update" ON navigation_menus
    FOR UPDATE TO authenticated
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
  
  CREATE POLICY "navigation_menus_admin_delete" ON navigation_menus
    FOR DELETE TO authenticated
    USING (is_admin_user());
END $$;

-- =============================================
-- Fix permissions
-- =============================================
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'permissions' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON permissions', policy_record.policyname);
  END LOOP;
  
  -- SELECT: everyone can read
  CREATE POLICY "permissions_select" ON permissions
    FOR SELECT TO authenticated
    USING (true);
  
  -- Admin write (INSERT, UPDATE, DELETE only - SELECT is handled by permissions_select)
  CREATE POLICY "permissions_admin_insert" ON permissions
    FOR INSERT TO authenticated
    WITH CHECK (is_admin_user());
  
  CREATE POLICY "permissions_admin_update" ON permissions
    FOR UPDATE TO authenticated
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
  
  CREATE POLICY "permissions_admin_delete" ON permissions
    FOR DELETE TO authenticated
    USING (is_admin_user());
END $$;

-- =============================================
-- Fix role_permissions
-- =============================================
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'role_permissions' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON role_permissions', policy_record.policyname);
  END LOOP;
  
  -- SELECT: everyone can read
  CREATE POLICY "role_permissions_select" ON role_permissions
    FOR SELECT TO authenticated
    USING (true);
  
  -- Admin write (INSERT, UPDATE, DELETE only - SELECT is handled by role_permissions_select)
  CREATE POLICY "role_permissions_admin_insert" ON role_permissions
    FOR INSERT TO authenticated
    WITH CHECK (is_admin_user());
  
  CREATE POLICY "role_permissions_admin_update" ON role_permissions
    FOR UPDATE TO authenticated
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
  
  CREATE POLICY "role_permissions_admin_delete" ON role_permissions
    FOR DELETE TO authenticated
    USING (is_admin_user());
END $$;

-- =============================================
-- Fix roles
-- =============================================
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'roles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON roles', policy_record.policyname);
  END LOOP;
  
  -- SELECT: everyone can read
  CREATE POLICY "roles_select" ON roles
    FOR SELECT TO authenticated
    USING (true);
  
  -- Admin write (INSERT, UPDATE, DELETE only - SELECT is handled by roles_select)
  CREATE POLICY "roles_admin_insert" ON roles
    FOR INSERT TO authenticated
    WITH CHECK (is_admin_user());
  
  CREATE POLICY "roles_admin_update" ON roles
    FOR UPDATE TO authenticated
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
  
  CREATE POLICY "roles_admin_delete" ON roles
    FOR DELETE TO authenticated
    USING (is_admin_user());
END $$;

-- =============================================
-- Fix subscriptions
-- =============================================
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'subscriptions' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON subscriptions', policy_record.policyname);
  END LOOP;
  
  -- SELECT: own OR admin
  CREATE POLICY "subscriptions_select" ON subscriptions
    FOR SELECT TO authenticated
    USING (
      (select auth.uid()) = user_id OR
      is_admin_user()
    );
  
  -- UPDATE: own OR admin
  CREATE POLICY "subscriptions_update" ON subscriptions
    FOR UPDATE TO authenticated
    USING (
      (select auth.uid()) = user_id OR
      is_admin_user()
    )
    WITH CHECK (
      (select auth.uid()) = user_id OR
      is_admin_user()
    );
  
  -- INSERT/DELETE: admin only
  CREATE POLICY "subscriptions_admin_modify" ON subscriptions
    FOR INSERT TO authenticated
    WITH CHECK (is_admin_user());
  
  CREATE POLICY "subscriptions_admin_delete" ON subscriptions
    FOR DELETE TO authenticated
    USING (is_admin_user());
  
  -- Service role
  CREATE POLICY "subscriptions_service_role" ON subscriptions
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
END $$;

-- =============================================
-- Fix user_permissions
-- =============================================
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'user_permissions' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON user_permissions', policy_record.policyname);
  END LOOP;
  
  -- SELECT: own OR admin
  CREATE POLICY "user_permissions_select" ON user_permissions
    FOR SELECT TO authenticated
    USING (
      (select auth.uid()) = user_id OR
      is_admin_user()
    );
  
  -- Admin modify
  CREATE POLICY "user_permissions_admin_modify" ON user_permissions
    FOR INSERT TO authenticated
    WITH CHECK (is_admin_user());
  
  CREATE POLICY "user_permissions_admin_update" ON user_permissions
    FOR UPDATE TO authenticated
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
  
  CREATE POLICY "user_permissions_admin_delete" ON user_permissions
    FOR DELETE TO authenticated
    USING (is_admin_user());
END $$;

-- =============================================
-- Fix wallet_transactions
-- =============================================
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'wallet_transactions' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON wallet_transactions', policy_record.policyname);
  END LOOP;
  
  -- SELECT: own OR admin
  CREATE POLICY "wallet_transactions_select" ON wallet_transactions
    FOR SELECT TO authenticated
    USING (
      (select auth.uid()) = user_id OR
      is_admin_user()
    );
  
  -- INSERT: own OR admin
  CREATE POLICY "wallet_transactions_insert" ON wallet_transactions
    FOR INSERT TO authenticated
    WITH CHECK (
      (select auth.uid()) = user_id OR
      is_admin_user()
    );
  
  -- UPDATE/DELETE: admin only
  CREATE POLICY "wallet_transactions_admin_modify" ON wallet_transactions
    FOR UPDATE TO authenticated
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
  
  CREATE POLICY "wallet_transactions_admin_delete" ON wallet_transactions
    FOR DELETE TO authenticated
    USING (is_admin_user());
  
  -- Service role
  CREATE POLICY "wallet_transactions_service_role" ON wallet_transactions
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
END $$;

-- =============================================
-- Verify fixes
-- =============================================
SELECT 
  'Multiple Permissive Policies Consolidation Complete' as status,
  COUNT(*) as total_policies_optimized
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'artist_requests',
  'navigation_menus',
  'permissions',
  'role_permissions',
  'roles',
  'subscriptions',
  'user_permissions',
  'wallet_transactions'
);

