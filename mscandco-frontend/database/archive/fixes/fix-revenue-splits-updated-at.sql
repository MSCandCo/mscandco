-- ============================================================================
-- FIX: Ensure updated_at column exists in revenue_splits table
-- ============================================================================
-- This script ensures the updated_at column exists and has proper defaults
-- ============================================================================

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'revenue_splits'
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE revenue_splits 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Added updated_at column to revenue_splits';
    ELSE
        RAISE NOTICE 'updated_at column already exists in revenue_splits';
    END IF;
END $$;

-- Ensure updated_at has a default value
ALTER TABLE revenue_splits 
ALTER COLUMN updated_at SET DEFAULT NOW();

-- Create or replace trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_revenue_splits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_revenue_splits_updated_at_trigger ON revenue_splits;

-- Create trigger to auto-update updated_at on UPDATE
CREATE TRIGGER update_revenue_splits_updated_at_trigger
BEFORE UPDATE ON revenue_splits
FOR EACH ROW
EXECUTE FUNCTION update_revenue_splits_updated_at();

-- Update any existing rows that have NULL updated_at
UPDATE revenue_splits 
SET updated_at = COALESCE(updated_at, created_at, NOW())
WHERE updated_at IS NULL;

SELECT '✅ updated_at column ensured and trigger created for revenue_splits table' as status;

