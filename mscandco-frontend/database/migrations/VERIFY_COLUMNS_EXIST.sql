-- ============================================================================
-- VERIFY COMMUNITY FEATURES COLUMNS EXIST
-- ============================================================================
-- Run this in Supabase SQL Editor to check if the columns have been added
-- ============================================================================

SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name IN (
    'show_accessibility_features',
    'show_open_data_features',
    'show_sustainability_features',
    'show_lyrics_features',
    'show_copyright_features',
    'show_learning_features'
  )
ORDER BY column_name;

-- ============================================================================
-- Expected Result: 6 rows showing all the columns
-- If you see fewer than 6 rows, you need to run the migration!
-- ============================================================================
