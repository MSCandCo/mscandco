-- Fix the database schema column references

-- First, let's check what columns actually exist in wallet_transactions
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wallet_transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Drop the problematic index if it exists
DROP INDEX IF EXISTS idx_wallet_transactions_source;

-- Recreate the index with correct column names (after we see what exists)
-- We'll add this after confirming the table structure

-- If the wallet_transactions table doesn't exist yet, create it with correct structure
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
        'revenue_payout', 'subscription_payment', 'withdrawal', 'deposit', 
        'refund', 'adjustment', 'commission', 'platform_fee'
    )),
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    description TEXT NOT NULL,
    
    -- Balance tracking
    balance_before DECIMAL(12,2) NOT NULL DEFAULT 0,
    balance_after DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Source tracking (corrected column names)
    source_type TEXT, -- 'release', 'subscription', 'manual', 'revolut'
    source_reference_id UUID,
    release_id UUID,
    asset_id UUID,
    
    -- Revenue period (for earnings)
    revenue_period_start DATE,
    revenue_period_end DATE,
    platform TEXT,
    
    -- Processing
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    processed_by_user_id UUID REFERENCES auth.users(id),
    
    -- Revolut integration
    revolut_transaction_id TEXT,
    revolut_status TEXT,
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the corrected indexes
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_source_type ON wallet_transactions(source_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_source_ref ON wallet_transactions(source_reference_id);
