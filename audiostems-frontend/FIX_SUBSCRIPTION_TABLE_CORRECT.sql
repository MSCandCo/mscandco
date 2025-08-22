-- FIX SUBSCRIPTION TABLE - CORRECT VERSION
-- Set up proper subscriptions based on user roles

-- First, let's see what we currently have
SELECT 
    s.id,
    u.email,
    ura.role_name,
    s.tier,
    s.status,
    s.started_at
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
LEFT JOIN user_role_assignments ura ON u.id = ura.user_id
ORDER BY u.email;

-- Delete all current incorrect subscriptions
DELETE FROM subscriptions;

-- Add correct subscription for Artist (info@htay.co.uk) - STARTER PLAN
INSERT INTO subscriptions (
    id,
    user_id,
    tier,
    status,
    started_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'info@htay.co.uk'),
    'artist_starter',
    'active',
    NOW()
);

-- Add correct subscription for Label Admin (labeladmin@mscandco.com) - STARTER PLAN
INSERT INTO subscriptions (
    id,
    user_id,
    tier,
    status,
    started_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM auth.users WHERE email = 'labeladmin@mscandco.com'),
    'label_admin_starter',
    'active',
    NOW()
);

-- Verify the corrections
SELECT 
    s.id,
    u.email,
    ura.role_name,
    s.tier,
    s.status,
    s.started_at
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
LEFT JOIN user_role_assignments ura ON u.id = ura.user_id
ORDER BY u.email;
