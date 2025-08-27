-- Add only the missing tables and columns
-- Run this in Supabase SQL Editor

-- Create webhook_logs table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL,
    event_type TEXT NOT NULL,
    order_id TEXT,
    status TEXT NOT NULL,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add wallet_balance column to user_profiles (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'wallet_balance') THEN
        ALTER TABLE user_profiles ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00;
    END IF;
END $$;

-- Add order_reference column to wallet_transactions (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'wallet_transactions' AND column_name = 'order_reference') THEN
        ALTER TABLE wallet_transactions ADD COLUMN order_reference TEXT;
    END IF;
END $$;

-- Create indexes (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_order_id ON webhook_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_order_ref ON wallet_transactions(order_reference);

-- Enable RLS on webhook_logs
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "webhook_logs_policy" ON webhook_logs;
CREATE POLICY "webhook_logs_policy" ON webhook_logs FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON webhook_logs TO service_role;
GRANT SELECT ON webhook_logs TO authenticated;
