-- UPDATE USER TO PRO PLAN (Simple Version)
-- This script updates info@htay.co.uk to Pro plan using the existing subscriptions table

-- First, let's check what subscription tables exist and their structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('subscriptions', 'user_subscriptions') 
ORDER BY table_name, ordinal_position;

-- Check current subscription for info@htay.co.uk
SELECT 
    s.*,
    u.email
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'info@htay.co.uk';

-- Update to Pro plan (adjust based on your actual table structure)
UPDATE subscriptions 
SET 
    tier = 'label_admin_pro',  -- or whatever the Pro plan is called in your system
    status = 'active'
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'info@htay.co.uk'
);

-- Verify the update
SELECT 
    s.*,
    u.email
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'info@htay.co.uk';
