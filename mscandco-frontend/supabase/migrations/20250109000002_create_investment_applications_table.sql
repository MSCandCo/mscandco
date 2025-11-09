-- Migration: Create investment_applications table
-- Date: 2025-01-09
-- Purpose: Store investment partner applications

-- Create investment_applications table
CREATE TABLE IF NOT EXISTS investment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Applicant information
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  
  -- Investment details
  investment_amount VARCHAR(50) NOT NULL, -- e.g., '10000', '25000', '50000', 'custom'
  message TEXT NOT NULL,
  
  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'withdrawn')),
  
  -- Admin notes (internal use)
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  submitted_ip VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investment_applications_user_id ON investment_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_applications_status ON investment_applications(status);
CREATE INDEX IF NOT EXISTS idx_investment_applications_created_at ON investment_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_investment_applications_email ON investment_applications(email);

-- Enable RLS
ALTER TABLE investment_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own applications
CREATE POLICY "Users can view their own investment applications"
  ON investment_applications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users can insert their own investment applications"
  ON investment_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role can access investment applications"
  ON investment_applications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can view all applications
CREATE POLICY "Admins can view all investment applications"
  ON investment_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('super_admin', 'admin', 'company_admin')
    )
  );

-- Admins can update applications
CREATE POLICY "Admins can update investment applications"
  ON investment_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('super_admin', 'admin', 'company_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('super_admin', 'admin', 'company_admin')
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_investment_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER investment_applications_updated_at
  BEFORE UPDATE ON investment_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_investment_applications_updated_at();

-- Add comments for documentation
COMMENT ON TABLE investment_applications IS 'Stores investment partner applications for MSC & Co';
COMMENT ON COLUMN investment_applications.investment_amount IS 'Investment tier: 10000, 25000, 50000, or custom';
COMMENT ON COLUMN investment_applications.status IS 'Application status: pending, reviewing, approved, rejected, withdrawn';
COMMENT ON COLUMN investment_applications.admin_notes IS 'Internal notes for admin review process';

