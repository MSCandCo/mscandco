-- FIX SUBSCRIPTION TABLE
-- Correct the subscription entries to match the proper platform structure

-- First, let's see what we currently have
SELECT 
    s.id,
    s.user_id,
    u.email,
    s.tier,
    s.status,
    ura.role_name
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
LEFT JOIN user_role_assignments ura ON u.id = ura.user_id
ORDER BY u.email;

-- Check which users should actually have subscriptions
SELECT 
    u.email,
    ura.role_name,
    CASE 
        WHEN ura.role_name = 'artist' THEN 'NEEDS subscription (artist_starter or artist_pro)'
        WHEN ura.role_name = 'label_admin' THEN 'NEEDS subscription (label_admin)'
        ELSE 'NO subscription needed'
    END as subscription_requirement
FROM auth.users u
LEFT JOIN user_role_assignments ura ON u.id = ura.user_id
ORDER BY u.email;

-- Fix info@htay.co.uk to be artist_pro (as requested)
UPDATE subscriptions 
SET 
    tier = 'artist_pro',
    status = 'active'
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'info@htay.co.uk'
);

-- Fix labeladmin@mscandco.com to be label_admin 
UPDATE subscriptions 
SET 
    tier = 'label_admin',
    status = 'active'
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'labeladmin@mscandco.com'
);

-- Delete subscription entries for users who shouldn't have them
-- (Company Admin, Distribution Partner, Super Admin don't need subscriptions)
DELETE FROM subscriptions 
WHERE user_id IN (
    SELECT u.id 
    FROM auth.users u
    JOIN user_role_assignments ura ON u.id = ura.user_id
    WHERE ura.role_name IN ('company_admin', 'distribution_partner', 'super_admin')
);

-- Verify the final result
SELECT 
    s.id,
    s.user_id,
    u.email,
    s.tier,
    s.status,
    ura.role_name,
    'CORRECT' as verification
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
LEFT JOIN user_role_assignments ura ON u.id = ura.user_id
ORDER BY u.email;
