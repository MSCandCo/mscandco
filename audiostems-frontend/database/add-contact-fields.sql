-- Add contact fields to user_profiles table
-- Run this in your Supabase SQL Editor

-- Add phone number and address fields to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS country_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);

-- Update the address column to be more specific (if it doesn't exist)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS street_address TEXT;

COMMENT ON COLUMN public.user_profiles.country_code IS 'International phone country code (e.g., +44, +1)';
COMMENT ON COLUMN public.user_profiles.phone_number IS 'User phone number without country code';
COMMENT ON COLUMN public.user_profiles.postal_code IS 'Postal code, zip code, or postcode depending on country';
COMMENT ON COLUMN public.user_profiles.address IS 'Street address or full address';
