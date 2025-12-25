-- FIX RLS POLICIES FOR LABEL ADMIN ACCESS

-- Allow label admins to read their own sent invitations
CREATE POLICY "label_admins_read_own_invitations" ON artist_invitations
FOR SELECT
USING (
  auth.uid() = label_admin_id 
  OR auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('super_admin', 'company_admin'))
);

-- Allow label admins to read artist profiles for search
CREATE POLICY "label_admins_read_artists" ON user_profiles
FOR SELECT
USING (
  role = 'artist'
  OR auth.uid() = id
  OR auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('super_admin', 'company_admin', 'label_admin'))
);

-- Verify policies created
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('artist_invitations', 'user_profiles') 
AND policyname IN ('label_admins_read_own_invitations', 'label_admins_read_artists');
