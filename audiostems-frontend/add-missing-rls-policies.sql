-- =====================================================
-- ADD MISSING RLS POLICIES ONLY
-- For existing tables that need access permissions
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

DROP POLICY IF EXISTS "Users can insert their own artist profile" ON public.artists;
DROP POLICY IF EXISTS "Users can read their own artist profile" ON public.artists;
DROP POLICY IF EXISTS "Users can update their own artist profile" ON public.artists;

DROP POLICY IF EXISTS "Users can manage their own releases" ON public.releases;
DROP POLICY IF EXISTS "Users can read their own releases" ON public.releases;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for artists
CREATE POLICY "Users can insert their own artist profile" ON public.artists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own artist profile" ON public.artists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own artist profile" ON public.artists
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for releases
CREATE POLICY "Users can manage their own releases" ON public.releases
  FOR ALL USING (auth.uid() = artist_id);

-- Create RLS policies for change_requests
CREATE POLICY "Users can manage their own change requests" ON public.change_requests
  FOR ALL USING (auth.uid() = requester_id);

-- Create RLS policies for revenue_distributions
CREATE POLICY "Users can read their own revenue" ON public.revenue_distributions
  FOR SELECT USING (auth.uid() = artist_id OR auth.uid() = label_admin_id OR auth.uid() = company_admin_id);

-- Create RLS policies for wallet_transactions
CREATE POLICY "Users can read their own wallet transactions" ON public.wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

SELECT 'RLS policies added successfully!' as status;
