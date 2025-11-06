-- ============================================================================
-- FIX: revenue_splits constraint for floating-point precision
-- ============================================================================
-- The constraint check_percentages_total uses strict equality (= 100)
-- which fails due to floating-point precision issues.
-- This script updates it to use a tolerance check.
-- ============================================================================

-- Drop the old constraint
ALTER TABLE revenue_splits 
DROP CONSTRAINT IF EXISTS check_percentages_total;

-- Add new constraint with tolerance for floating-point precision
ALTER TABLE revenue_splits 
ADD CONSTRAINT check_percentages_total CHECK (
  ABS(artist_percentage + label_percentage - 100) < 0.01
);

-- Also check if there's a constraint named revenue_splits_total_100 (if it exists)
ALTER TABLE revenue_splits 
DROP CONSTRAINT IF EXISTS revenue_splits_total_100;

-- Verify the constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'revenue_splits'::regclass
  AND conname LIKE '%total%';

SELECT '✅ Constraint updated to handle floating-point precision' as status;

