-- Apollo Memory System - Persistent Intelligence Storage
-- Creates table for Apollo's learning, patterns, and insights

CREATE TABLE IF NOT EXISTS apollo_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('pattern', 'insight', 'workflow', 'preference', 'anomaly')),
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  confidence DECIMAL(3, 2) DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiration for temporary memories

  -- Index for fast lookups
  CONSTRAINT unique_user_memory UNIQUE (user_id, memory_type, key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_apollo_memory_user_id ON apollo_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_apollo_memory_type ON apollo_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_apollo_memory_created ON apollo_memory(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apollo_memory_user_type ON apollo_memory(user_id, memory_type);

-- Enable RLS
ALTER TABLE apollo_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own Apollo memories"
  ON apollo_memory
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Apollo memories"
  ON apollo_memory
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Apollo memories"
  ON apollo_memory
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Apollo memories"
  ON apollo_memory
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can access all memories (for Apollo Brain operations)
CREATE POLICY "Service role can access all Apollo memories"
  ON apollo_memory
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_apollo_memory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER apollo_memory_updated_at
  BEFORE UPDATE ON apollo_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_apollo_memory_timestamp();

-- Function to clean up expired memories
CREATE OR REPLACE FUNCTION clean_expired_apollo_memories()
RETURNS void AS $$
BEGIN
  DELETE FROM apollo_memory
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE apollo_memory IS 'Stores Apollo AI''s learned patterns, insights, and user-specific intelligence for persistent memory and continuous improvement';
COMMENT ON COLUMN apollo_memory.memory_type IS 'Type of memory: pattern (learned behaviors), insight (generated insights), workflow (executed workflows), preference (user preferences), anomaly (detected anomalies)';
COMMENT ON COLUMN apollo_memory.key IS 'Unique identifier for this specific memory within its type';
COMMENT ON COLUMN apollo_memory.value IS 'The actual memory data stored as JSON for flexibility';
COMMENT ON COLUMN apollo_memory.metadata IS 'Additional context about when/how this memory was learned';
COMMENT ON COLUMN apollo_memory.confidence IS 'Confidence level in this memory (0-1), used for machine learning optimization';
COMMENT ON COLUMN apollo_memory.expires_at IS 'Optional expiration timestamp for temporary memories that should be forgotten';
