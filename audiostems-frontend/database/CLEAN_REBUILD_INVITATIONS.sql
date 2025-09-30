-- CLEAN REBUILD OF INVITATION SYSTEM
-- Delete all inconsistent data and rebuild properly

-- 1. CLEAN SLATE - Remove all invitation data
DROP TABLE IF EXISTS artist_invitations CASCADE;
DROP TABLE IF EXISTS artist_label_relationships CASCADE;

-- 2. RECREATE TABLES with proper structure
CREATE TABLE artist_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label_admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  artist_first_name TEXT,
  artist_last_name TEXT,
  artist_search_name TEXT,
  personal_message TEXT,
  label_split_percentage DECIMAL(5,2),
  artist_split_percentage DECIMAL(5,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  response_note TEXT
);

CREATE TABLE artist_label_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  label_admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  label_split_percentage DECIMAL(5,2),
  artist_split_percentage DECIMAL(5,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. GRANT PERMISSIONS
GRANT ALL ON artist_invitations TO service_role;
GRANT ALL ON artist_label_relationships TO service_role;

-- 4. NO TEST DATA - Let the system work naturally
-- The frontend will create invitations with the proper authenticated user IDs

-- 5. VERIFY TABLES EXIST
SELECT 'Tables created successfully' as status;
SELECT table_name FROM information_schema.tables WHERE table_name IN ('artist_invitations', 'artist_label_relationships');
