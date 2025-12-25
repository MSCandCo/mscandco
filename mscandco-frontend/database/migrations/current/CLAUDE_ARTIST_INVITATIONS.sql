-- CLAUDE'S RECOMMENDED ARTIST INVITATION SYSTEM

-- 1. DROP existing tables if they exist
DROP TABLE IF EXISTS shared_earnings CASCADE;
DROP TABLE IF EXISTS label_artist_affiliations CASCADE;
DROP TABLE IF EXISTS affiliation_requests CASCADE;

-- 2. CREATE artist_invitations TABLE (Claude's structure)
CREATE TABLE artist_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_admin_id UUID REFERENCES user_profiles(id),
  artist_id UUID REFERENCES user_profiles(id),
  artist_first_name TEXT,
  artist_last_name TEXT,
  artist_search_name TEXT,
  personal_message TEXT,
  
  -- Revenue split
  label_split_percentage DECIMAL(5,2), -- e.g., 30.00 for 30%
  artist_split_percentage DECIMAL(5,2), -- e.g., 70.00 for 70%
  
  status TEXT DEFAULT 'pending', -- pending, accepted, declined, cancelled
  
  created_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  response_note TEXT
);

-- 3. CREATE artist_label_relationships TABLE (after acceptance)
CREATE TABLE artist_label_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES user_profiles(id),
  label_admin_id UUID REFERENCES user_profiles(id),
  label_split_percentage DECIMAL(5,2),
  artist_split_percentage DECIMAL(5,2),
  status TEXT DEFAULT 'active', -- active, inactive
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. RLS POLICIES
ALTER TABLE artist_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_label_relationships ENABLE ROW LEVEL SECURITY;

-- Label admins can see their own invitations
CREATE POLICY "label_admins_view_own_invitations" ON artist_invitations
FOR SELECT USING (
  auth.uid() = label_admin_id 
  OR auth.uid() = artist_id
  OR auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('super_admin', 'company_admin'))
);

-- Label admins can create invitations
CREATE POLICY "label_admins_create_invitations" ON artist_invitations
FOR INSERT WITH CHECK (auth.uid() = label_admin_id);

-- Artists can update their invitations (accept/decline)
CREATE POLICY "artists_respond_to_invitations" ON artist_invitations
FOR UPDATE USING (auth.uid() = artist_id);

-- 5. Grant service role access
GRANT ALL ON artist_invitations TO service_role;
GRANT ALL ON artist_label_relationships TO service_role;

-- 6. Test data
INSERT INTO artist_invitations (
  label_admin_id, 
  artist_id, 
  artist_first_name, 
  artist_last_name,
  artist_search_name,
  personal_message, 
  label_split_percentage, 
  artist_split_percentage
) VALUES (
  (SELECT id FROM user_profiles WHERE email = 'labeladmin@mscandco.com'),
  (SELECT id FROM user_profiles WHERE email = 'info@htay.co.uk'),
  'Henry',
  'Taylor', 
  'Moses Bliss',
  'Join MSC & Co as our label partner with 30% revenue sharing',
  30.00,
  70.00
) ON CONFLICT DO NOTHING;

-- 7. Verify data
SELECT 'artist_invitations' as table_name, COUNT(*) as count FROM artist_invitations;
SELECT * FROM artist_invitations;
