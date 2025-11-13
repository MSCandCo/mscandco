-- Drop all existing policies for change_requests
DROP POLICY IF EXISTS "admins_can_view_all_requests" ON change_requests;
DROP POLICY IF EXISTS "users_can_view_own_requests" ON change_requests;
DROP POLICY IF EXISTS "admins_can_update_requests" ON change_requests;
DROP POLICY IF EXISTS "users_can_create_requests" ON change_requests;
DROP POLICY IF EXISTS "admins_can_insert_requests" ON change_requests;
DROP POLICY IF EXISTS "users_can_create_own_requests" ON change_requests;

-- Enable RLS
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins can view all requests
CREATE POLICY "admins_can_view_all_requests" ON change_requests
FOR SELECT
USING (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'company_admin', 'requests_admin')
);

-- Policy 2: Admins can update all requests
CREATE POLICY "admins_can_update_requests" ON change_requests
FOR UPDATE
USING (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'company_admin', 'requests_admin')
);

-- Policy 3: Admins can insert requests
CREATE POLICY "admins_can_insert_requests" ON change_requests
FOR INSERT
WITH CHECK (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'company_admin', 'requests_admin')
);

-- Policy 4: Users can view their own requests
CREATE POLICY "users_can_view_own_requests" ON change_requests
FOR SELECT
USING (user_id = auth.uid());

-- Policy 5: Users can create their own requests
CREATE POLICY "users_can_create_own_requests" ON change_requests
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Verify policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles::text[],
  cmd
FROM pg_policies
WHERE tablename = 'change_requests'
ORDER BY policyname;
