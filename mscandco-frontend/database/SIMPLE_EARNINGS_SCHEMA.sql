-- Simple Earnings System - Build on existing user_profiles structure
-- This works with existing database without breaking changes

-- 1. Create simple earnings_log table for tracking individual entries
CREATE TABLE IF NOT EXISTS earnings_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  earning_type VARCHAR(50) NOT NULL, -- streaming, sync, performance, etc
  platform VARCHAR(100),
  territory VARCHAR(100), 
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, held
  payment_date DATE,
  period_start DATE,
  period_end DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);

-- 2. Create wallet summary view (calculated from earnings_log)
CREATE OR REPLACE VIEW artist_wallet_summary AS
SELECT 
  artist_id,
  COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as available_balance,
  COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_balance,
  COALESCE(SUM(CASE WHEN status = 'held' THEN amount ELSE 0 END), 0) as held_balance,
  COALESCE(SUM(amount), 0) as total_earned,
  COUNT(*) as total_entries,
  MAX(created_at) as last_updated
FROM earnings_log
GROUP BY artist_id;

-- 3. Insert some test data for Henry Taylor
INSERT INTO earnings_log (artist_id, amount, earning_type, platform, territory, status, payment_date, notes, created_by) VALUES
('0a060de5-1c94-4060-a1c2-860224fc348d', 150.00, 'streaming', 'Spotify', 'United Kingdom', 'paid', '2025-09-15', 'Q3 2025 streaming royalties', '0a060de5-1c94-4060-a1c2-860224fc348d'),
('0a060de5-1c94-4060-a1c2-860224fc348d', 75.50, 'streaming', 'Apple Music', 'United States', 'paid', '2025-09-20', 'Q3 2025 streaming royalties', '0a060de5-1c94-4060-a1c2-860224fc348d'),
('0a060de5-1c94-4060-a1c2-860224fc348d', 200.00, 'sync', 'Netflix', 'Global', 'pending', NULL, 'Sync licensing deal pending payment', '0a060de5-1c94-4060-a1c2-860224fc348d'),
('0a060de5-1c94-4060-a1c2-860224fc348d', 89.25, 'streaming', 'YouTube Music', 'Canada', 'pending', NULL, 'Q4 2025 streaming - awaiting payment', '0a060de5-1c94-4060-a1c2-860224fc348d');

-- Verification
SELECT 'Simple earnings system created successfully' as message;
SELECT * FROM artist_wallet_summary WHERE artist_id = '0a060de5-1c94-4060-a1c2-860224fc348d';
