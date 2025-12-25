-- Fix the label_percentage constraint on label_artist_affiliations table
-- This constraint is currently limiting to 0-50% but should allow 0-100%

-- Drop the old constraint
ALTER TABLE label_artist_affiliations
DROP CONSTRAINT IF EXISTS label_artist_affiliations_label_percentage_check;

-- Add the new constraint allowing 0-100%
ALTER TABLE label_artist_affiliations
ADD CONSTRAINT label_artist_affiliations_label_percentage_check
CHECK (((label_percentage >= (0)::numeric) AND (label_percentage <= (100)::numeric)));

-- Verify the constraint is updated
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'label_artist_affiliations'::regclass
AND conname = 'label_artist_affiliations_label_percentage_check';

-- Now retry creating the affiliation
INSERT INTO label_artist_affiliations (
    label_admin_id,
    artist_id,
    label_percentage,
    status,
    created_at
)
SELECT 
    label_admin_id,
    artist_id,
    label_percentage,
    'active',
    NOW()
FROM affiliation_requests
WHERE id = '5a3c7c08-f8d2-47e0-8d5d-fbcb6c431bdb'
AND status = 'accepted'
ON CONFLICT DO NOTHING;

-- Delete the duplicate pending invitation
DELETE FROM affiliation_requests
WHERE id = '3c40a0a0-c491-4fd6-bd05-1ded084df7ef'
AND status = 'pending';

-- Verify the results
SELECT 
    'ACTIVE AFFILIATIONS' as result_type,
    aff.id,
    aff.status,
    aff.label_percentage,
    la.email as label_admin_email,
    a.email as artist_email,
    a.artist_name
FROM label_artist_affiliations aff
LEFT JOIN user_profiles la ON aff.label_admin_id = la.id
LEFT JOIN user_profiles a ON aff.artist_id = a.id
ORDER BY aff.created_at DESC;

