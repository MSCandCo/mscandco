-- ============================================================================
-- FIX: Remove NOT NULL constraints from revenue_splits user_id columns
-- ============================================================================
-- The artist_id and label_admin_id columns should be nullable
-- Only one of them needs to be set (enforced by check_one_user constraint)
-- ============================================================================

-- Check current constraints
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_name = 'revenue_splits'
AND column_name IN ('artist_id', 'label_admin_id');

-- Remove NOT NULL constraint if it exists (PostgreSQL doesn't have a direct way, so we'll alter the column)
-- First, let's see what constraints exist
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'revenue_splits'::regclass
AND conname LIKE '%artist_id%' OR conname LIKE '%label_admin_id%';

-- Make sure columns are nullable (this will fail if they're already nullable, which is fine)
ALTER TABLE revenue_splits 
ALTER COLUMN artist_id DROP NOT NULL;

ALTER TABLE revenue_splits 
ALTER COLUMN label_admin_id DROP NOT NULL;

SELECT '✅ Columns updated to be nullable' as status;

