-- COMPLETE WALLET SYSTEM REBUILD - NO PATCHING
-- Delete existing and rebuild with correct structure

-- =============================================
-- 1. CLEAN SLATE - DROP EXISTING WALLET SYSTEM
-- =============================================

-- Drop existing wallet_transactions table completely
DROP TABLE IF EXISTS wallet_transactions CASCADE;

-- Drop any related indexes or triggers
DROP INDEX IF EXISTS idx_wallet_transactions_user_id;
DROP INDEX IF EXISTS idx_wallet_transactions_type;
DROP INDEX IF EXISTS idx_wallet_transactions_created_at;
DROP INDEX IF EXISTS idx_wallet_transactions_source;

-- =============================================
-- 2. CREATE ENUMS (If they don't exist)
-- =============================================

DO $$ BEGIN
    CREATE TYPE transaction_type_enum AS ENUM (
        'revenue_payout', 'subscription_payment', 'withdrawal', 'deposit', 
        'refund', 'adjustment', 'commission', 'platform_fee'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- 3. REBUILD WALLET_TRANSACTIONS TABLE
-- =============================================

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Transaction details
    transaction_type transaction_type_enum NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    description TEXT NOT NULL,
    
    -- Balance tracking (NEW - required by API)
    balance_before DECIMAL(12,2) NOT NULL DEFAULT 0,
    balance_after DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Source tracking (CORRECT column names)
    source_type TEXT, -- 'release', 'subscription', 'manual', 'revolut'
    source_reference_id UUID, -- Generic reference ID
    release_id UUID, -- Specific release reference
    asset_id UUID, -- Specific asset reference
    
    -- Revenue period (for earnings)
    revenue_period_start DATE,
    revenue_period_end DATE,
    platform TEXT, -- 'spotify', 'apple_music', etc.
    
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

-- =============================================
-- 4. UPDATE USER_PROFILES FOR WALLET FIELDS
-- =============================================

-- Add wallet-related columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS negative_balance_allowed BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_credit_limit DECIMAL(12,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS releases_count INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS storage_used_mb INTEGER DEFAULT 0;

-- =============================================
-- 5. CREATE PROPER INDEXES
-- =============================================

CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX idx_wallet_transactions_source_type ON wallet_transactions(source_type);
CREATE INDEX idx_wallet_transactions_source_ref ON wallet_transactions(source_reference_id);
CREATE INDEX idx_wallet_transactions_release ON wallet_transactions(release_id);

-- =============================================
-- 6. ENABLE RLS AND CREATE POLICIES
-- =============================================

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Users can see their own wallet transactions
CREATE POLICY "users_own_wallet_transactions" ON wallet_transactions
    FOR SELECT
    USING (user_id = auth.uid());

-- Admins can see and manage all wallet transactions
CREATE POLICY "admins_all_wallet_transactions" ON wallet_transactions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            WHERE ura.user_id = auth.uid()
            AND ura.role_name IN ('company_admin', 'super_admin', 'distribution_partner')
        )
    );

-- Users can create their own transactions (for withdrawals, etc.)
CREATE POLICY "users_create_wallet_transactions" ON wallet_transactions
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- =============================================
-- 7. CREATE WALLET BALANCE UPDATE TRIGGER
-- =============================================

-- Function to update wallet balance when transactions are created
CREATE OR REPLACE FUNCTION update_user_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the user's wallet balance in user_profiles
    UPDATE user_profiles 
    SET 
        wallet_balance = NEW.balance_after,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_wallet_balance_trigger ON wallet_transactions;
CREATE TRIGGER update_wallet_balance_trigger
    AFTER INSERT ON wallet_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_wallet_balance();

-- =============================================
-- 8. INSERT SAMPLE WALLET DATA FOR TESTING
-- =============================================

-- Insert initial wallet balances for existing users
UPDATE user_profiles 
SET 
    wallet_balance = 1000.00,
    wallet_enabled = TRUE,
    negative_balance_allowed = CASE 
        WHEN id IN (
            SELECT ura.user_id 
            FROM user_role_assignments ura 
            WHERE ura.role_name = 'artist'
        ) THEN TRUE 
        ELSE FALSE 
    END,
    wallet_credit_limit = CASE 
        WHEN id IN (
            SELECT ura.user_id 
            FROM user_role_assignments ura 
            WHERE ura.role_name = 'artist'
        ) THEN 500.00 
        ELSE 0.00 
    END
WHERE wallet_balance IS NULL;

-- Insert sample transactions for testing
INSERT INTO wallet_transactions (
    user_id,
    transaction_type,
    amount,
    description,
    balance_before,
    balance_after,
    source_type,
    platform,
    processed,
    processed_at
) VALUES 
-- Artist transactions
((SELECT id FROM auth.users WHERE email = 'info@htay.co.uk'), 
 'revenue_payout', 245.67, 'October 2024 Spotify Revenue', 754.33, 1000.00, 'release', 'spotify', TRUE, NOW()),

-- Label Admin transactions  
((SELECT id FROM auth.users WHERE email = 'labeladmin@mscandco.com'), 
 'revenue_payout', 1250.00, 'October 2024 Label Commission', 750.00, 2000.00, 'release', 'multiple', TRUE, NOW()),

-- Distribution Partner transactions
((SELECT id FROM auth.users WHERE email = 'codegroup@mscandco.com'), 
 'commission', 2500.00, 'October 2024 Distribution Commission', 2500.00, 5000.00, 'release', 'multiple', TRUE, NOW())

ON CONFLICT DO NOTHING;

-- =============================================
-- 9. GRANT PERMISSIONS
-- =============================================

GRANT ALL ON wallet_transactions TO postgres, service_role;

-- =============================================
-- 10. VERIFICATION
-- =============================================

-- Verify the table was created correctly
SELECT 
    'wallet_transactions table created' as status,
    COUNT(*) as sample_transactions
FROM wallet_transactions;
