-- FIX LABEL PERCENTAGE CONSTRAINT
-- Current constraint limits label_percentage to 0-50%, but it should be 0-100%

-- Drop the old constraint
ALTER TABLE affiliation_requests 
DROP CONSTRAINT IF EXISTS affiliation_requests_label_percentage_check;

-- Add new constraint allowing 0-100%
ALTER TABLE affiliation_requests 
ADD CONSTRAINT affiliation_requests_label_percentage_check 
CHECK (label_percentage >= 0 AND label_percentage <= 100);

-- Verify the fix
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'affiliation_requests'::regclass
  AND conname = 'affiliation_requests_label_percentage_check';

-- Test with a 70% split (should work now)
INSERT INTO affiliation_requests (
    label_admin_id,
    artist_id,
    artist_first_name,
    artist_last_name,
    artist_name,
    label_percentage,
    message,
    status,
    created_at
) VALUES (
    (SELECT id FROM user_profiles WHERE email = 'labeladmin@mscandco.com'),
    (SELECT id FROM user_profiles WHERE email = 'info@htay.co.uk'),
    'Henry',
    'Taylor',
    'Moses Bliss',
    70,
    'Test invitation with 70% split',
    'pending',
    NOW()
) RETURNING id, label_percentage, status;

