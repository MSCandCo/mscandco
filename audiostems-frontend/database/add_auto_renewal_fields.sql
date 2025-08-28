-- Add auto-renewal and notification fields to subscriptions table
-- Run this in Supabase SQL Editor

-- Add auto-renewal tracking columns
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS next_renewal_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_renewal_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS renewal_failure_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS renewal_failure_reason TEXT,
ADD COLUMN IF NOT EXISTS insufficient_funds_notified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS renewal_reminder_sent BOOLEAN DEFAULT false;

-- Create index for efficient renewal queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_renewal 
ON subscriptions(next_renewal_date, auto_renew, status);

-- Create index for renewal notifications
CREATE INDEX IF NOT EXISTS idx_subscriptions_notifications 
ON subscriptions(insufficient_funds_notified, renewal_reminder_sent, next_renewal_date);

-- Update existing subscriptions to set next_renewal_date
UPDATE subscriptions 
SET next_renewal_date = CASE 
  WHEN billing_cycle = 'monthly' THEN current_period_end + INTERVAL '1 month'
  WHEN billing_cycle = 'yearly' THEN current_period_end + INTERVAL '1 year'
  ELSE current_period_end + INTERVAL '1 month'
END
WHERE next_renewal_date IS NULL AND status = 'active';

-- Create subscription_notifications table for tracking alerts
CREATE TABLE IF NOT EXISTS subscription_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- 'insufficient_funds', 'renewal_reminder', 'renewal_failed', 'renewal_success'
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for efficient notification queries
CREATE INDEX IF NOT EXISTS idx_subscription_notifications_user 
ON subscription_notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_notifications_type 
ON subscription_notifications(notification_type, created_at DESC);

-- Enable RLS for subscription_notifications
ALTER TABLE subscription_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for subscription_notifications
CREATE POLICY "Users can view their own subscription notifications" 
ON subscription_notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscription notifications" 
ON subscription_notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own subscription notifications" 
ON subscription_notifications FOR UPDATE 
USING (auth.uid() = user_id);
