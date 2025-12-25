-- UNIFIED NOTIFICATION SYSTEM
-- One inbox handles invitations, earnings, payouts, releases, etc.

-- 1. CREATE notifications TABLE
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  type TEXT NOT NULL, -- 'invitation', 'earning', 'payout', 'release', 'analytics', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Type-specific data
  action_required BOOLEAN DEFAULT false,
  action_type TEXT, -- 'accept_decline', 'view', 'acknowledge', 'none'
  action_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. INDEXES for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_type ON notifications(user_id, type);

-- 3. RLS POLICIES
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_service_role" ON notifications
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. GRANT permissions
GRANT ALL ON notifications TO service_role;

-- 5. TEST notification
INSERT INTO notifications (
  user_id,
  type,
  title,
  message,
  data,
  action_required,
  action_type,
  action_url
) VALUES (
  '0a060de5-1c94-4060-a1c2-860224fc348d', -- Henry's ID
  'invitation',
  'New Label Invitation',
  'MSC & Co wants to manage your releases with 30% partnership',
  '{
    "invitation_id": "test-123",
    "label_admin_id": "12345678-1234-5678-9012-123456789012", 
    "label_split_percentage": 30,
    "artist_split_percentage": 70,
    "personal_message": "Join MSC & Co as our label partner"
  }',
  true,
  'accept_decline',
  '/artist/messages'
);

-- 6. Verify table creation
SELECT 'Notifications table created' as status;
SELECT COUNT(*) as notification_count FROM notifications;
