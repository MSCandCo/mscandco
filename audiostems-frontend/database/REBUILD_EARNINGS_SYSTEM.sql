-- MSC & Co Earnings System Rebuild
-- Complete wallet integration with pending income tracking

-- 1. Update earnings_entries table
ALTER TABLE earnings_entries ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE earnings_entries ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'awaiting_payment';
ALTER TABLE earnings_entries ADD COLUMN IF NOT EXISTS expected_payment_date DATE;
ALTER TABLE earnings_entries ADD COLUMN IF NOT EXISTS actual_payment_date DATE;

-- Add constraint for status
ALTER TABLE earnings_entries ADD CONSTRAINT check_status 
CHECK (status IN ('pending', 'processing', 'paid', 'held', 'disputed'));

-- Add constraint for payment_status
ALTER TABLE earnings_entries ADD CONSTRAINT check_payment_status 
CHECK (payment_status IN ('awaiting_payment', 'in_transit', 'completed'));

-- 2. Create artist_wallet table
CREATE TABLE IF NOT EXISTS artist_wallet (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  total_earned DECIMAL(10,2) DEFAULT 0,
  paid_out DECIMAL(10,2) DEFAULT 0,
  pending_balance DECIMAL(10,2) DEFAULT 0,
  processing_balance DECIMAL(10,2) DEFAULT 0,
  available_balance DECIMAL(10,2) DEFAULT 0,
  held_balance DECIMAL(10,2) DEFAULT 0,
  minimum_payout DECIMAL(10,2) DEFAULT 50,
  payout_method VARCHAR(50) DEFAULT 'bank_transfer',
  payout_schedule VARCHAR(20) DEFAULT 'monthly',
  last_payout_date DATE,
  next_payout_date DATE,
  currency VARCHAR(3) DEFAULT 'GBP',
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(artist_id)
);

-- 3. Create payout_history table
CREATE TABLE IF NOT EXISTS payout_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  payout_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  reference_number VARCHAR(100),
  initiated_date DATE DEFAULT CURRENT_DATE,
  completed_date DATE,
  earnings_included JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create function to auto-update wallet balances
CREATE OR REPLACE FUNCTION update_wallet_balances()
RETURNS TRIGGER AS $$
BEGIN
  -- Update wallet balances whenever earnings status changes
  UPDATE artist_wallet
  SET
    pending_balance = (
      SELECT COALESCE(SUM(amount), 0)
      FROM earnings_entries
      WHERE artist_id = NEW.artist_id AND status IN ('pending')
    ),
    processing_balance = (
      SELECT COALESCE(SUM(amount), 0)
      FROM earnings_entries
      WHERE artist_id = NEW.artist_id AND status = 'processing'
    ),
    available_balance = (
      SELECT COALESCE(SUM(amount), 0)
      FROM earnings_entries
      WHERE artist_id = NEW.artist_id AND status = 'paid' AND actual_payment_date IS NULL
    ),
    held_balance = (
      SELECT COALESCE(SUM(amount), 0)
      FROM earnings_entries
      WHERE artist_id = NEW.artist_id AND status = 'held'
    ),
    total_earned = (
      SELECT COALESCE(SUM(amount), 0)
      FROM earnings_entries
      WHERE artist_id = NEW.artist_id AND status != 'disputed'
    ),
    paid_out = (
      SELECT COALESCE(SUM(amount), 0)
      FROM earnings_entries
      WHERE artist_id = NEW.artist_id AND actual_payment_date IS NOT NULL
    ),
    updated_at = NOW()
  WHERE artist_id = NEW.artist_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger for automatic wallet updates
DROP TRIGGER IF EXISTS earnings_status_change ON earnings_entries;
CREATE TRIGGER earnings_status_change
  AFTER INSERT OR UPDATE ON earnings_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_balances();

-- Verification queries
SELECT 'Earnings system rebuild completed successfully' as message;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('earnings_entries', 'artist_wallet', 'payout_history')
ORDER BY table_name, ordinal_position;
