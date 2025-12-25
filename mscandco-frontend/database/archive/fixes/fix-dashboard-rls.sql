-- Fix RLS policies for dashboard data access
-- Run this in Supabase SQL Editor

-- 1. Fix notifications table RLS
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

-- 2. Ensure user_permissions table is readable
DROP POLICY IF EXISTS "Users can view their own permissions" ON user_permissions;
CREATE POLICY "Users can view their own permissions" ON user_permissions
FOR SELECT USING (auth.uid() = user_id);

-- 3. Ensure permissions table is readable by authenticated users
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON permissions;
CREATE POLICY "Authenticated users can view permissions" ON permissions
FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Ensure releases table is readable by owners
DROP POLICY IF EXISTS "Users can view their own releases" ON releases;
CREATE POLICY "Users can view their own releases" ON releases
FOR SELECT USING (
  auth.uid() = artist_id 
  OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'company_admin')
  )
);

-- 5. Ensure earnings_log is readable by owners
DROP POLICY IF EXISTS "Users can view their own earnings" ON earnings_log;
CREATE POLICY "Users can view their own earnings" ON earnings_log
FOR SELECT USING (
  auth.uid() = artist_id 
  OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'company_admin')
  )
);

-- 6. Ensure revenue_reports is readable
DROP POLICY IF EXISTS "Users can view their own revenue reports" ON revenue_reports;
CREATE POLICY "Users can view their own revenue reports" ON revenue_reports
FOR SELECT USING (
  auth.uid() = artist_id 
  OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'company_admin')
  )
);

-- 7. Ensure onboarding_progress is readable
DROP POLICY IF EXISTS "Users can view their own onboarding progress" ON onboarding_progress;
CREATE POLICY "Users can view their own onboarding progress" ON onboarding_progress
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

COMMENT ON POLICY "Users can view their own notifications" ON notifications IS 'Fixed for dashboard access';
COMMENT ON POLICY "Users can view their own permissions" ON user_permissions IS 'Fixed for dashboard access';
COMMENT ON POLICY "Authenticated users can view permissions" ON permissions IS 'Fixed for dashboard access';
COMMENT ON POLICY "Users can view their own releases" ON releases IS 'Fixed for dashboard access';
COMMENT ON POLICY "Users can view their own earnings" ON earnings_log IS 'Fixed for dashboard access';
COMMENT ON POLICY "Users can view their own revenue reports" ON revenue_reports IS 'Fixed for dashboard access';
COMMENT ON POLICY "Users can view their own onboarding progress" ON onboarding_progress IS 'Fixed for dashboard access';

