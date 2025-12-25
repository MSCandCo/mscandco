-- Fix onboarding_progress RLS policies
-- Add INSERT policy for authenticated users so Apollo onboarding can create records

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Service role can insert onboarding" ON onboarding_progress;

-- Allow authenticated users to insert their own onboarding records
CREATE POLICY "Users can insert own onboarding"
  ON onboarding_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Keep service role policy for admin operations
CREATE POLICY "Service role can insert onboarding"
  ON onboarding_progress
  FOR INSERT
  TO service_role
  WITH CHECK (true);

COMMENT ON POLICY "Users can insert own onboarding" ON onboarding_progress IS 'Allows authenticated users to create their own onboarding records';
COMMENT ON POLICY "Service role can insert onboarding" ON onboarding_progress IS 'Allows service role to insert onboarding records for admin operations';

