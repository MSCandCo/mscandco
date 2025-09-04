-- Artist Requests System
-- Table to track label admin requests to artists

CREATE TABLE IF NOT EXISTS artist_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_label_id UUID NOT NULL REFERENCES auth.users(id),
  to_artist_id UUID NOT NULL REFERENCES auth.users(id),
  artist_first_name TEXT NOT NULL,
  artist_last_name TEXT NOT NULL,
  artist_email TEXT NOT NULL,
  label_admin_name TEXT NOT NULL,
  label_admin_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies
ALTER TABLE artist_requests ENABLE ROW LEVEL SECURITY;

-- Label admins can create and view their own requests
CREATE POLICY "Label admins can create requests" ON artist_requests
  FOR INSERT WITH CHECK (auth.uid() = from_label_id);

CREATE POLICY "Label admins can view their requests" ON artist_requests
  FOR SELECT USING (auth.uid() = from_label_id);

-- Artists can view and update requests sent to them
CREATE POLICY "Artists can view requests to them" ON artist_requests
  FOR SELECT USING (auth.uid() = to_artist_id);

CREATE POLICY "Artists can respond to requests" ON artist_requests
  FOR UPDATE USING (auth.uid() = to_artist_id);

-- Company admins and super admins can view all requests
CREATE POLICY "Admins can view all requests" ON artist_requests
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('company_admin', 'super_admin')
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_artist_requests_from_label ON artist_requests(from_label_id);
CREATE INDEX IF NOT EXISTS idx_artist_requests_to_artist ON artist_requests(to_artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_requests_status ON artist_requests(status);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_artist_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER artist_requests_updated_at
  BEFORE UPDATE ON artist_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_artist_requests_updated_at();
