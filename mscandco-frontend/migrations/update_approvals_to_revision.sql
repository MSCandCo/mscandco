-- Update all releases with 'approvals' status to 'revision'
UPDATE releases
SET status = 'revision'
WHERE status = 'approvals';

-- Verify the update
SELECT status, COUNT(*) as count
FROM releases
GROUP BY status;
