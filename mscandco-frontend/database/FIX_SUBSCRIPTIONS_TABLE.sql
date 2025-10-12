-- Fix subscriptions table - add missing columns for subscription management
-- Based on previous fixes for subscription functionality

-- Add missing subscription columns
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'wallet',
ADD COLUMN IF NOT EXISTS revolut_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS failed_payments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_metadata JSONB DEFAULT '{}';

-- Update existing subscriptions to have proper dates
UPDATE subscriptions 
SET 
  current_period_start = created_at,
  current_period_end = created_at + INTERVAL '1 month',
  next_billing_date = created_at + INTERVAL '1 month'
WHERE current_period_start IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period ON subscriptions(current_period_start, current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_revolut_id ON subscriptions(revolut_subscription_id);

-- Ensure proper constraints
ALTER TABLE subscriptions 
ALTER COLUMN billing_cycle SET DEFAULT 'monthly',
ALTER COLUMN auto_renew SET DEFAULT true,
ALTER COLUMN payment_method SET DEFAULT 'wallet';

COMMENT ON COLUMN subscriptions.current_period_start IS 'Start date of current billing period';
COMMENT ON COLUMN subscriptions.current_period_end IS 'End date of current billing period';
COMMENT ON COLUMN subscriptions.billing_cycle IS 'Billing frequency: monthly, yearly';
COMMENT ON COLUMN subscriptions.next_billing_date IS 'Next scheduled billing date';
COMMENT ON COLUMN subscriptions.payment_method IS 'Payment method: wallet, revolut, stripe';
COMMENT ON COLUMN subscriptions.revolut_subscription_id IS 'Revolut subscription ID for external billing';
COMMENT ON COLUMN subscriptions.subscription_metadata IS 'Additional subscription metadata as JSON';
