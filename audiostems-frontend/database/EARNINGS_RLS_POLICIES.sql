-- RLS Policies for Earnings System
-- Enable RLS and create proper access policies

-- 1. Enable RLS on earnings_log table
ALTER TABLE earnings_log ENABLE ROW LEVEL SECURITY;

-- 2. Service role can do everything (for APIs)
CREATE POLICY "earnings_log_service_role_access" ON earnings_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Artists can view their own earnings
CREATE POLICY "earnings_log_artist_view" ON earnings_log
FOR SELECT
USING (artist_id = auth.uid());

-- 4. Admins can manage all earnings
CREATE POLICY "earnings_log_admin_access" ON earnings_log
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM user_profiles 
    WHERE role IN ('super_admin', 'company_admin')
  )
);

-- 5. Artists can view their own wallet summary
-- (Since it's a view, it inherits permissions from earnings_log)

-- Verification
SELECT 'Earnings RLS policies created successfully' as message;
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'earnings_log';
