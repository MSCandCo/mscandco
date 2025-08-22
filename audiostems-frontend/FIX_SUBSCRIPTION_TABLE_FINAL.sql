-- FIX SUBSCRIPTION TABLE - CORRECT STRUCTURE
-- This script fixes the subscription table to match the correct business model

-- First, let's see what we currently have
SELECT 
    s.id,
    u.email,
    s.tier,
    s.status,
    ura.role_name
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
LEFT JOIN user_role_assignments ura ON u.id = ura.user_id
ORDER BY u.email;

-- Delete all current incorrect subscriptions
DELETE FROM subscriptions;

-- Create correct subscriptions based on user roles
-- 1. Artist (info@htay.co.uk) should have artist_starter initially
INSERT INTO subscriptions (id, user_id, tier, status, started_at)
SELECT 
    gen_random_uuid(),
    u.id,
    'artist_starter',
    'active',
    NOW()
FROM auth.users u
JOIN user_role_assignments ura ON u.id = ura.user_id
WHERE u.email = 'info@htay.co.uk' 
AND ura.role_name = 'artist';

-- 2. Label Admin (labeladmin@mscandco.com) should have label_admin_starter initially
INSERT INTO subscriptions (id, user_id, tier, status, started_at)
SELECT 
    gen_random_uuid(),
    u.id,
    'label_admin_starter',
    'active',
    NOW()
FROM auth.users u
JOIN user_role_assignments ura ON u.id = ura.user_id
WHERE u.email = 'labeladmin@mscandco.com' 
AND ura.role_name = 'label_admin';

-- Verify the correct setup
SELECT 
    s.id,
    u.email,
    s.tier,
    s.status,
    ura.role_name,
    s.started_at
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
LEFT JOIN user_role_assignments ura ON u.id = ura.user_id
ORDER BY u.email;

-- Now upgrade info@htay.co.uk to artist_pro as requested
UPDATE subscriptions 
SET tier = 'artist_pro'
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'info@htay.co.uk'
);

-- Final verification
SELECT 
    s.id,
    u.email,
    s.tier,
    s.status,
    ura.role_name,
    CASE 
        WHEN s.tier = 'artist_starter' THEN '5 releases max'
        WHEN s.tier = 'artist_pro' THEN 'Unlimited releases'
        WHEN s.tier = 'label_admin_starter' THEN '4 artists, 8 releases max'
        WHEN s.tier = 'label_admin_pro' THEN 'Unlimited artists and releases'
        ELSE 'Unknown'
    END as plan_limits
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
LEFT JOIN user_role_assignments ura ON u.id = ura.user_id
ORDER BY u.email;
