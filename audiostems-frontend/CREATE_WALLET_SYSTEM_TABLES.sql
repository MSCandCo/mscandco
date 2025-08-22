-- Create wallet system tables for revenue management and transactions

-- 1. Add wallet columns to user_profiles if they don't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS wallet_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS negative_balance_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS wallet_credit_limit DECIMAL(12,2) DEFAULT 0.00;

-- 2. Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    -- Transaction details
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('revenue_payout', 'subscription_payment', 'withdrawal', 'refund', 'adjustment', 'commission')),
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'GBP',
    
    -- Balance tracking
    balance_before DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    balance_after DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    
    -- Source information
    source_type TEXT CHECK (source_type IN ('revolut', 'platform_revenue', 'manual_adjustment', 'subscription', 'withdrawal')),
    source_reference_id TEXT, -- External transaction ID
    
    -- Release/Revenue context
    release_id UUID,
    revenue_period_start DATE,
    revenue_period_end DATE,
    platform TEXT, -- Spotify, Apple Music, etc.
    
    -- Processing status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    
    -- Additional info
    description TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_wallet_release FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE SET NULL
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_platform ON wallet_transactions(platform);

-- 4. Enable RLS
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Users can see their own transactions
CREATE POLICY "users_own_wallet_transactions" ON wallet_transactions
    FOR SELECT
    USING (user_id = auth.uid());

-- Admins can see all transactions
CREATE POLICY "admins_all_wallet_transactions" ON wallet_transactions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            WHERE ura.user_id = auth.uid()
            AND ura.role_name IN ('company_admin', 'super_admin')
        )
    );

-- Users can insert their own transactions (for withdrawals, etc.)
CREATE POLICY "users_create_wallet_transactions" ON wallet_transactions
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- 6. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wallet_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_wallet_transactions_updated_at ON wallet_transactions;
CREATE TRIGGER update_wallet_transactions_updated_at
    BEFORE UPDATE ON wallet_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_wallet_transactions_updated_at();

-- 8. Function to safely update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance(
    p_user_id UUID,
    p_transaction_type TEXT,
    p_amount DECIMAL(12,2),
    p_description TEXT DEFAULT NULL,
    p_source_type TEXT DEFAULT NULL,
    p_source_reference_id TEXT DEFAULT NULL,
    p_release_id UUID DEFAULT NULL,
    p_platform TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_current_balance DECIMAL(12,2);
    v_new_balance DECIMAL(12,2);
    v_wallet_enabled BOOLEAN;
    v_negative_allowed BOOLEAN;
    v_credit_limit DECIMAL(12,2);
    v_transaction_id UUID;
    v_result JSON;
BEGIN
    -- Get current wallet info
    SELECT 
        COALESCE(wallet_balance, 0),
        COALESCE(wallet_enabled, true),
        COALESCE(negative_balance_allowed, false),
        COALESCE(wallet_credit_limit, 0)
    INTO v_current_balance, v_wallet_enabled, v_negative_allowed, v_credit_limit
    FROM user_profiles
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;
    
    IF NOT v_wallet_enabled THEN
        RETURN json_build_object('success', false, 'error', 'Wallet is disabled');
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_current_balance + p_amount;
    
    -- Check negative balance limits
    IF v_new_balance < 0 AND NOT v_negative_allowed THEN
        RETURN json_build_object('success', false, 'error', 'Transaction would result in negative balance');
    END IF;
    
    IF v_new_balance < 0 AND ABS(v_new_balance) > v_credit_limit THEN
        RETURN json_build_object('success', false, 'error', 'Transaction would exceed credit limit');
    END IF;
    
    -- Create transaction record
    INSERT INTO wallet_transactions (
        user_id, transaction_type, amount, balance_before, balance_after,
        source_type, source_reference_id, release_id, platform,
        description, status, processed, processed_at
    ) VALUES (
        p_user_id, p_transaction_type, p_amount, v_current_balance, v_new_balance,
        p_source_type, p_source_reference_id, p_release_id, p_platform,
        p_description, 'completed', true, NOW()
    ) RETURNING id INTO v_transaction_id;
    
    -- Update user wallet balance
    UPDATE user_profiles 
    SET 
        wallet_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    v_result := json_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'previous_balance', v_current_balance,
        'new_balance', v_new_balance,
        'amount', p_amount
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant permissions
GRANT ALL ON wallet_transactions TO postgres, service_role;
GRANT EXECUTE ON FUNCTION update_wallet_balance TO postgres, service_role;
