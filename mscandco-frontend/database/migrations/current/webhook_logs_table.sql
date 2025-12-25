-- Create webhook_logs table for tracking webhook events
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider VARCHAR(50) NOT NULL, -- 'revolut', 'stripe', etc.
    event_type VARCHAR(100) NOT NULL, -- 'ORDER_COMPLETED', etc.
    order_id VARCHAR(255), -- External order/payment ID
    status VARCHAR(50) NOT NULL, -- 'processed', 'failed', 'ignored', 'error'
    data JSONB, -- Full webhook payload or processing result
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider_created ON webhook_logs(provider, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_order_id ON webhook_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);

-- Create wallet_transactions table for tracking wallet top-ups
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    external_reference VARCHAR(255), -- External reference (order ID, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference ON wallet_transactions(external_reference);

-- Add wallet_balance to user_profiles if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00;

-- Enable RLS on new tables
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for webhook_logs (admin access only)
CREATE POLICY "Admin can view webhook logs" ON webhook_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.email LIKE '%@mscandco.com' 
                OR auth.users.email = 'info@htay.co.uk'
            )
        )
    );

-- RLS policies for wallet_transactions (users can view their own)
CREATE POLICY "Users can view own wallet transactions" ON wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet transactions" ON wallet_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for webhook processing)
CREATE POLICY "Service role full access webhook_logs" ON webhook_logs
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role full access wallet_transactions" ON wallet_transactions
    FOR ALL USING (current_setting('role') = 'service_role');

-- Grant necessary permissions
GRANT ALL ON webhook_logs TO service_role;
GRANT ALL ON wallet_transactions TO service_role;
GRANT SELECT ON webhook_logs TO authenticated;
GRANT ALL ON wallet_transactions TO authenticated;
