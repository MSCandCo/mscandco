-- Enable Auto-Renewal for Subscriptions
-- Run this in Supabase SQL Editor to enable automatic subscription renewals

-- Add auto-renewal fields to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_renewal_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS renewal_failure_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS renewal_failure_reason TEXT,
ADD COLUMN IF NOT EXISTS insufficient_funds_notified BOOLEAN DEFAULT false;

-- Create indexes for efficient renewal queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal 
ON subscriptions(current_period_end, auto_renew, status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_failures
ON subscriptions(renewal_failure_count, insufficient_funds_notified);

-- Set auto_renew to true for all active subscriptions
UPDATE subscriptions 
SET auto_renew = true 
WHERE status = 'active' AND auto_renew IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN subscriptions.auto_renew IS 'Whether subscription should automatically renew from wallet';
COMMENT ON COLUMN subscriptions.last_renewal_attempt IS 'Timestamp of last renewal attempt';
COMMENT ON COLUMN subscriptions.renewal_failure_count IS 'Number of consecutive renewal failures';
COMMENT ON COLUMN subscriptions.renewal_failure_reason IS 'Reason for last renewal failure';
COMMENT ON COLUMN subscriptions.insufficient_funds_notified IS 'Whether user has been notified of insufficient funds';

-- Verify the changes
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(*) FILTER (WHERE auto_renew = true) as auto_renew_enabled,
  COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
  COUNT(*) FILTER (WHERE status = 'past_due') as past_due_subscriptions
FROM subscriptions;

-- Show subscriptions that would be processed by auto-renewal
SELECT 
  id,
  user_id,
  tier,
  amount,
  currency,
  billing_cycle,
  status,
  current_period_end,
  auto_renew,
  CASE 
    WHEN current_period_end < NOW() THEN 'DUE FOR RENEWAL'
    ELSE 'NOT DUE YET'
  END as renewal_status,
  EXTRACT(DAY FROM (NOW() - current_period_end)) as days_overdue
FROM subscriptions
WHERE status = 'active' AND auto_renew = true
ORDER BY current_period_end ASC
LIMIT 10;

