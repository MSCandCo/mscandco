-- UPDATE USER TO PRO PLAN
-- This script updates info@htay.co.uk from Starter to Pro plan

-- First, let's check the current user and subscription
SELECT 
    u.email,
    up.firstName,
    up.lastName,
    us.plan,
    us.status,
    us.max_releases,
    us.advanced_analytics,
    us.amount,
    us.current_period_end
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE u.email = 'info@htay.co.uk';

-- Update the subscription to Pro plan
UPDATE user_subscriptions 
SET 
    plan = 'artist_pro',
    max_releases = -1,  -- -1 means unlimited
    advanced_analytics = TRUE,
    priority_support = TRUE,
    custom_branding = TRUE,
    amount = 29.99,  -- Pro plan price
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'info@htay.co.uk'
);

-- Verify the update
SELECT 
    u.email,
    up.firstName,
    up.lastName,
    us.plan,
    us.status,
    us.max_releases,
    us.advanced_analytics,
    us.priority_support,
    us.custom_branding,
    us.amount,
    us.current_period_end
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE u.email = 'info@htay.co.uk';
