-- REBUILD AUTHENTICATION SYSTEM FROM SCRATCH
-- No more patches - clean, proper solution

-- 1. CLEAN SLATE - Drop all inconsistent data
DROP TABLE IF EXISTS artist_invitations CASCADE;
DROP TABLE IF EXISTS artist_label_relationships CASCADE;
DELETE FROM user_profiles WHERE email = 'labeladmin@mscandco.com';

-- 2. REBUILD with proper authentication integration
-- Create user_profiles that match actual authentication
-- Get current user ID from frontend: c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a

INSERT INTO user_profiles (
    id,
    email,
    role,
    first_name,
    last_name,
    artist_name,
    created_at
) VALUES 
-- Label Admin (frontend user)
(
    'c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a',
    'labeladmin@mscandco.com', 
    'label_admin',
    'Label',
    'Admin',
    'MSC & Co',
    NOW()
),
-- Artist (ensure profile exists)
(
    '0a060de5-1c94-4060-a1c2-860224fc348d',
    'info@htay.co.uk',
    'artist', 
    'Henry',
    'Taylor',
    'Moses Bliss',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    email = EXCLUDED.email;

-- 3. RECREATE invitation tables with proper structure
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

-- 4. GRANT proper permissions
GRANT ALL ON artist_invitations TO service_role;
GRANT ALL ON artist_label_relationships TO service_role;

-- 5. CREATE test invitation with CORRECT IDs
INSERT INTO artist_invitations (
    label_admin_id,
    artist_id,
    artist_first_name,
    artist_last_name,
    artist_search_name,
    personal_message,
    label_split_percentage,
    artist_split_percentage,
    status
) VALUES (
    'c47cc6e8-8e4a-4b8a-9f1e-2c7d8b9e0f3a', -- Correct frontend user ID
    '0a060de5-1c94-4060-a1c2-860224fc348d', -- Henry's ID
    'Henry',
    'Taylor',
    'Moses Bliss',
    'MSC & Co would like to partner with you as our label with 30% revenue sharing.',
    30.00,
    70.00,
    'pending'
);

-- 6. VERIFY the clean rebuild
SELECT 'Clean user profiles' as table_name, id, email, role FROM user_profiles WHERE email IN ('labeladmin@mscandco.com', 'info@htay.co.uk');
SELECT 'Clean invitations' as table_name, label_admin_id, artist_first_name, status FROM artist_invitations;
