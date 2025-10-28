-- Affiliate Program System for MSC & Co
-- Turn your users into your sales team!

-- Affiliate links table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Affiliate code (e.g., 'JOHN123')
  affiliate_code TEXT UNIQUE NOT NULL,
  
  -- Commission settings
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- 10% recurring
  
  -- Stats
  total_referrals INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0, -- Paid subscribers
  total_earned DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate conversions (when someone signs up via affiliate link)
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID NOT NULL REFERENCES affiliate_links(id) ON DELETE CASCADE,
  
  -- Referred user
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Commission details
  subscription_amount DECIMAL(10,2),
  commission_amount DECIMAL(10,2),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_links_code ON affiliate_links(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_user ON affiliate_links(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_link ON affiliate_conversions(affiliate_link_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_referred ON affiliate_conversions(referred_user_id);

-- RLS Policies
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- Users can view their own affiliate link
CREATE POLICY "Users can view own affiliate link" ON affiliate_links
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own conversions
CREATE POLICY "Users can view own conversions" ON affiliate_conversions
  FOR SELECT
  USING (
    affiliate_link_id IN (
      SELECT id FROM affiliate_links WHERE user_id = auth.uid()
    )
  );

-- Function to generate unique affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  first_name TEXT;
  code TEXT;
  is_unique BOOLEAN;
BEGIN
  -- Get user's first name
  SELECT up.first_name INTO first_name
  FROM user_profiles up
  WHERE up.id = user_uuid;
  
  -- Generate code
  LOOP
    code := UPPER(COALESCE(first_name, 'USER')) || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if unique
    SELECT NOT EXISTS(
      SELECT 1 FROM affiliate_links WHERE affiliate_code = code
    ) INTO is_unique;
    
    EXIT WHEN is_unique;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to track referral (call this when user signs up)
CREATE OR REPLACE FUNCTION track_affiliate_referral(
  referred_user_uuid UUID,
  referral_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  affiliate_id UUID;
BEGIN
  -- Find affiliate link
  SELECT id INTO affiliate_id
  FROM affiliate_links
  WHERE affiliate_code = referral_code
    AND is_active = TRUE;
  
  IF affiliate_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update referral count
  UPDATE affiliate_links
  SET total_referrals = total_referrals + 1,
      updated_at = NOW()
  WHERE id = affiliate_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to record conversion (call this when referred user subscribes)
CREATE OR REPLACE FUNCTION record_affiliate_conversion(
  referred_user_uuid UUID,
  subscription_amt DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
  affiliate_id UUID;
  commission_amt DECIMAL;
  commission_pct DECIMAL;
BEGIN
  -- Find the affiliate who referred this user
  -- (You'll need to store the referral_code in user_profiles or a separate table)
  -- For simplicity, assuming you have a referral tracking mechanism
  
  -- Calculate commission (10%)
  SELECT al.id, al.commission_rate
  INTO affiliate_id, commission_pct
  FROM affiliate_links al
  -- JOIN your_referral_tracking_table rt ON rt.affiliate_code = al.affiliate_code
  -- WHERE rt.referred_user_id = referred_user_uuid
  LIMIT 1;
  
  IF affiliate_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  commission_amt := subscription_amt * (commission_pct / 100);
  
  -- Record conversion
  INSERT INTO affiliate_conversions (
    affiliate_link_id,
    referred_user_id,
    subscription_amount,
    commission_amount,
    status
  ) VALUES (
    affiliate_id,
    referred_user_uuid,
    subscription_amt,
    commission_amt,
    'pending'
  );
  
  -- Update affiliate stats
  UPDATE affiliate_links
  SET total_conversions = total_conversions + 1,
      total_earned = total_earned + commission_amt,
      updated_at = NOW()
  WHERE id = affiliate_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE affiliate_links IS 'Affiliate program - users can refer others and earn commissions';
COMMENT ON TABLE affiliate_conversions IS 'Track conversions from affiliate referrals';

