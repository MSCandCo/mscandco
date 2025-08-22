-- Create revenue_split_config table for storing revenue distribution settings

CREATE TABLE IF NOT EXISTS revenue_split_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL DEFAULT 'msc-co',
    
    -- Main percentage splits
    distribution_partner_percentage DECIMAL(5,2) NOT NULL DEFAULT 15.00 CHECK (distribution_partner_percentage >= 0 AND distribution_partner_percentage <= 100),
    company_admin_percentage DECIMAL(5,2) NOT NULL DEFAULT 10.00 CHECK (company_admin_percentage >= 0 AND company_admin_percentage <= 100),
    label_admin_percentage DECIMAL(5,2) NOT NULL DEFAULT 25.00 CHECK (label_admin_percentage >= 0 AND label_admin_percentage <= 100),
    artist_percentage DECIMAL(5,2) NOT NULL DEFAULT 75.00 CHECK (artist_percentage >= 0 AND artist_percentage <= 100),
    
    -- Partner information
    distribution_partner_name TEXT NOT NULL DEFAULT 'Code Group',
    
    -- Individual overrides (JSON objects)
    individual_label_admin_percentages JSONB DEFAULT '{}',
    individual_artist_percentages JSONB DEFAULT '{}',
    
    -- Audit fields
    updated_by_user_id UUID,
    updated_by_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_updated_by_user FOREIGN KEY (updated_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT unique_company_config UNIQUE (company_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_revenue_split_config_company ON revenue_split_config(company_id);
CREATE INDEX IF NOT EXISTS idx_revenue_split_config_updated_at ON revenue_split_config(updated_at DESC);

-- Enable RLS
ALTER TABLE revenue_split_config ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only company admins and super admins can access
CREATE POLICY "admin_revenue_split_access" ON revenue_split_config
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_role_assignments ura
            WHERE ura.user_id = auth.uid()
            AND ura.role_name IN ('company_admin', 'super_admin')
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_revenue_split_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_revenue_split_config_updated_at ON revenue_split_config;
CREATE TRIGGER update_revenue_split_config_updated_at
    BEFORE UPDATE ON revenue_split_config
    FOR EACH ROW
    EXECUTE FUNCTION update_revenue_split_config_updated_at();

-- Insert default configuration
INSERT INTO revenue_split_config (
    company_id,
    distribution_partner_percentage,
    company_admin_percentage,
    label_admin_percentage,
    artist_percentage,
    distribution_partner_name,
    individual_label_admin_percentages,
    individual_artist_percentages
) VALUES (
    'msc-co',
    15.00,
    10.00,
    25.00,
    75.00,
    'Code Group',
    '{}',
    '{}'
) ON CONFLICT (company_id) DO NOTHING;

-- Grant permissions
GRANT ALL ON revenue_split_config TO postgres, service_role;
