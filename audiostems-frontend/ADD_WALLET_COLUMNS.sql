-- Add wallet columns to subscriptions table
-- Run this in your Supabase SQL editor

-- Add wallet_balance column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='wallet_balance') THEN
        ALTER TABLE subscriptions ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00;
    END IF;
END $$;

-- Add wallet_currency column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='wallet_currency') THEN
        ALTER TABLE subscriptions ADD COLUMN wallet_currency VARCHAR(3) DEFAULT 'GBP';
    END IF;
END $$;

-- Add revolut_customer_id column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='revolut_customer_id') THEN
        ALTER TABLE subscriptions ADD COLUMN revolut_customer_id VARCHAR(255);
    END IF;
END $$;

-- Add revolut_subscription_id column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='revolut_subscription_id') THEN
        ALTER TABLE subscriptions ADD COLUMN revolut_subscription_id VARCHAR(255);
    END IF;
END $$;
