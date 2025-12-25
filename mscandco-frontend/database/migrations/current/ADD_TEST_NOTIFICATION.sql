-- ADD TEST NOTIFICATION (table already exists)
-- Skip table creation, just add test data

-- Grant permissions in case they're missing
GRANT ALL ON notifications TO service_role;

-- Add test notification for Henry
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
) ON CONFLICT DO NOTHING;

-- Verify
SELECT COUNT(*) as notification_count FROM notifications;
