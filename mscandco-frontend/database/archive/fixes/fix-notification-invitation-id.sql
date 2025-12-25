-- Check the notification with the wrong invitation ID
SELECT 
    id,
    user_id,
    type,
    title,
    data,
    created_at
FROM notifications
WHERE data::text LIKE '%6bde7225-9679-4e06-9192-b163357bb674%';

-- Update the notification to use the correct invitation ID (most recent one)
UPDATE notifications
SET data = jsonb_set(
    data::jsonb,
    '{invitation_id}',
    '"5a3c7c08-f8d2-47e0-8d5d-fbcb6c431bdb"'
)
WHERE data::text LIKE '%6bde7225-9679-4e06-9192-b163357bb674%'
RETURNING id, type, title, data;

-- Verify the update
SELECT 
    id,
    user_id,
    type,
    title,
    data->'invitation_id' as invitation_id,
    created_at
FROM notifications
WHERE type = 'invitation'
AND user_id = '0a060de5-1c94-4060-a1c2-860224fc348d'
ORDER BY created_at DESC;

