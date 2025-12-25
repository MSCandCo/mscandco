-- Simple payment tables for Revolut integration
-- Run this in Supabase SQL Editor

-- Create webhook_logs table
CREATE TABLE webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL,
    event_type TEXT NOT NULL,
    order_id TEXT,
    status TEXT NOT NULL,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallet_transactions table
CREATE TABLE wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    order_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add wallet_balance to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00;

-- Create indexes
CREATE INDEX idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX idx_webhook_logs_order_id ON webhook_logs(order_id);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);

-- Enable RLS
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies
CREATE POLICY "webhook_logs_policy" ON webhook_logs FOR ALL USING (true);
CREATE POLICY "wallet_transactions_policy" ON wallet_transactions FOR ALL USING (auth.uid() = user_id OR current_setting('role') = 'service_role');

-- Grant permissions
GRANT ALL ON webhook_logs TO service_role;
GRANT ALL ON wallet_transactions TO service_role;
GRANT ALL ON wallet_transactions TO authenticated;
