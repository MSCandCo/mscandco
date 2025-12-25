-- Simple Artist Requests Table Creation
-- Run this step by step in Supabase SQL Editor

-- Step 1: Create the table
CREATE TABLE IF NOT EXISTS artist_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_label_id UUID NOT NULL,
  to_artist_id UUID NOT NULL,
  artist_first_name TEXT NOT NULL,
  artist_last_name TEXT NOT NULL,
  artist_email TEXT NOT NULL,
  label_admin_name TEXT NOT NULL,
  label_admin_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Step 2: Add check constraint
ALTER TABLE artist_requests 
ADD CONSTRAINT artist_requests_status_check 
CHECK (status IN ('pending', 'accepted', 'declined'));

-- Step 3: Enable RLS
ALTER TABLE artist_requests ENABLE ROW LEVEL SECURITY;

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_artist_requests_from_label ON artist_requests(from_label_id);
CREATE INDEX IF NOT EXISTS idx_artist_requests_to_artist ON artist_requests(to_artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_requests_status ON artist_requests(status);
