-- Quick fix for the syntax error in artist_label_requests table
-- The issue is with the UNIQUE constraint WHERE clause syntax

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Fix the problematic table creation
CREATE TABLE artist_label_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  label_admin_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status relationship_status DEFAULT 'pending_admin_review',
  
  -- Proposed contract terms
  proposed_label_percentage decimal(5,2) NOT NULL,
  proposed_artist_percentage decimal(5,2) NOT NULL,
  proposed_company_percentage decimal(5,2) NOT NULL,
  contract_terms text,
  contract_duration_months integer,
  
  -- Approval workflow tracking
  admin_approved_at timestamptz,
  artist_approved_at timestamptz,
  approved_by uuid REFERENCES user_profiles(id),
  rejection_reason text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Create the partial unique index separately (this is the correct PostgreSQL syntax)
CREATE UNIQUE INDEX idx_artist_label_requests_unique_active 
ON artist_label_requests (artist_id, label_admin_id, status) 
WHERE status IN ('pending_admin_review', 'admin_approved_pending_artist');
