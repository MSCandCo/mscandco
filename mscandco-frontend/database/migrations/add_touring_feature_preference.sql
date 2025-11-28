-- ================================
-- ADD TOURING FEATURE PREFERENCE COLUMN
-- ================================
-- This migration adds the show_touring_features column to user_profiles
-- for managing touring feature visibility in navigation
-- Created: 2025-01-XX

-- Add touring feature preference column
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS show_touring_features BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_touring_features ON user_profiles(show_touring_features);

-- Add comment
COMMENT ON COLUMN user_profiles.show_touring_features IS 'Controls visibility of touring features in navigation menu';



