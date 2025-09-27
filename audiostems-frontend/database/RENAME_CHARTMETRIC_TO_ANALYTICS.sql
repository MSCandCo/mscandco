-- STEP 1: Rename chartmetric_data to analytics_data for clarity
-- This makes the manual analytics system cleaner and removes Chartmetrics references

-- Rename the column in user_profiles table
ALTER TABLE user_profiles RENAME COLUMN chartmetric_data TO analytics_data;

-- Verify the column was renamed successfully
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('chartmetric_data', 'analytics_data');
