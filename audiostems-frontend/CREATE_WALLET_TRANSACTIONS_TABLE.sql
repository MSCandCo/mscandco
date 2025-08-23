-- Create wallet_transactions table for internal transaction tracking
-- This tracks all wallet activity (funding, subscriptions, refunds, etc.)

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'GBP' NOT NULL,
    description TEXT NOT NULL,
    
    -- Reference IDs for tracking
    revolut_payment_id VARCHAR(255), -- For funding transactions
    subscription_id UUID, -- For subscription payments
    refund_id UUID, -- For refunds
    
    -- Transaction status
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_revolut_payment ON wallet_transactions(revolut_payment_id);

-- RLS Policies
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Service role full access" ON wallet_transactions;

-- Create RLS policies
CREATE POLICY "Users can view own transactions" ON wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON wallet_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role needs full access for API operations
CREATE POLICY "Service role full access" ON wallet_transactions
    FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON wallet_transactions TO authenticated;
GRANT ALL ON wallet_transactions TO service_role;
