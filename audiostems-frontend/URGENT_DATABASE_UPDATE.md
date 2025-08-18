# 🚨 URGENT: Database Schema Update Required

## Problem
Registration is failing with error: `Could not find the 'country' column of 'user_profiles' in the schema cache`

## Solution
**You MUST run this SQL in your Supabase SQL Editor:**

```sql
-- Add contact fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS country_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);

-- Update the address column to be more specific (if it doesn't exist)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS street_address TEXT;

-- Add comments for clarity
COMMENT ON COLUMN public.user_profiles.country_code IS 'International phone country code (e.g., +44, +1)';
COMMENT ON COLUMN public.user_profiles.phone_number IS 'User phone number without country code';
COMMENT ON COLUMN public.user_profiles.postal_code IS 'Postal code, zip code, or postcode depending on country';
COMMENT ON COLUMN public.user_profiles.address IS 'Street address or full address';
```

## Steps:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL above
4. Click "Run"
5. Try registration again

## What This Adds:
- ✅ `country` column (missing and causing the error)
- ✅ `country_code` column for phone numbers
- ✅ `phone_number` column 
- ✅ `postal_code` column
- ✅ All columns are added safely with `IF NOT EXISTS`

**After running this SQL, registration will work properly! 🎉**

