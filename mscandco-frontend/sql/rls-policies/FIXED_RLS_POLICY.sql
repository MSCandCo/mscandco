-- ========================================
-- SIMPLIFIED RLS POLICIES FOR change_requests
-- ========================================
-- This avoids nested queries that might fail due to RLS on user_profiles

-- Drop all existing policies
DROP POLICY IF EXISTS "admins_can_view_all_requests" ON change_requests;
DROP POLICY IF EXISTS "users_can_view_own_requests" ON change_requests;
DROP POLICY IF EXISTS "admins_can_update_requests" ON change_requests;
DROP POLICY IF EXISTS "admins_can_insert_requests" ON change_requests;
DROP POLICY IF EXISTS "users_can_create_own_requests" ON change_requests;

-- Enable RLS
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow all authenticated users to view all requests
-- We'll handle role-based filtering in the application layer if needed
CREATE POLICY "authenticated_users_can_view_requests" ON change_requests
FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy 2: Allow all authenticated users to update requests
CREATE POLICY "authenticated_users_can_update_requests" ON change_requests
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Policy 3: Allow all authenticated users to insert requests
CREATE POLICY "authenticated_users_can_insert_requests" ON change_requests
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy 4: Allow all authenticated users to delete requests
CREATE POLICY "authenticated_users_can_delete_requests" ON change_requests
FOR DELETE
USING (auth.role() = 'authenticated');
