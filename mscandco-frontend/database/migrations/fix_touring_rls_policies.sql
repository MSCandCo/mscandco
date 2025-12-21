-- Fix RLS policies for touring tables
-- This ensures service role can access everything while maintaining user security

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own tours" ON tours;
DROP POLICY IF EXISTS "Users can create own tours" ON tours;
DROP POLICY IF EXISTS "Users can update own tours" ON tours;
DROP POLICY IF EXISTS "Users can delete own tours" ON tours;

-- Recreate policies with proper service role access
-- SELECT: Users can view their own tours + org tours
CREATE POLICY "Users can view own tours"
  ON tours FOR SELECT
  USING (
    auth.uid() = user_id OR
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: Users can create tours for themselves
CREATE POLICY "Users can create own tours"
  ON tours FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own tours
CREATE POLICY "Users can update own tours"
  ON tours FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own tours
CREATE POLICY "Users can delete own tours"
  ON tours FOR DELETE
  USING (auth.uid() = user_id);

-- Also fix tour_dates policies
DROP POLICY IF EXISTS "Users can view tour dates" ON tour_dates;
DROP POLICY IF EXISTS "Users can manage tour dates" ON tour_dates;

CREATE POLICY "Users can view tour dates"
  ON tour_dates FOR SELECT
  USING (
    tour_id IN (
      SELECT id FROM tours WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tour dates"
  ON tour_dates FOR ALL
  USING (
    tour_id IN (
      SELECT id FROM tours WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tour_id IN (
      SELECT id FROM tours WHERE user_id = auth.uid()
    )
  );

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON tours TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tour_dates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tour_crew TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hotels TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON travel_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON guest_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON songs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON setlists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON setlist_songs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tour_expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tour_revenue TO authenticated;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
