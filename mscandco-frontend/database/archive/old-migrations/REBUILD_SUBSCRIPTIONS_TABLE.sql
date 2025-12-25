-- REBUILD SUBSCRIPTIONS TABLE FROM SCRATCH
-- Drop and recreate with all required columns for subscription management

-- Drop existing table and recreate properly
DROP TABLE IF EXISTS subscriptions CASCADE;

-- Create comprehensive subscriptions table
CREATE TABLE subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Subscription details
    tier VARCHAR(50) NOT NULL DEFAULT 'free',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    
    -- Pricing
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
    
    -- Revolut integration
    revolut_subscription_id VARCHAR(255),
    revolut_customer_id VARCHAR(255),
    revolut_payment_method_id VARCHAR(255),
    
    -- Period management
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    
    -- Subscription lifecycle
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment tracking
    last_payment_date TIMESTAMP WITH TIME ZONE,
    next_payment_date TIMESTAMP WITH TIME ZONE,
    failed_payment_attempts INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX idx_subscriptions_revolut_id ON subscriptions(revolut_subscription_id);
CREATE INDEX idx_subscriptions_current_period ON subscriptions(current_period_start, current_period_end);
CREATE INDEX idx_subscriptions_next_payment ON subscriptions(next_payment_date);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON subscriptions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admin full access" ON subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.raw_user_meta_data->>'role' = 'super_admin'
                OR auth.users.raw_user_meta_data->>'role' = 'company_admin'
            )
        )
    );

-- Grant permissions
GRANT ALL ON subscriptions TO service_role;
GRANT SELECT, INSERT, UPDATE ON subscriptions TO authenticated;

-- Insert test subscription for Henry Taylor
INSERT INTO subscriptions (
    user_id,
    tier,
    status,
    amount,
    currency,
    billing_cycle,
    current_period_start,
    current_period_end,
    next_payment_date,
    started_at
) VALUES (
    '0a060de5-1c94-4060-a1c2-860224fc348d', -- Henry Taylor
    'artist-starter',
    'active',
    9.99,
    'GBP',
    'monthly',
    NOW(),
    NOW() + INTERVAL '1 month',
    NOW() + INTERVAL '1 month',
    NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;