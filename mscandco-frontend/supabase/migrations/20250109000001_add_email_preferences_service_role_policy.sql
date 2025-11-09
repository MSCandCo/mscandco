-- Add service role policy for email_preferences table
-- This allows the service role to bypass RLS for API operations

-- Drop existing service role policy if it exists
DROP POLICY IF EXISTS "Service role can access email preferences" ON email_preferences;

-- Create service role policy
CREATE POLICY "Service role can access email preferences"
  ON email_preferences
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON email_preferences TO service_role;

COMMENT ON POLICY "Service role can access email preferences" ON email_preferences IS 
  'Allows service role to bypass RLS for API operations on email preferences';

