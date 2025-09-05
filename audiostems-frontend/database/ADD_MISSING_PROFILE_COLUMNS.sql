-- Add Missing Profile Columns - No Patching, Proper Schema Extension
-- Run this in Supabase SQL Editor

-- Add all missing profile columns that the frontend expects
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS artist_type TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT '+44';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS primary_genre TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS secondary_genre TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS years_active TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS record_label TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS facebook TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS twitter TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS youtube TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tiktok TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add wallet-related columns that the old system expects
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_currency TEXT DEFAULT 'GBP';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS negative_balance_allowed BOOLEAN DEFAULT FALSE;

-- Add subscription columns that are expected
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS wallet_currency TEXT DEFAULT 'GBP';
