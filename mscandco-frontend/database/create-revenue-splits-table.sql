-- ============================================================================
-- CREATE: revenue_splits table for individual split overrides
-- ============================================================================
-- This table stores individual revenue split overrides for artists and label admins
-- that differ from the default split configuration.
-- ============================================================================

CREATE TABLE IF NOT EXISTS revenue_splits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- User references (one of these will be set, not both)
  artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  label_admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Split percentages (must total 100%)
  artist_percentage DECIMAL(5,2) NOT NULL CHECK (artist_percentage >= 0 AND artist_percentage <= 100),
  label_percentage DECIMAL(5,2) NOT NULL CHECK (label_percentage >= 0 AND label_percentage <= 100),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Audit fields
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  effective_until TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT check_one_user CHECK (
    (artist_id IS NOT NULL AND label_admin_id IS NULL) OR
    (artist_id IS NULL AND label_admin_id IS NOT NULL)
  ),
  CONSTRAINT check_percentages_total CHECK (
    artist_percentage + label_percentage = 100
  )
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_revenue_splits_artist ON revenue_splits(artist_id) WHERE artist_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_revenue_splits_label_admin ON revenue_splits(label_admin_id) WHERE label_admin_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_revenue_splits_active ON revenue_splits(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE revenue_splits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- IMPORTANT: Service role needs full access for API operations
-- The service role bypasses RLS, but we still need policies for authenticated users

-- Allow service role full access (for API operations using service role key)
-- Note: Service role automatically bypasses RLS, but we include this for clarity
CREATE POLICY "revenue_splits_service_role_access" ON revenue_splits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated admins to read all splits
CREATE POLICY "revenue_splits_admin_read" ON revenue_splits
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'company_admin', 'label_admin')
  )
);

-- Allow authenticated admins to insert/update splits
CREATE POLICY "revenue_splits_admin_insert" ON revenue_splits
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'company_admin', 'label_admin')
  )
);

CREATE POLICY "revenue_splits_admin_update" ON revenue_splits
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'company_admin', 'label_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'company_admin', 'label_admin')
  )
);

CREATE POLICY "revenue_splits_admin_delete" ON revenue_splits
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'company_admin', 'label_admin')
  )
);

-- Allow artists to read their own splits
CREATE POLICY "revenue_splits_artist_read" ON revenue_splits
FOR SELECT
TO authenticated
USING (
  auth.uid() = artist_id OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'company_admin', 'label_admin')
  )
);

-- Allow label admins to read splits for their artists
CREATE POLICY "revenue_splits_label_read" ON revenue_splits
FOR SELECT
TO authenticated
USING (
  auth.uid() = label_admin_id OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'company_admin')
  )
);

-- Success message
SELECT '✅ revenue_splits table created successfully' as status;

